import {useEffect,useRef,useState,type ImgHTMLAttributes} from 'react';
import {UtensilsCrossed} from 'lucide-react';
import {managedImageId,optimizedAsset} from './image-reference';
import {resolveImage} from './public-data';
export function MenuImage({src,alt,...props}:ImgHTMLAttributes<HTMLImageElement>){
 const managed=!!managedImageId(src||'');const target=optimizedAsset(src||'',import.meta.env.PROD);
 const [resolved,setResolved]=useState(''),[failed,setFailed]=useState(false),[fallback,setFallback]=useState(false);
 const anchor=useRef<HTMLSpanElement>(null);
 const placeholderStyle=props.width&&props.height?{...props.style,aspectRatio:`${props.width}/${props.height}`,minHeight:0}:props.style;
 useEffect(()=>{let active=true;setFailed(false);setFallback(false);setResolved('');if(!managed||!src)return;
 const load=()=>{resolveImage(src).then(v=>{if(active)setResolved(v)}).catch(()=>{if(active)setFailed(true)});};
 const observer=new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting)){observer.disconnect();load();}},{rootMargin:'200px'});
 if(anchor.current)observer.observe(anchor.current);else load();return()=>{active=false;observer.disconnect();};
 },[src,managed]);
 if(managed&&!resolved&&!failed)return <span ref={anchor} style={placeholderStyle} className={'image-placeholder '+(props.className||'')} role="img" aria-label={alt||'جارٍ تحميل الصورة'}/>;
 return src&&!failed?<img {...props} decoding="async" src={managed?resolved:fallback?src:target} alt={alt||''} onError={()=>{if(!managed&&!fallback&&target!==src)setFallback(true);else setFailed(true)}}/>:<div style={placeholderStyle} className={'image-placeholder '+(props.className||'')} role="img" aria-label={alt||'صورة غير متوفرة'}><UtensilsCrossed size={34}/><span>الصورة غير متوفرة</span></div>;
}
