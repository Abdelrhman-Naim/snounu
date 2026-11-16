const managed=/^firestore-image:([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/;
export function managedImageId(value:string):string|null{return managed.exec(value)?.[1]??null;}
export function isImageReference(value:string):boolean {
 if(managedImageId(value)||/^\/assets\/[\w.-]+$/.test(value))return true;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}
}
export function optimizedAsset(value:string,production:boolean):string{return production&&/^\/assets\/[\w-]+\.png$/.test(value)?value.replace(/\.png$/,'.webp'):value;}
export const MAX_IMAGE_DATA_LENGTH=184320;
