import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const [before, after, output] = process.argv.slice(2).map(x => resolve(x));
if (!before || !after || !output) throw Error('Usage: node capture.mjs BEFORE AFTER OUTPUT');
mkdirSync(output, { recursive: true });
const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2' };
const calendar = readFileSync(new URL('./calendar.ics', import.meta.url), 'utf8');
const server = createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/kalender') { res.writeHead(200, {'Content-Type':'text/calendar'}); return res.end(calendar); }
  const parts = url.pathname.split('/'); const root = parts[1] === 'before' ? before : after;
  let path = resolve(root, '.' + decodeURIComponent('/' + parts.slice(2).join('/')));
  if (!path.startsWith(root + '/') && path !== root) { res.writeHead(403); return res.end(); }
  if (!extname(path)) path += '/index.html';
  if (!existsSync(path)) { res.writeHead(404); return res.end('Not present in this revision'); }
  res.writeHead(200, {'Content-Type':mime[extname(path)] || 'application/octet-stream'}); res.end(readFileSync(path));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await chromium.launch({headless:true});
const cases = [ ['home','/'], ['events','/events/'], ['events-calendar','/events/'], ['posts','/post/'], ['home-en','/en/'], ['events-en','/en/events/'], ['contact','/contact/'], ['seminars','/ccc/chaosseminar/'], ['gallery','/gallery/'], ['search','/search/'] ];
if (process.env.VISUAL_EXTRA) for (const path of JSON.parse(readFileSync(process.env.VISUAL_EXTRA, 'utf8'))) {
  if (!cases.some(([, existing]) => existing === path)) cases.push([`changed-${Buffer.from(path).toString('hex')}`, path]);
}
let rows = '';
try {
for (const [name, path] of cases) for (const [device, viewport] of [['desktop',{width:1365,height:900}], ['mobile',{width:390,height:844}]]) for (const theme of ['light','dark']) {
  const label = `${name}-${device}-${theme}`;
  let present = [];
  for (const [side, root] of [['before',before],['after',after]]) {
    const file = resolve(root, '.' + path, 'index.html');
    if (!existsSync(file)) { present.push(false); continue; }
    present.push(true);
    const context = await browser.newContext({viewport, colorScheme:theme, locale: path.startsWith('/en/') ? 'en-US' : 'de-DE', timezoneId:'Europe/Berlin', reducedMotion:'reduce'});
    await context.route('**/*', async route => {
      const u = new URL(route.request().url());
      if (u.hostname !== '127.0.0.1') return route.abort();
      if (/^\/(?:before\/|after\/)?kalender\/?$/.test(u.pathname)) return route.fulfill({status:200,contentType:'text/calendar',body:calendar});
      if (!u.pathname.startsWith('/before/') && !u.pathname.startsWith('/after/')) {
        u.pathname = `/${side}${u.pathname}`;
        return route.continue({url:u.toString()});
      }
      return route.continue();
    });
    const page = await context.newPage();
    await page.clock.install({time: new Date('2026-10-01T12:00:00Z')});
    const response = await page.goto(`http://127.0.0.1:${port}/${side}${path}`, {waitUntil:'networkidle'});
    if (!response.ok()) throw Error(`${label} ${side}: ${response.status()}`);
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
    await page.evaluate(() => document.fonts.ready);
    if (name === 'events-calendar' && await page.locator('#cal-app').count()) await page.locator('#cal-app').scrollIntoViewIfNeeded();
    await page.screenshot({path:`${output}/${label}-${side}.png`,animations:'disabled'});
    await context.close();
  }
  let diff = 'Not comparable';
  if (present.every(Boolean)) {
    const a = PNG.sync.read(readFileSync(`${output}/${label}-before.png`));
    const b = PNG.sync.read(readFileSync(`${output}/${label}-after.png`));
    if (a.width !== b.width || a.height !== b.height) throw Error(`Dimension mismatch: ${label}`);
    const d = new PNG({width:a.width,height:a.height});
    const count = pixelmatch(a.data,b.data,d.data,a.width,a.height,{threshold:0.1});
    writeFileSync(`${output}/${label}-diff.png`,PNG.sync.write(d));
    diff = `${count} pixels (${(100*count/(a.width*a.height)).toFixed(2)}%)`;
  }
  rows += `<section><h2>${path} — ${device} / ${theme}: ${diff}</h2><div class="images">${['before','after','diff'].map((side,i) => `<figure><figcaption>${side}</figcaption>${(i===2 ? present.every(Boolean) : present[i]) ? `<a href="${label}-${side}.png"><img src="${label}-${side}.png"></a>` : '<p>Not present in this revision</p>'}</figure>`).join('')}</div></section>`;
  console.log(label, diff);
}
writeFileSync(`${output}/index.html`, `<!doctype html><meta charset="utf-8"><title>Visual comparison</title><style>body{font:16px sans-serif;margin:2rem} .images{display:flex;gap:1rem} figure{margin:0;flex:1;min-width:0} img{width:100%;border:1px solid #aaa} section{margin:2rem 0}</style><h1>Visual comparison</h1><p>Base: ${process.env.VISUAL_BASE || "not supplied"}; head: ${process.env.VISUAL_HEAD || "not supplied"}.</p><p>Fixed time: 2026-10-01 12:00 UTC. Browser network restricted to local assets; calendar is a local fixture and build-time events data is empty. Missing pages are labelled. ${process.env.VISUAL_LEGACY === "true" ? "The original baseline requires build-only compatibility edits: pagination.pagerSize to paginate, empty events data and numeric formatter compatibility with Hugo 0.84.4." : ""}</p>${rows}`);
} finally { await browser.close(); server.close(); }
