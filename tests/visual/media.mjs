import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const site = resolve(process.argv[2]);
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2'
};
const server = createServer((req, res) => {
  let file = resolve(site, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
  if (file !== site && !file.startsWith(site + sep)) { res.writeHead(403); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pass = name => console.log(`PASS ${name}`);
const localOnly = async context => context.route('**/*', route =>
  new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
try {
  const context = await browser.newContext({ locale: 'de-DE' });
  await localOnly(context);
  const page = await context.newPage();

  await page.goto(`${base}/gallery/`);
  const opener = page.locator('a[href*="/images/"] img').first().locator('xpath=..');
  const firstHref = await opener.getAttribute('href');
  await opener.click();
  await page.waitForFunction(() => document.querySelector('.media-lightbox')?.open);
  const dialog = page.locator('.media-lightbox');
  const focusedClose = await page.evaluate(() => document.activeElement === document.querySelector('.media-lightbox [data-close]'));
  await page.keyboard.press('ArrowRight');
  const nextSrc = await dialog.locator('img').getAttribute('src');
  await page.keyboard.press('Escape');
  await page.waitForFunction(el => !document.querySelector('.media-lightbox').open && document.activeElement === el, await opener.elementHandle());
  assert.ok(focusedClose, 'gallery focuses its close button when opened');
  assert.ok(nextSrc && !nextSrc.endsWith(firstHref.split('/').pop()), 'ArrowRight advances to a different image');
  pass('DE gallery opens, navigates by keyboard, closes with Escape, and restores opener focus');

  await page.goto(`${base}/en/gallery/`);
  assert.equal(await page.locator('.media-lightbox').getAttribute('aria-label'), 'Image viewer');
  pass('EN gallery has localized dialog label');
  await context.close();

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  await localOnly(noJsContext);
  const noJs = await noJsContext.newPage();
  for (const [lang, prefix, labels] of [
    ['DE', '', ['Bildansicht', 'Interaktive Panoramaansicht starten']],
    ['EN', '/en', ['Image viewer', 'Start interactive panorama']]
  ]) {
    await noJs.goto(`${base}${prefix}/gallery/`);
    assert.equal(await noJs.locator('.media-lightbox').getAttribute('aria-label'), labels[0]);
    assert.ok(await noJs.locator('a[href*="/images/"] img').count() > 0, `${lang} gallery retains linked images without JavaScript`);
    await noJs.goto(`${base}${prefix}/about/`);
    const panoramaLink = noJs.locator('[data-panorama-start]');
    assert.equal(await panoramaLink.count(), 1);
    assert.ok((await panoramaLink.innerText()).includes(labels[1]));
    assert.ok((await panoramaLink.getAttribute('href')).includes('pano2_main.jpg'));
    pass(`${lang} gallery and panorama links remain usable without JavaScript`);
  }
  await noJs.goto(`${base}/post/post_2017-08-05/`);
  assert.ok(await noJs.locator('a[href*="youtube.com/watch"]').getByText('Direkt zu YouTube').count() > 0);
  pass('DE YouTube direct link remains usable without JavaScript');
  await noJsContext.close();

  const youtubeContext = await browser.newContext();
  const youtubeRequests = [];
  youtubeContext.on('request', request => { if (/youtube/i.test(request.url())) youtubeRequests.push(request.url()); });
  await localOnly(youtubeContext);
  const youtube = await youtubeContext.newPage();
  await youtube.goto(`${base}/post/post_2017-08-05/`);
  assert.equal(youtubeRequests.length, 0, 'YouTube makes no request before the explicit load action');
  await youtube.getByRole('button', { name: 'Video auf YouTube laden' }).click();
  await youtube.locator('iframe[src*="youtube-nocookie.com/embed/"]').waitFor();
  assert.ok(youtubeRequests.some(url => url.includes('youtube-nocookie.com/embed/G1m0aX9Lpts')));
  pass('YouTube player loads only after the user clicks');
  await youtubeContext.close();

  const panoramaContext = await browser.newContext();
  const panoramaRequests = [];
  panoramaContext.on('request', request => { if (/pannellum/i.test(request.url())) panoramaRequests.push(request.url()); });
  await panoramaContext.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/modules/pannellum.js') {
      const source = readFileSync(resolve(site, 'modules/pannellum.js'), 'utf8');
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: `${source}\n;window.__panoOriginal=pannellum.viewer;pannellum.viewer=function(id,config){window.__panoConfig=config;window.__panoInstance=window.__panoOriginal(id,config);return window.__panoInstance;};` });
    }
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  const panorama = await panoramaContext.newPage();
  await panorama.goto(`${base}/about/`);
  assert.equal(panoramaRequests.length, 0, 'Pannellum is not loaded before the user starts the panorama');
  await panorama.locator('[data-panorama-start]').click();
  await panorama.locator('.pnlm-container').waitFor();
  await panorama.waitForFunction(() => !!window.__panoInstance);
  await panorama.evaluate(() => window.__panoInstance.lookAt(-10, 168, 80, 0));
  await panorama.waitForFunction(() => document.querySelectorAll('.pnlm-hotspot.pnlm-scene').length >= 2);
  const config = await panorama.evaluate(() => window.__panoConfig.scenes.main.hotSpots);
  const hotspots = await panorama.locator('.pnlm-hotspot.pnlm-scene').evaluateAll(items => items.map(el => {
    const r = el.getBoundingClientRect(), v = el.closest('.pnlm-container').getBoundingClientRect();
    return { text: el.textContent, inViewer: r.width > 0 && r.height > 0 && r.left >= v.left && r.right <= v.right && r.top >= v.top && r.bottom <= v.bottom };
  }));
  assert.deepEqual(config.find(item => item.text === 'Werkstatt') && [config.find(item => item.text === 'Werkstatt').pitch, config.find(item => item.text === 'Werkstatt').yaw], [-10, 168]);
  assert.ok(hotspots.some(h => h.text.includes('Werkstatt') && h.inViewer));
  assert.ok(hotspots.some(h => h.text.includes('Chillout') && h.inViewer));
  await panorama.locator('.pnlm-hotspot.pnlm-scene').filter({ hasText: 'Werkstatt' }).click();
  await panorama.waitForFunction(() => [...document.querySelectorAll('.pnlm-hotspot.pnlm-scene')].some(el => el.textContent.includes('ain')));
  pass('Pannellum loads on demand, renders calibrated hotspots, and switches scenes');
  await panoramaContext.close();

  const fallbackContext = await browser.newContext();
  await fallbackContext.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/modules/pannellum.js') return route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.pannellum={viewer(){throw new Error("forced viewer failure")}};' });
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  const fallback = await fallbackContext.newPage();
  await fallback.goto(`${base}/about/`);
  await fallback.locator('[data-panorama-start]').click();
  await fallback.waitForFunction(() => document.querySelector('[data-panorama-start] span')?.textContent.includes('Laden fehlgeschlagen'));
  assert.equal(await fallback.locator('[data-panorama-start]').count(), 1);
  assert.ok((await fallback.locator('[data-panorama-start]').getAttribute('href')).includes('pano2_main.jpg'));
  pass('Pannellum viewer failure restores the direct-image fallback link');
  await fallbackContext.close();
} finally {
  await browser.close();
  server.close();
}
