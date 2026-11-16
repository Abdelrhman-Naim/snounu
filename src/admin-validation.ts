import {isImageReference} from './image-reference.ts';
import type { AdminResource, Product } from './types';
type ValidationCatalog = { products: Pick<Product,'id'|'slug'|'categoryId'|'ingredientIds'>[]; categories: {id:string}[]; ingredients: {id:string}[] };
export function validateAdminRecord(resource:AdminResource, record:Record<string,unknown>, catalog:ValidationCatalog):string {
 if (['categories','ingredients','products'].includes(resource) && !String(record.name??'').trim()) return 'الاسم مطلوب.';
 if (['categories','products','banners'].includes(resource) && (typeof record.sort!=='number'||!Number.isFinite(record.sort)||record.sort<0)) return 'الترتيب يجب أن يكون رقماً غير سالب.';
 if (['products','banners'].includes(resource) && !isImageReference(String(record.image??''))) return 'الصورة مطلوبة: استخدم رابط HTTPS أو ملفاً من الصور المحلية.';
 if(resource==='products') {
  if(typeof record.price!=='number'||!Number.isFinite(record.price)||record.price<0) return 'السعر يجب أن يكون رقماً غير سالب.';
  if(record.previousPrice!==null&&(typeof record.previousPrice!=='number'||!Number.isFinite(record.previousPrice)||record.previousPrice<=record.price)) return 'السعر السابق يجب أن يكون أكبر من السعر الحالي.';
  if(!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(String(record.slug??''))||catalog.products.some(p=>p.id!==record.id&&p.slug===record.slug)) return 'الرابط المختصر مطلوب ويجب أن يكون فريداً؛ استخدم حروفاً وأرقاماً وشرطات.';
  if(!catalog.categories.some(c=>c.id===record.categoryId)) return 'اختر القسم الصحيح.';
  if(!Array.isArray(record.ingredientIds)||record.ingredientIds.some(id=>!catalog.ingredients.some(i=>i.id===id))) return 'اختر المكونات من القائمة المتاحة.';
 }
 return '';
}
export function canDeleteRecord(resource:AdminResource,id:string,products:Pick<Product,'categoryId'|'ingredientIds'>[]):boolean {
 return !products.some(p=>resource==='categories'?p.categoryId===id:resource==='ingredients'?p.ingredientIds.includes(id):false);
}
