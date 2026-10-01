import {useEffect,useMemo,useState} from 'react';
import {LanguageContext} from './language.js';
import {zh} from './translations.js';
export default function LanguageProvider({children}){
  const [lang,setLang]=useState(()=>{try{return localStorage.getItem('firework-language')==='en'?'en':'zh';}catch{return 'zh';}});
  useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en';try{localStorage.setItem('firework-language',lang);}catch{/* Language switching works without browser storage. */}},[lang]);
  const value=useMemo(()=>{const t=(key,values={})=>(lang==='zh'?zh[key]||key:key).replace(/\{(\w+)\}/g,(match,name)=>values[name]??match);const name=(item,key='name')=>{if(!item)return '';const fallback=item[key]||'';return lang==='en'?item[`${key}En`]||fallback:zh[fallback]||fallback;};return {lang,setLang,t,name};},[lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
