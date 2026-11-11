const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {const browser = await chromium.launch();
for (const path of ['/ccc/chaosseminar/','/en/ccc/chaosseminar/']) {
 const page = await browser.newPage(); await page.goto((process.env.SITE_URL || 'http://127.0.0.1:18419')+path);
 const filter = page.locator('[data-seminar-filter]'); await filter.waitFor();
 const all = await page.locator('.seminar-archive li').count(); assert(all>20);
 const options = await filter.locator('[name=year] option').evaluateAll(x=>x.map(y=>y.value)); const year=options[1];
 await filter.locator('[name=year]').selectOption(year);
 const shown=await page.locator('.seminar-archive li:visible').evaluateAll(x=>x.map(y=>y.dataset.year)); assert(shown.length>0 && shown.length<all && shown.every(v=>v===year));
 await filter.locator('[name=year]').selectOption('all'); await filter.locator('[name=media]').selectOption('video');
 const vids=await page.locator('.seminar-archive li:visible').evaluateAll(x=>x.map(y=>y.dataset.media)); assert(vids.length>0 && vids.every(v=>v.split(' ').includes('video')));
 console.log(path,all,year,shown.length,'videos',vids.length); await page.close();
 const nojs=await browser.newPage({javaScriptEnabled:false}); await nojs.goto((process.env.SITE_URL || 'http://127.0.0.1:18419')+path); assert.equal(await nojs.locator('.seminar-archive li:visible').count(),all); await nojs.close();
} await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
