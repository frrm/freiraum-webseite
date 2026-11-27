import { chromium } from 'playwright';
import axe from 'axe-core';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(process.argv[2]);
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path = resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!path.startsWith(root + '/') && path !== root) { res.writeHead(403); return res.end(); }
  if (!extname(path)) path = resolve(path, 'index.html');
  try {
    const type = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(path)];
    if (type) res.setHeader('Content-Type', type);
    res.end(readFileSync(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const toggle = page.getByRole('checkbox', { name: 'Menu' });
  const nav = page.locator('#main-nav');
  assert.equal(await nav.isVisible(), false);
  for (let i = 0; i < 20 && !(await toggle.evaluate(el => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Space');
  assert.equal(await nav.isVisible(), true);
  assert.equal(await toggle.isChecked(), true);
  await page.keyboard.press('Space');
  assert.equal(await nav.isVisible(), false);
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(() => axe.run('#social-icons', { runOnly: ['link-name'] }));
  assert.deepEqual(results.violations, []);
  console.log('Mobile keyboard menu and social link names passed');
} finally { await browser.close(); server.close(); }
