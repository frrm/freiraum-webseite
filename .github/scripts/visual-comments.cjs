const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const marker = route => `<!-- visual-review-page:${crypto.createHash('sha256').update(route).digest('hex')} -->`;

function validPng(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.size < 33 || stat.size > 10 * 1024 * 1024) return false;
  const fd = fs.openSync(file, 'r');
  const header = Buffer.alloc(24);
  try { if (fs.readSync(fd, header, 0, 24, 0) !== 24) return false; }
  finally { fs.closeSync(fd); }
  if (!header.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ||
      header.readUInt32BE(8) !== 13 || header.toString('ascii', 12, 16) !== 'IHDR') return false;
  const width = header.readUInt32BE(16), height = header.readUInt32BE(20);
  return width > 0 && height > 0 && width <= 4096 && height <= 4096 && width * height <= 8_000_000;
}

function readReport(directory, head, base) {
  const index = path.join(directory, 'index.html');
  if (!fs.lstatSync(index).isFile() || fs.statSync(index).size > 2 * 1024 * 1024) throw Error('Invalid report index');
  const html = fs.readFileSync(index, 'utf8');
  if (!/^[a-f0-9]{40}$/.test(head) || !/^[a-f0-9]{40}$/.test(base) ||
      !html.includes(`Base: ${base}; head: ${head}.`)) throw Error('Report does not match the current PR revisions');
  const pages = new Map();
  for (const section of html.matchAll(/<section><h2>([^<]+) — desktop \/ light:[\s\S]*?<\/section>/g)) {
    const route = section[1];
    if (!/^\/[^\s<>`]*$/.test(route)) throw Error('Invalid report route');
    const images = {};
    let name = `changed-${Buffer.from(route).toString('hex')}`;
    for (const match of section[0].matchAll(/<a href="([^"\n]+)-(before|after|diff)\.png">/g)) {
      if (!/^[a-z0-9-]+-desktop-light$/.test(match[1])) throw Error('Invalid screenshot filename');
      const filename = `${match[1]}-${match[2]}.png`;
      const file = path.join(directory, filename);
      if (!validPng(file)) throw Error('Invalid screenshot');
      name = match[1].replace(/-desktop-light$/, '');
      images[match[2]] = filename;
    }
    pages.set(route, {route, name, ...images});
  }
  if (!pages.size) throw Error('Report contains no page comparisons');
  return pages;
}

function selectPages(pages, files) {
  const translationsOnly = files.length > 0 && files.every(file => file.filename.startsWith('content/') && file.filename.endsWith('.en.md'));
  return [...pages.values()].filter(page => !translationsOnly || page.route.startsWith('/en/'));
}

function eligiblePr(pr, repository) {
  return pr.head.repo?.full_name === repository && pr.head.ref.startsWith('modernize/');
}

function selectRun(runs, pr, repository) {
  return runs.filter(item => item.event === 'pull_request' && item.head_sha === pr.head.sha &&
    item.head_repository?.full_name === repository && item.head_branch === pr.head.ref &&
    item.pull_requests?.some(link => link.number === pr.number && link.base.sha === pr.base.sha))
    .sort((a, b) => b.id - a.id)[0];
}

function commentBody(page, pr, images, report, comparison) {
  const image = kind => images[kind] ? `![${kind}](${images[kind]})` : 'Not published in this revision';
  return `${marker(page.route)}\n**Visual review: \`${page.route}\`**\n\nHead: \`${pr.head.sha}\`; base: \`${pr.base.sha}\`.\n\n${comparison}\n\n| Before | After | Pixel diff |\n| --- | --- | --- |\n| ${image('before')} | ${image('after')} | ${images.diff ? image('diff') : 'No comparable baseline'} |\n\n[Full desktop/mobile and light/dark report](${report}). Captures use a fixed clock and local calendar fixtures. Draft or removed pages may have no published screenshot.\n`;
}

async function publish({ github, context, core }) {
  const { owner, repo } = context.repo;
  const repository = `${owner}/${repo}`;
  const git = (...args) => execFileSync('git', ['-C', 'evidence', ...args], {encoding: 'utf8'}).trim();
  git('config', 'user.name', 'github-actions[bot]');
  git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
  const { PNG } = require(path.resolve('publisher/tests/visual/node_modules/pngjs'));
  const pixelmatch = (await import(pathToFileURL(path.resolve('publisher/tests/visual/node_modules/pixelmatch/index.js')).href)).default;
  let prs = await github.paginate(github.rest.pulls.list, {owner, repo, state: 'open', per_page: 100});
  prs = prs.filter(pr => eligiblePr(pr, repository));
  if (context.payload.inputs?.pull_request) prs = prs.filter(pr => String(pr.number) === context.payload.inputs.pull_request);
  let incomplete = false;
  for (const initial of prs.sort((a, b) => a.number - b.number)) {
    let tmp;
    try {
    const pr = (await github.rest.pulls.get({owner, repo, pull_number: initial.number})).data;
    if (!eligiblePr(pr, repository)) continue;
    const response = await github.rest.actions.listWorkflowRuns({owner, repo, workflow_id: 'visual-review.yml', head_sha: pr.head.sha, per_page: 100});
    const run = selectRun(response.data.workflow_runs, pr, repository);
    if (run?.status !== 'completed' || run.conclusion !== 'success') {
      core.warning(`PR #${pr.number}: current visual CI is not successful yet`);
      if (context.eventName !== 'workflow_run') incomplete = true;
      continue;
    }
    const artifacts = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, {owner, repo, run_id: run.id, per_page: 100});
    const artifact = artifacts.find(item => item.name === `visual-review-${pr.head.sha}` && !item.expired);
    if (!artifact) throw Error(`PR #${pr.number}: missing visual report`);
    if (artifact.size_in_bytes > 256 * 1024 * 1024) throw Error(`PR #${pr.number}: visual report exceeds size limit`);
    fs.mkdirSync('reports', {recursive: true});
    tmp = fs.mkdtempSync(path.resolve('reports/visual-'));
    const archive = path.join(tmp, 'report.zip');
    const directory = path.join(tmp, 'files');
    const fd = fs.openSync(archive, 'wx');
    try { execFileSync('gh', ['api', `repos/${repository}/actions/artifacts/${artifact.id}/zip`], {stdio: ['ignore', fd, 'ignore']}); }
    finally { fs.closeSync(fd); }
    execFileSync('python3', ['publisher/.github/scripts/extract-visual.py', archive, directory], {stdio: 'ignore'});
    const pages = readReport(directory, pr.head.sha, pr.base.sha);
    const files = await github.paginate(github.rest.pulls.listFiles, {owner, repo, pull_number: pr.number, per_page: 100});
    const selected = selectPages(pages, files);
    if (!selected.length) throw Error(`PR #${pr.number}: no changed-page screenshots selected`);
    const comments = await github.paginate(github.rest.issues.listComments, {owner, repo, issue_number: pr.number, per_page: 100});
    const todo = selected.filter(page => !comments.some(comment => comment.user?.login === 'github-actions[bot]' && comment.body.includes(marker(page.route)) && comment.body.includes(`Head: \`${pr.head.sha}\`; base: \`${pr.base.sha}\``)));
    if (!todo.length) { core.info(`PR #${pr.number}: comments already current`); continue; }
    git('pull', '--ff-only', 'origin', 'review/modernization-screenshots');
    const target = `pr-${pr.number}/${pr.head.sha}`;
    fs.mkdirSync(path.join('evidence', target), {recursive: true});
    const prepared = [];
    for (const page of todo) {
      const images = {...page};
      let comparison = 'Before and after show this page at the two revisions above.';
      const source = page.route.startsWith('/en/') ? pages.get(page.route.slice(3)) : undefined;
      if (!page.before && source?.before && page.after) {
        images.before = source.before;
        const a = PNG.sync.read(fs.readFileSync(path.join(directory, source.before)));
        const b = PNG.sync.read(fs.readFileSync(path.join(directory, page.after)));
        if (a.width !== b.width || a.height !== b.height) throw Error('Screenshot dimensions differ');
        const diff = new PNG({width: a.width, height: a.height});
        pixelmatch(a.data, b.data, diff.data, a.width, a.height, {threshold: 0.1});
        images.diff = `${page.name}-translation-diff.png`;
        fs.writeFileSync(path.join(directory, images.diff), PNG.sync.write(diff));
        comparison = 'New English page: **before is the German source at the base commit**, after is the new English translation. The diff compares those two language versions.';
      } else if (!page.before) comparison = 'This page has no published baseline; a same-page pixel diff is unavailable.';
      const destinations = {};
      for (const kind of ['before', 'after', 'diff']) if (images[kind]) {
        const filename = `${page.name}-${kind}.png`;
        fs.copyFileSync(path.join(directory, images[kind]), path.join('evidence', target, filename));
        destinations[kind] = `${target}/${filename}`;
      }
      prepared.push({page, destinations, comparison});
    }
    const current = (await github.rest.pulls.get({owner, repo, pull_number: pr.number})).data;
    if (current.head.sha !== pr.head.sha || current.base.sha !== pr.base.sha) throw Error(`PR #${pr.number} changed during publication; retry with its new report`);
    git('add', '--', target);
    try { git('diff', '--cached', '--quiet'); }
    catch { git('commit', '-m', `Visual evidence for PR #${pr.number} at ${pr.head.sha}`); git('push', 'origin', 'HEAD:review/modernization-screenshots'); }
    const revision = git('rev-parse', 'HEAD');
    for (const {page, destinations, comparison} of prepared) {
      await pause(1250);
      const latest = (await github.rest.pulls.get({owner, repo, pull_number: pr.number})).data;
      if (latest.head.sha !== pr.head.sha || latest.base.sha !== pr.base.sha || latest.head.repo?.full_name !== repository) throw Error(`PR #${pr.number} changed during comment publication`);
      const images = Object.fromEntries(Object.entries(destinations).map(([kind, file]) => [kind, `https://raw.githubusercontent.com/${repository}/${revision}/${file}`]));
      const body = commentBody(page, pr, images, `${context.serverUrl}/${repository}/actions/runs/${run.id}/artifacts/${artifact.id}`, comparison);
      const existing = comments.find(comment => comment.user?.login === 'github-actions[bot]' && comment.body.includes(marker(page.route)));
      if (existing) await github.rest.issues.updateComment({owner, repo, comment_id: existing.id, body});
      else await github.rest.issues.createComment({owner, repo, issue_number: pr.number, body});
    }
    core.info(`PR #${pr.number}: published ${prepared.length} page comments`);
    } catch (error) {
      incomplete = true;
      core.warning(`PR #${initial.number}: ${error.message}`);
    } finally {
      if (tmp) fs.rmSync(tmp, {recursive: true, force: true});
    }
  }
  if (incomplete) core.setFailed('Some PRs still need successful visual reports; rerun after their checks finish.');
}
module.exports = { publish, readReport, selectPages, selectRun, eligiblePr, commentBody, marker };
