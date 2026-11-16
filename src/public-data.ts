import type {Catalog} from './types';
import {decodeDocument} from './firestore-rest';
import {managedImageId,MAX_IMAGE_DATA_LENGTH} from './image-reference';
const env=import.meta.env;
const project=env.VITE_FIREBASE_PROJECT_ID||'snounu-a1440';
const key=env.VITE_FIREBASE_API_KEY||'AIzaSyARwmrKHZb05rTOKAF3J7LLfiOSZuxwXOM';
const base=`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents`;
async function request(path:string,body?:unknown):Promise<any>{
 const response=await fetch(base+path+(path.includes('?')?'&':'?')+'key='+encodeURIComponent(key),{method:body?'POST':'GET',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
 if(!response.ok){const e=Object.assign(new Error('تعذر تحميل البيانات. أعد المحاولة.'),{code:response.status===403?'permission-denied':'unavailable'});throw e;}
 return response.json();
}
async function rows(name:string,field?:string,value:unknown=true):Promise<any[]>{const filter=field?{where:{fieldFilter:{field:{fieldPath:field},op:'EQUAL',value:typeof value==='boolean'?{booleanValue:value}:{stringValue:value}}}}:{};const r=await request(':runQuery',{structuredQuery:{from:[{collectionId:'snounu_'+name}],...filter}});return r.filter((x:any)=>x.document).map((x:any)=>decodeDocument(x.document));}
let pending:Promise<Catalog>|undefined;
let expires=0;
export async function getCatalog():Promise<Catalog>{
 if(env.VITE_FIREBASE_USE_EMULATORS==='true'||env.VITE_FIREBASE_APP_CHECK_SITE_KEY)return(await import('./firebase')).getCatalog();
 if(pending&&Date.now()<expires)return pending;
 expires=Date.now()+15000;
 pending=Promise.all([rows('categories','published'),rows('ingredients'),rows('products','published'),rows('banners','published'),rows('reviews','status','approved'),request('/snounu_settings/main')]).then(([categories,ingredients,products,banners,reviews,settings])=>({categories:categories.sort((a,b)=>a.sort-b.sort),ingredients,products:products.sort((a,b)=>a.sort-b.sort),banners:banners.sort((a,b)=>a.sort-b.sort),reviews,settings:decodeDocument(settings) as unknown as Catalog['settings']})).catch(e=>{pending=undefined;throw e});
 return pending;
}
const images=new Map<string,Promise<string>>();
export function resolveImage(value:string):Promise<string>{
 const id=managedImageId(value);if(!id)return Promise.resolve(value);
 const existing=images.get(id);if(existing)return existing;
 const result=(env.VITE_FIREBASE_USE_EMULATORS==='true'||env.VITE_FIREBASE_APP_CHECK_SITE_KEY?import('./firebase').then(m=>m.readManagedImage(id)):request('/snounu_images/'+id).then(decodeDocument)).then(data=>{const s=data.dataUrl;if(typeof s!=='string'||s.length>MAX_IMAGE_DATA_LENGTH||!/^data:image\/webp;base64,UklGR[A-Za-z0-9+/=]+$/.test(s))throw new Error('صيغة الصورة غير صالحة');return s;}).catch(e=>{images.delete(id);throw e});
 images.set(id,result);return result;
}
export async function submitReview(...args:Parameters<typeof import('./firebase')['submitReview']>){return(await import('./firebase')).submitReview(...args);}
export async function submitContact(...args:Parameters<typeof import('./firebase')['submitContact']>){return(await import('./firebase')).submitContact(...args);}
export async function enableAnalytics(){return(await import('./firebase')).enableAnalytics();}
