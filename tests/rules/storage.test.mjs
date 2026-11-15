import {before,after,test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {setDoc,doc} from 'firebase/firestore';
import {ref,uploadBytes,getBytes} from 'firebase/storage';
let env;
before(async()=>{
  if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_STORAGE_EMULATOR_HOST) throw new Error('Start Firestore and Storage emulators before running rules tests.');
  env=await initializeTestEnvironment({projectId:'demo-snounu-storage',firestore:{rules:await readFile(new URL('../../firestore.rules',import.meta.url),'utf8')},storage:{rules:await readFile(new URL('../../storage.rules',import.meta.url),'utf8')}});
  await env.withSecurityRulesDisabled(async context=>{await setDoc(doc(context.firestore(),'snounu_admins/admin'),{enabled:true});});
});
after(async()=>{await env?.cleanup();});
test('only enabled admin can upload supported images in the Snounu folder',async()=>{
  const data=new Uint8Array([1,2,3]);
  const visitor=env.authenticatedContext('visitor').storage();
  const admin=env.authenticatedContext('admin').storage();
  await assertFails(uploadBytes(ref(visitor,'snounu/images/no.png'),data,{contentType:'image/png'}));
  await assertFails(uploadBytes(ref(admin,'snounu/images/no.svg'),data,{contentType:'image/svg+xml'}));
  await assertFails(uploadBytes(ref(admin,'snounu/images/no.gif'),data,{contentType:'image/gif'}));
  await assertFails(uploadBytes(ref(admin,'snounu/images/no.avif'),data,{contentType:'image/avif'}));
  await assertFails(uploadBytes(ref(admin,'other/no.png'),data,{contentType:'image/png'}));
  await assertFails(uploadBytes(ref(admin,'snounu/images/large.png'),new Uint8Array(5*1024*1024),{contentType:'image/png'}));
  await assertSucceeds(uploadBytes(ref(admin,'snounu/images/yes.png'),data,{contentType:'image/png'}));
  await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(),'snounu/images/yes.png')));
});
