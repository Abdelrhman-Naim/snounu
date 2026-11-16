import {readdir,stat} from 'node:fs/promises';
import sharp from 'sharp';
const root='public/assets';let input=0,output=0,count=0;
for(const name of await readdir(root)){
 if(!name.endsWith('.png'))continue;
 const source=root+'/'+name,target=source.replace(/\.png$/,'.webp');
 input+=(await stat(source)).size;
 const result=await sharp(source).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:78,effort:5}).toFile(target);
 output+=result.size;count++;
}
console.log(`Optimized ${count} PNG assets: ${input} -> ${output} bytes (WebP).`);
