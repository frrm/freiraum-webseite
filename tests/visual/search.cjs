const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = process.env.SITE_URL || 'http://host.docker.internal:18417';
  await page.goto(base + '/search/');
  const input = page.locator('.pagefind-ui__search-input');
  await input.waitFor();
  for (const [query, path] of [
    ['Erde bei Nacht', '/ccc/chaosseminar/2011_03_nacht/'],
    ['Einzelbildern', '/ccc/chaosseminar/2011_03_nacht/'],
    ['Felix Paetzold', '/ccc/chaosseminar/2011_03_nacht/'],
    ['Schlüssel', '/post/'],
  ]) {
    await input.fill(query);
    await page.locator('.pagefind-ui__message').filter({ hasText: query }).waitFor();
    await page.locator(`.pagefind-ui__result-link[href*="${path}"]`).first().waitFor();
  }
  await input.fill('qwertyzzzzzzzzz');
  await page.getByText(/keine Ergebnisse/i).first().waitFor();
  await page.route('**/pagefind/pagefind-entry.json', route => route.abort());
  await page.reload();
  await page.getByRole('status').getByText(/konnte nicht geladen/).waitFor();
  const english = await browser.newPage();
  await english.goto(base + '/en/search/');
  await english.locator('.pagefind-ui__search-input').fill('Freiraum');
  await english.locator('.pagefind-ui__result-link').first().waitFor();
  const links = await english.locator('.pagefind-ui__result-link').evaluateAll(items => items.map(item => item.href));
  assert(links.every(link => new URL(link).pathname.startsWith('/en/')), 'English results stay in the English section');
  const noJs = await browser.newPage({ javaScriptEnabled: false });
  for (const path of ['/search/', '/en/search/']) {
    await noJs.goto(base + path);
    const archives = await noJs.locator('main article a').evaluateAll(items => items.map(item => item.href));
    assert(archives.length >= 2, 'Search offers archive links without JavaScript');
    for (const link of archives) assert((await noJs.request.get(link)).ok(), link);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
