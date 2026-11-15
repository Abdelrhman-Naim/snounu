import {before, after, beforeEach, test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment, assertFails, assertSucceeds} from '@firebase/rules-unit-testing';
import {doc, getDoc, setDoc, updateDoc, serverTimestamp, writeBatch, Timestamp} from 'firebase/firestore';

let env;
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run with firebase emulators:exec --only firestore,storage "npm run test:rules"');
  env = await initializeTestEnvironment({projectId:'demo-snounu', firestore:{rules:await readFile(new URL('../../firestore.rules',import.meta.url),'utf8')}});
});
after(async () => {await env?.cleanup();});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db=context.firestore();
    await setDoc(doc(db,'snounu_products/p1'),{published:true});
    await setDoc(doc(db,'snounu_products/private'),{published:false});
    await setDoc(doc(db,'snounu_admins/admin'),{enabled:true});
  });
});
const db = uid => uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
const review = (extra={}) => ({productId:'p1',uid:'alice',rating:5,comment:'رائع',status:'pending',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),...extra});
test('public reads only published products',async () => {
  await assertSucceeds(getDoc(doc(db(),'snounu_products/p1')));
  await assertFails(getDoc(doc(db(),'snounu_products/private')));
});
test('visitors cannot grant themselves admin or write catalog',async () => {
  await assertFails(setDoc(doc(db('alice'),'snounu_admins/alice'),{enabled:true}));
  await assertFails(setDoc(doc(db('alice'),'snounu_products/new'),{published:true}));
  await assertSucceeds(setDoc(doc(db('admin'),'snounu_products/new'),{published:true}));
});
test('review requires owner deterministic ID, pending status, published target and server timestamps',async () => {
  const client=db('alice');
  await assertSucceeds(getDoc(doc(client,'snounu_reviews/p1_alice')));
  await assertFails(setDoc(doc(client,'snounu_reviews/random'),review()));
  await assertFails(setDoc(doc(client,'snounu_reviews/p1_alice'),review({status:'approved'})));
  await assertFails(setDoc(doc(client,'snounu_reviews/p1_alice'),review({uid:'bob'})));
  await assertFails(setDoc(doc(client,'snounu_reviews/p1_alice'),review({rating:6})));
  await assertFails(setDoc(doc(client,'snounu_reviews/p1_alice'),review({rating:2.5})));
  await assertFails(setDoc(doc(client,'snounu_reviews/p1_alice'),review({comment:'a'.repeat(1001)})));
  await assertFails(setDoc(doc(client,'snounu_reviews/private_alice'),review({productId:'private'})));
  await assertFails(setDoc(doc(client,'snounu_reviews/p1_alice'),review({createdAt:Timestamp.fromMillis(0)})));
  await assertSucceeds(setDoc(doc(client,'snounu_reviews/p1_alice'),review()));
  await assertFails(updateDoc(doc(client,'snounu_reviews/p1_alice'),{comment:'changed',updatedAt:serverTimestamp()}));
});
test('pending reviews cannot be read by public and owner cannot approve',async () => {
  await assertSucceeds(setDoc(doc(db('alice'),'snounu_reviews/p1_alice'),review()));
  await assertSucceeds(getDoc(doc(db('alice'),'snounu_reviews/p1_alice')));
  await assertFails(getDoc(doc(db('bob'),'snounu_reviews/p1_alice')));
  await assertFails(getDoc(doc(db(),'snounu_reviews/p1_alice')));
  await assertFails(updateDoc(doc(db('alice'),'snounu_reviews/p1_alice'),{status:'approved',updatedAt:serverTimestamp()}));
  await assertSucceeds(updateDoc(doc(db('admin'),'snounu_reviews/p1_alice'),{status:'approved'}));
  await assertSucceeds(getDoc(doc(db(),'snounu_reviews/p1_alice')));
});
function contact(client,id,extra={}) {
  const batch=writeBatch(client);
  batch.set(doc(client,`snounu_messages/${id}`),{uid:'alice',name:'أحمد',phone:'123456',kind:'question',message:'مرحبا',status:'new',createdAt:serverTimestamp(),...extra});
  batch.set(doc(client,'snounu_submission_limits/alice'),{lastMessageAt:serverTimestamp(),messageId:id});
  return batch.commit();
}
test('messages require atomic rate limit, cannot forge status or send repeatedly',async () => {
  const client=db('alice');
  await assertFails(setDoc(doc(client,'snounu_messages/no-limit'),{uid:'alice',name:'أحمد',phone:'123',kind:'question',message:'مرحبا',status:'new',createdAt:serverTimestamp()}));
  await assertFails(contact(client,'forged',{status:'resolved'}));
  await assertSucceeds(contact(client,'first'));
  await assertFails(contact(client,'second'));
  await assertFails(getDoc(doc(db(),'snounu_messages/first')));
  await assertSucceeds(getDoc(doc(db('admin'),'snounu_messages/first')));
});
test('unrelated project documents remain denied',async () => {
  await assertFails(setDoc(doc(db('admin'),'other/data'),{value:true}));
});
