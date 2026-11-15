import {initializeApp} from 'firebase/app';
import {getAuth, connectAuthEmulator, signInAnonymously, signInWithEmailAndPassword, signOut, type User} from 'firebase/auth';
import {getFirestore, connectFirestoreEmulator, collection, doc, getDoc, getDocs, query, where, limit, setDoc, deleteDoc, writeBatch, runTransaction, serverTimestamp, type QueryConstraint} from 'firebase/firestore';
import {getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import type {AdminData, AdminResource, Catalog, Settings} from './types';
import {demoCatalog} from './demo';

const env = import.meta.env;
const app = initializeApp({
  apiKey:env.VITE_FIREBASE_API_KEY || 'AIzaSyAOMjes8PtCUNfnFssDZWRy0ei7aH_juts',
  authDomain:env.VITE_FIREBASE_AUTH_DOMAIN || 'taskora-bf729.firebaseapp.com',
  projectId:env.VITE_FIREBASE_PROJECT_ID || 'taskora-bf729',
  storageBucket:env.VITE_FIREBASE_STORAGE_BUCKET || 'taskora-bf729.firebasestorage.app',
  messagingSenderId:env.VITE_FIREBASE_MESSAGING_SENDER_ID || '997225509918',
  appId:env.VITE_FIREBASE_APP_ID || '1:997225509918:web:3d8317f987cb685544ea0f',
  measurementId:env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Y0D3NB91P7',
});
export const auth=getAuth(app);
export const db=getFirestore(app);
export const storage=getStorage(app);
if (env.VITE_FIREBASE_USE_EMULATORS === 'true') {
  const host=env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
  connectAuthEmulator(auth,`http://${host}:9099`,{disableWarnings:true});
  connectFirestoreEmulator(db,host,8080);
  connectStorageEmulator(storage,host,9199);
}
const ready = env.VITE_FIREBASE_APP_CHECK_SITE_KEY && env.VITE_FIREBASE_USE_EMULATORS !== 'true'
  ? import('firebase/app-check').then(({initializeAppCheck,ReCaptchaV3Provider}) => {
      initializeAppCheck(app,{provider:new ReCaptchaV3Provider(env.VITE_FIREBASE_APP_CHECK_SITE_KEY),isTokenAutoRefreshEnabled:true});
    })
  : Promise.resolve();
// Analytics is never initialized at import: call only after explicit user consent.
let analyticsReady:Promise<void>|undefined;
export function enableAnalytics():Promise<void> {
  analyticsReady ??= import('firebase/analytics').then(async ({getAnalytics,isSupported}) => {
    if (await isSupported()) getAnalytics(app);
  });
  return analyticsReady;
}
const path=(resource:AdminResource)=>`snounu_${resource}`;
async function rows<T>(resource:AdminResource,...constraints:QueryConstraint[]):Promise<T[]> {
  const result=await getDocs(query(collection(db,path(resource)),...constraints));
  return result.docs.map(item=>({...item.data(),id:item.id}) as T);
}
async function settings(allowBootstrap=false):Promise<Settings> {
  const result=await getDoc(doc(db,'snounu_settings/main'));
  if (!result.exists() && allowBootstrap) return {...demoCatalog.settings};
  if (!result.exists()) throw new Error('لم تُضبط بيانات المطعم بعد. يرجى التواصل مع الإدارة.');
  return result.data() as Settings;
}
export async function getCatalog():Promise<Catalog> {
  await ready;
  const [categories,ingredients,products,banners,reviews,config]=await Promise.all([
    rows<Catalog['categories'][number]>('categories',where('published','==',true)),
    rows<Catalog['ingredients'][number]>('ingredients'),
    rows<Catalog['products'][number]>('products',where('published','==',true)),
    rows<Catalog['banners'][number]>('banners',where('published','==',true)),
    rows<Catalog['reviews'][number]>('reviews',where('status','==','approved')),
    settings(),
  ]);
  return {categories:categories.sort((a,b)=>a.sort-b.sort),ingredients,products:products.sort((a,b)=>a.sort-b.sort),banners:banners.sort((a,b)=>a.sort-b.sort),reviews,settings:config};
}
export async function isAdmin(user:User|null):Promise<boolean> {
  await ready;
  if (!user || user.isAnonymous) return false;
  const result=await getDoc(doc(db,'snounu_admins',user.uid));
  return result.exists() && result.data().enabled === true;
}
async function requireAdmin():Promise<void> {
  await auth.authStateReady();
  if (!(await isAdmin(auth.currentUser))) throw new Error('غير مصرح: يلزم حساب إدارة مفعّل.');
}
export async function getAdminData():Promise<AdminData> {
  await requireAdmin();
  const [categories,ingredients,products,banners,reviews,messages,config]=await Promise.all([
    rows<AdminData['categories'][number]>('categories'),rows<AdminData['ingredients'][number]>('ingredients'),
    rows<AdminData['products'][number]>('products'),rows<AdminData['banners'][number]>('banners'),
    rows<AdminData['reviews'][number]>('reviews'),rows<AdminData['messages'][number]>('messages'),settings(true),
  ]);
  return {categories,ingredients,products,banners,reviews,messages,settings:config};
}
export async function login(email:string,password:string):Promise<void> {
  await ready;
  const result=await signInWithEmailAndPassword(auth,email.trim(),password);
  if (!(await isAdmin(result.user))) {
    await signOut(auth);
    throw new Error('هذا الحساب غير مخوّل لإدارة سنونو.');
  }
}
export async function logout():Promise<void> {await signOut(auth);}
function validId(id:string):void {
  if (!id || id.includes('/') || id.length > 128) throw new Error('معرّف غير صالح.');
}
export async function saveResource(resource:AdminResource,id:string,data:Record<string,unknown>):Promise<void> {
  await requireAdmin(); validId(id);
  const {id:ignored,...payload}=data;
  void ignored;
  await setDoc(doc(db,path(resource),id),{...payload,updatedAt:serverTimestamp()},{merge:true});
}
export async function deleteResource(resource:AdminResource,id:string):Promise<void> {
  await requireAdmin(); validId(id); await deleteDoc(doc(db,path(resource),id));
}
export async function saveSettings(value:Settings):Promise<void> {
  await requireAdmin(); await setDoc(doc(db,'snounu_settings/main'),value);
}
export async function uploadImage(file:File):Promise<string> {
  await requireAdmin();
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size >= 5*1024*1024) throw new Error('اختر صورة JPG أو PNG أو WebP أصغر من 5 ميغابايت.');
  let bitmap:ImageBitmap;
  try { bitmap=await createImageBitmap(file); }
  catch { throw new Error('تعذّر قراءة الصورة. اختر ملف صورة صالحاً.'); }
  let encoded:Blob;
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width>8192 || bitmap.height>8192 || bitmap.width*bitmap.height>32_000_000) throw new Error('أبعاد الصورة كبيرة جداً. الحد 8192 بكسل و32 مليون بكسل إجمالاً.');
    const scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const context=canvas.getContext('2d');
    if (!context) throw new Error('المتصفح لا يدعم معالجة الصور.');
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    encoded=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('تعذّر تجهيز الصورة.')),'image/webp',0.86));
    if (encoded.type!=='image/webp' || encoded.size>=5*1024*1024) throw new Error('تعذّر تجهيز صورة WebP ضمن حد الحجم.');
  } finally {bitmap.close();}
  const target=ref(storage,`snounu/images/${crypto.randomUUID()}.webp`);
  await uploadBytes(target,encoded,{contentType:'image/webp'});
  return getDownloadURL(target);
}
let anonymousLogin:Promise<User>|undefined;
async function submissionUser():Promise<User> {
  await ready; await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;
  anonymousLogin ??= signInAnonymously(auth).then(result=>result.user).finally(()=>{anonymousLogin=undefined;});
  return anonymousLogin;
}
export async function submitReview(productId:string,rating:number,comment:string):Promise<void> {
  validId(productId);
  if (!Number.isInteger(rating) || rating<1 || rating>5 || comment.trim().length>1000) throw new Error('أدخل تقييماً من 1 إلى 5 وتعليقاً لا يتجاوز 1000 حرف.');
  const user=await submissionUser();
  const target=doc(db,'snounu_reviews',`${productId}_${user.uid}`);
  await runTransaction(db,async transaction=>{
    const existing=await transaction.get(target);
    transaction.set(target,{productId,uid:user.uid,rating,comment:comment.trim(),status:'pending',
      createdAt:existing.exists()?existing.data().createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  });
}
export async function submitContact(input:{name:string;phone:string;kind:string;message:string}):Promise<void> {
  const clean={name:input.name.trim(),phone:input.phone.trim(),kind:input.kind.trim(),message:input.message.trim()};
  if (!clean.name || clean.name.length>100 || !clean.phone || clean.phone.length>40 || !clean.kind || clean.kind.length>50 || !clean.message || clean.message.length>2000) throw new Error('تحقق من الحقول: الاسم حتى 100 حرف، الهاتف 40، النوع 50، والرسالة 2000.');
  const user=await submissionUser();
  const target=doc(collection(db,'snounu_messages'));
  const batch=writeBatch(db);
  batch.set(target,{...clean,uid:user.uid,status:'new',createdAt:serverTimestamp()});
  batch.set(doc(db,'snounu_submission_limits',user.uid),{lastMessageAt:serverTimestamp(),messageId:target.id});
  await batch.commit();
}
export async function seedCatalog(catalog:Catalog):Promise<void> {
  await requireAdmin();
  // A second seed cannot silently replace an existing restaurant catalog.
  const resources=['categories','ingredients','products','banners'] as const;
  const existingCollections=await Promise.all((['categories','ingredients','products','banners','reviews','messages'] as const).map(resource=>getDocs(query(collection(db,path(resource)),limit(1)))));
  if (existingCollections.some(snapshot=>!snapshot.empty)) throw new Error('توجد بيانات بالفعل. استخدم شاشة الإدارة لتعديلها دون استبدالها.');
  const count=resources.reduce((sum,key)=>sum+catalog[key].length,1);
  if (count>450) throw new Error('البيانات الأولية أكبر من الحد المسموح.');
  const writes:{target:ReturnType<typeof doc>;payload:Record<string,unknown>}[]=[];
  for (const resource of resources) for (const item of catalog[resource]) {
    validId(item.id);
    const {id,...payload}=item;
    writes.push({target:doc(db,path(resource),id),payload});
  }
  const settingsRef=doc(db,'snounu_settings/main');
  await runTransaction(db,async transaction=>{
    const existing=await Promise.all([transaction.get(settingsRef),...writes.map(write=>transaction.get(write.target))]);
    if (existing.some(snapshot=>snapshot.exists())) throw new Error('البيانات الأولية موجودة بالفعل. استخدم شاشة الإدارة لتعديلها.');
    for (const write of writes) transaction.set(write.target,write.payload);
    transaction.set(settingsRef,catalog.settings);
  });
}
