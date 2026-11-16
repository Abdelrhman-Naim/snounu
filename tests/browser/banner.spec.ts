import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.route('**/src/public-data.ts*',route=>route.fulfill({contentType:'text/javascript',body:"import {demoCatalog} from '/src/demo.ts';export async function getCatalog(){return {...demoCatalog,banners:[{id:'b1',image:'/assets/b0642.png',alt:'العرض الأول',url:'http://127.0.0.1:5173/contact?preview=1',published:true,sort:1},{id:'b2',image:'/assets/b0642.png',alt:'العرض الثاني',url:'http://127.0.0.1:5173/contact?preview=1',published:true,sort:2}]}}export async function resolveImage(s){return s}export async function submitReview(){}export async function submitContact(){}export async function enableAnalytics(){}"}));
});
test('mouse dragging changes slides, dots and keyboard work, links do not open during a drag',async({page})=>{
 await page.goto('/menu');const banner=page.locator('.banner');const box=(await banner.boundingBox())!;
 let popups=0;page.on('popup',()=>popups++);
 await page.mouse.move(box.x+box.width*.25,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5,{steps:8});await page.mouse.up();
 await expect(page.getByRole('button',{name:'عرض الإعلان 2'})).toHaveAttribute('aria-pressed','true');expect(popups).toBe(0);
 await page.getByRole('button',{name:'عرض الإعلان 1'}).click();
 await banner.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('button',{name:'عرض الإعلان 2'})).toHaveAttribute('aria-pressed','true');
 const popup=page.waitForEvent('popup');await banner.locator('a:not([tabindex="-1"])').click();const opened=await popup;await expect(opened).toHaveURL(/contact\?preview=1/);await opened.close();
});
test.describe('touch',()=>{
 test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
 test('horizontal swipes navigate both ways and vertical gestures do not change banners',async({page})=>{
  await page.goto('/menu');const box=(await page.locator('.banner').boundingBox())!;const cdp=await page.context().newCDPSession(page);
  const swipe=async(dx:number,dy:number)=>{const x=box.x+box.width*.3,y=box.y+box.height*.5;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let n=1;n<=5;n++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*n/5,y:y+dy*n/5}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  await swipe(130,0);await expect(page.getByRole('button',{name:'عرض الإعلان 2'})).toHaveAttribute('aria-pressed','true');
  await swipe(4,80);await expect(page.getByRole('button',{name:'عرض الإعلان 2'})).toHaveAttribute('aria-pressed','true');
  await swipe(-90,0);await expect(page.getByRole('button',{name:'عرض الإعلان 1'})).toHaveAttribute('aria-pressed','true');
 });
});
