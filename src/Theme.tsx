import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {Moon,Sun} from 'lucide-react';
type Theme='light'|'dark';
const key='snounu:theme';
function initialTheme():Theme{try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value==='light'||value==='dark')return value;}catch{}return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
const Context=createContext<{theme:Theme;toggle:()=>void}|null>(null);
export function ThemeProvider({children}:{children:ReactNode}){
 const [theme,setTheme]=useState<Theme>(initialTheme);
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(key,JSON.stringify(theme))}catch{}},[theme]);
 useEffect(()=>{const update=(event:StorageEvent)=>{if(event.key===key)setTheme(initialTheme())};window.addEventListener('storage',update);return()=>window.removeEventListener('storage',update)},[]);
 return <Context.Provider value={{theme,toggle:()=>setTheme(value=>value==='dark'?'light':'dark')}}>{children}</Context.Provider>;
}
export function useTheme(){const value=useContext(Context);if(!value)throw new Error('ThemeProvider is required');return value;}
export function ThemeToggle({showLabel=false}:{showLabel?:boolean}){const {theme,toggle}=useTheme();return <button type="button" className={"icon-button theme-toggle"+(showLabel?" theme-toggle-labeled":"")} aria-label={theme==='dark'?'تفعيل الوضع الفاتح':'تفعيل الوضع الداكن'} onClick={toggle}>{theme==='dark'?<Sun size={20}/>:<Moon size={20}/>} {showLabel&&<span>{theme==='dark'?'الوضع الفاتح':'الوضع الداكن'}</span>}</button>;}
