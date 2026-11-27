const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFileSync, statSync } = require('node:fs');
const { resolve, extname } = require('node:path');
const { chromium } = require('playwright');
const axe = require('axe-core');

const root = resolve(process.argv[2] || 'public');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + '/')) return res.writeHead(403).end();
    if (statSync(path).isDirectory()) path = resolve(path, 'index.html');
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' }).end(readFileSync(path));
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({ viewport, colorScheme: theme });
        await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
        const page = await context.newPage();
        for (const path of ['/', '/en/', '/contact/', '/en/contact/', '/categories/']) {
          assert((await page.goto(base + path, { waitUntil: 'networkidle' })).ok(), path);
          assert.equal(await page.locator('main#main').count(), 1, `${path}: main landmark`);
          assert(await page.locator('nav a').count(), `${path}: navigation`);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path}: horizontal overflow`);
          await page.addScriptTag({ content: axe.source });
          const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
          assert.deepEqual(result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`), [], `${path}: ${theme} ${viewport.width}`);
        }
        await page.goto(base + '/');
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), '#main');
        const toggle = page.locator('.theme-toggle');
        assert(await toggle.isVisible());
        await toggle.focus();
        await page.keyboard.press('Enter');
        const chosen = await page.locator('html').getAttribute('data-theme');
        assert.equal(chosen, theme === 'light' ? 'dark' : 'light');
        await page.reload();
        assert.equal(await page.locator('html').getAttribute('data-theme'), chosen);
        const navigation = page.locator('.navigation');
        const wasOpen = await navigation.getAttribute('open');
        await navigation.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.notEqual(await navigation.getAttribute('open'), wasOpen);
        await context.close();
      }
    }
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(base + '/en/');
    assert(await page.locator('main#main').isVisible());
    assert(await page.locator('nav a').count());
    assert.equal(await page.locator('.theme-toggle').isVisible(), false);
    await context.close();
    console.log('UI checks passed: desktop/mobile, light/dark, DE/EN, axe, keyboard and no JavaScript.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
