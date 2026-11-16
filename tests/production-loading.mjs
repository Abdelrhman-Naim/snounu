import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.LOADING_TEST_URL||'http://127.0.0.1:4173';
for(const route of ['/','/menu'])test(`slow JS and CSS on ${route} show only the loading indicator, then the page`,async()=>{
 const browser=await chromium.launch({args:['--no-sandbox']});let release;
 const gate=new Promise(resolve=>{release=resolve});
 try{
  const page=await browser.newPage();
  await page.route(/\/assets\/.*\.(js|css)(\?.*)?$/,async route=>{await gate;await route.continue().catch(()=>{})});
  await page.goto(base+route,{waitUntil:'commit'});
  await page.locator('#root').waitFor({state:'attached'});
  assert.equal((await page.locator('body').innerText()).trim(),'');
  assert.equal(await page.locator('#root').evaluate(node=>getComputedStyle(node).display),'grid');
  release();
  await page.locator(route==='/'?'.welcome':'.product-card').first().waitFor({timeout:20000});
  assert.equal(await page.locator('#root > main > nav').count(),0);
 }finally{release();await browser.close();}
});
test('text fallback remains visible when JavaScript is disabled',async()=>{
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{const page=await browser.newPage({javaScriptEnabled:false});await page.goto(base+'/menu',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('noscript main h1').isVisible(),true);assert.ok((await page.locator('noscript').innerText()).includes('قائمة الطعام'));}
 finally{await browser.close();}
});
