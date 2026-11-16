import {useEffect,useRef,useState,type PointerEvent} from 'react';
import type {Banner} from './types';
import {MenuImage} from './MenuImage';
import {safeExternalUrl} from './domain';
import './banner-slider.css';
export function BannerSlider({banners}:{banners:Banner[]}){
 const [index,setIndex]=useState(0),[offset,setOffset]=useState(0),[dragging,setDragging]=useState(false);
 const gesture=useRef<{id:number;x:number;y:number;dx:number;dy:number;time:number;axis?:'x'|'y'}|null>(null);
 const suppressClick=useRef(false);
 const current=Math.min(index,Math.max(0,banners.length-1));
 useEffect(()=>{setIndex(value=>Math.min(value,Math.max(0,banners.length-1)));setOffset(0);setDragging(false);gesture.current=null},[banners.length]);
 const moveTo=(value:number)=>setIndex(Math.max(0,Math.min(banners.length-1,value)));
 function start(event:PointerEvent<HTMLDivElement>){
  suppressClick.current=false;if(banners.length<2||!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
  gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,dy:0,time:Date.now()};
 }
 function move(event:PointerEvent<HTMLDivElement>){
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;
  g.dx=event.clientX-g.x;g.dy=event.clientY-g.y;
  if(!g.axis&&Math.max(Math.abs(g.dx),Math.abs(g.dy))>8)g.axis=Math.abs(g.dx)>Math.abs(g.dy)*1.2?'x':'y';
  if(g.axis!=='x')return;
  if(!event.currentTarget.hasPointerCapture(g.id))event.currentTarget.setPointerCapture(g.id);
  if(event.cancelable)event.preventDefault();setDragging(true);suppressClick.current=true;
  const edge=(current===0&&g.dx<0)||(current===banners.length-1&&g.dx>0);
  const limit=event.currentTarget.clientWidth*.95;
  setOffset(Math.max(-limit,Math.min(limit,g.dx*(edge?0.22:1))));
 }
 function finish(event:PointerEvent<HTMLDivElement>,cancelled=false){
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;
  if(!cancelled&&g.axis==='x'){
   const threshold=Math.min(70,event.currentTarget.clientWidth*.16);
   if(Math.abs(g.dx)>=threshold||(Date.now()-g.time<250&&Math.abs(g.dx)>26))moveTo(current+(g.dx>0?1:-1));
  }
  gesture.current=null;setOffset(0);setDragging(false);
  if(event.currentTarget.hasPointerCapture(g.id))event.currentTarget.releasePointerCapture(g.id);
 }
 if(!banners.length)return null;
 return <div className="promotion-area">
  <div className={'banner banner-slider'+(dragging?' is-dragging':'')+(banners.length>1?' can-drag':'')} data-motion="hero" role="region" aria-roledescription="عارض شرائح" aria-label="عروض المطعم" tabIndex={banners.length>1?0:undefined} onPointerDown={start} onPointerMove={move} onPointerUp={event=>finish(event)} onPointerCancel={event=>finish(event,true)} onDragStart={event=>event.preventDefault()} onClickCapture={event=>{if(suppressClick.current&&event.detail!==0){event.preventDefault();event.stopPropagation()}suppressClick.current=false}} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveTo(current+(event.key==='ArrowRight'?1:-1))}}}>
   <div className="banner-track" style={{transform:`translateX(calc(${current*100}% + ${offset}px))`}}>{banners.map((banner,i)=>{
    const href=safeExternalUrl(banner.url);const picture=<MenuImage src={banner.image} alt={banner.alt} draggable={false} loading={i===current?'eager':'lazy'}/>;
    return <div className="banner-slide" key={banner.id} aria-hidden={i!==current} inert={i!==current}>{href?<a href={href} target="_blank" rel="noopener noreferrer" tabIndex={i===current?0:-1} draggable={false}>{picture}</a>:picture}</div>;
   })}</div>
  </div>
  <div className="banner-dots" data-motion="dots">{banners.length>1?banners.map((banner,i)=><button key={banner.id} type="button" onClick={()=>moveTo(i)} aria-label={'عرض الإعلان '+(i+1)} aria-pressed={i===current} className={i===current?'selected':''}/>):<span className="selected"/>}</div>
 </div>;
}
