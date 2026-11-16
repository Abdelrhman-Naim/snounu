import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decodeValue,decodeDocument} from '../../src/firestore-rest.ts';
import {isImageReference,managedImageId,optimizedAsset} from '../../src/image-reference.ts';

test('decodes Firestore catalog values without loading write SDKs',()=>{
 assert.deepEqual(decodeDocument({name:'projects/p/databases/(default)/documents/products/p1',fields:{name:{stringValue:'سلطة'},price:{integerValue:'25'},published:{booleanValue:true},ingredientIds:{arrayValue:{values:[{stringValue:'lettuce'}]}},previousPrice:{nullValue:null}}}),{id:'p1',name:'سلطة',price:25,published:true,ingredientIds:['lettuce'],previousPrice:null});
 assert.deepEqual(decodeValue({mapValue:{fields:{sort:{doubleValue:1.5}}}}),{sort:1.5});
});
test('managed image references are scoped IDs, not executable URLs or traversal',()=>{
 assert.equal(isImageReference('firestore-image:4a26a077-a488-4d33-a70e-ded4c378ab10'),true);
 assert.equal(managedImageId('firestore-image:../../snounu_admins/x'),null);
 assert.equal(isImageReference('data:image/svg+xml,<svg/>'),false);
 assert.equal(isImageReference('javascript:alert(1)'),false);
 assert.equal(isImageReference('https://example.com/a.webp'),true);
 assert.equal(isImageReference('/assets/a.png'),true);
});
test('production static images use generated WebP variants only for bundled assets',()=>{
 assert.equal(optimizedAsset('/assets/a.png',true),'/assets/a.webp');
 assert.equal(optimizedAsset('/assets/a.png',false),'/assets/a.png');
 assert.equal(optimizedAsset('https://example.com/a.png',true),'https://example.com/a.png');
});
