import {readFile,mkdir,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const entries=JSON.parse(await readFile(new URL('./assets.json',import.meta.url),'utf8'));
for(const entry of entries){const file=path.resolve(entry.path);if(!file.startsWith(path.resolve('public/assets')+path.sep))throw new Error('Invalid asset path');try{if((await stat(file)).size>0)continue}catch{}await mkdir(path.dirname(file),{recursive:true});execFileSync('curl',['--fail','--location','--retry','2','--connect-timeout','15','--output',file,entry.url],{stdio:'inherit'});if(!(await stat(file)).size)throw new Error('Empty asset: '+file)}
console.log(`Verified ${entries.length} original Figma assets.`);

