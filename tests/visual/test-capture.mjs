import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = mkdtempSync(join(tmpdir(), 'visual-dot-route-'));
try {
  for (const side of ['before', 'after']) {
    mkdirSync(join(root, side, 'guide.v2'), {recursive: true});
    writeFileSync(join(root, side, 'guide.v2/index.html'), `<html><body><h1>${side}</h1></body></html>`);
  }
  const routes = join(root, 'routes.json');
  writeFileSync(routes, JSON.stringify(['/guide.v2/']));
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./capture.mjs', import.meta.url)), join(root,'before'), join(root,'after'), join(root,'report')], {
    env: {...process.env, VISUAL_EXTRA: routes}, encoding: 'utf8', timeout: 120000,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  const prefix = `changed-${Buffer.from('/guide.v2/').toString('hex')}-desktop-light`;
  for (const kind of ['before','after','diff']) assert(existsSync(join(root,'report',`${prefix}-${kind}.png`)), kind);
  console.log('Screenshot server renders dotted directory routes and produces comparisons');
} finally { rmSync(root,{recursive:true,force:true}); }
