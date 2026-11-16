import {test,expect} from '@playwright/test';
test('admin category and message selects preserve validation, disabling and callbacks',async({page})=>{
 // UI integration fixture: no credentials or writes to production data.
 await page.route('**/node_modules/.vite/deps/firebase_auth.js*',route=>route.fulfill({contentType:'text/javascript',body:"export function onAuthStateChanged(auth,callback){queueMicrotask(()=>callback({uid:'admin',email:'admin@example.test',isAnonymous:false}));return ()=>{}}"}));
 await page.route('**/src/firebase.ts*',route=>route.fulfill({contentType:'text/javascript',body:"import {demoCatalog} from '/src/demo.ts';const data={...demoCatalog,messages:[{id:'m1',name:'اختبار الواجهة',phone:'0000000000',kind:'اقتراح',message:'رسالة اختبار واجهة',status:'new'}]};export const auth={currentUser:{uid:'admin'}};export async function isAdmin(){return true}export async function getAdminData(){return structuredClone(data)}export async function saveResource(resource,id,values){Object.assign(data[resource].find(x=>x.id===id),values)}export async function login(){}export async function logout(){}export async function deleteResource(){}export async function saveSettings(){}export async function uploadImage(){}export async function seedCatalog(){}"}));
 page.on('dialog',dialog=>dialog.accept());
 await page.goto('/admin');await expect(page.locator('.admin-shell')).toBeVisible();
 await page.locator('aside nav button').filter({hasText:'المنتجات'}).click();
 await page.getByRole('button',{name:'+ إضافة منتج',exact:true}).click();
 const category=page.getByRole('combobox',{name:'القسم',exact:true});
 await expect(category).toHaveAttribute('aria-required','true');
 expect(await page.locator('select[name="categoryId"]').evaluate(node=>(node as HTMLSelectElement).checkValidity())).toBe(false);
 await category.click();await page.getByRole('option',{name:'المقبلات',exact:true}).click();
 await expect(category).toContainText('المقبلات');
 expect(await page.locator('.admin-editor').evaluate(form=>new FormData(form as HTMLFormElement).get('categoryId'))).toBe('starters');
 expect(await page.locator('select[name="categoryId"]').evaluate(node=>(node as HTMLSelectElement).checkValidity())).toBe(true);
 await page.locator('.admin-editor fieldset').evaluate(node=>(node as HTMLFieldSetElement).disabled=true);await expect(category).toBeDisabled();
 await page.locator('.admin-editor fieldset').evaluate(node=>(node as HTMLFieldSetElement).disabled=false);
 await page.locator('aside nav button').filter({hasText:'الرسائل'}).click();
 const status=page.getByRole('combobox',{name:'حالة رسالة اختبار الواجهة',exact:true});
 await status.click();await page.getByRole('option',{name:'مقروءة',exact:true}).click();
 await expect(status).toContainText('مقروءة');await expect(page.getByRole('status')).toContainText('تم تحديث الحالة');
});

test('contact select is themed, keyboard accessible and resets its form value',async({page})=>{
 await page.goto('/contact?preview=1');
 const select=page.getByRole('combobox',{name:'نوع الملاحظة'});
 await expect(select).toHaveClass(/ui-select-trigger/);
 await select.focus();await page.keyboard.press('ArrowDown');
 await expect(page.getByRole('listbox')).toBeVisible();
 await page.getByRole('option',{name:'اقتراح',exact:true}).click();
 await expect(select).toContainText('اقتراح');
 expect(await page.locator('.contact-form').evaluate(form=>new FormData(form as HTMLFormElement).get('kind'))).toBe('اقتراح');
 await page.locator('.contact-form').evaluate(form=>(form as HTMLFormElement).reset());
 await expect(select).toContainText('استفسار');
 await select.click();await page.keyboard.press('Escape');await expect(select).toBeFocused();
});

test('admin has its own switch and preserves appearance across routes and reloads',async({page})=>{
 await page.goto('/admin');await page.evaluate(()=>localStorage.setItem('snounu:theme',JSON.stringify('dark')));await page.reload();
 await page.goto('/admin');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'تفعيل الوضع الفاتح'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('snounu:theme')!))).toBe('light');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.goto('/menu?preview=1');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'تفعيل الوضع الداكن'}).click();
 await page.goto('/admin');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});

for(const theme of ['light','dark'])test(`dropdown portal follows ${theme} theme on mobile`,async({page})=>{
 await page.setViewportSize({width:360,height:800});
 await page.addInitScript(theme=>localStorage.setItem('snounu:theme',JSON.stringify(theme)),theme);
 await page.goto('/contact?preview=1');await page.getByRole('combobox',{name:'نوع الملاحظة'}).click();
 const menu=page.getByRole('listbox');await expect(menu).toBeVisible();
 const colors=await menu.evaluate(node=>({color:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor,direction:getComputedStyle(node).direction}));
 expect(colors.color).not.toBe(colors.background);expect(colors.direction).toBe('rtl');
 const box=await menu.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(361);
});
