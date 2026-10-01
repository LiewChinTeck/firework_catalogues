import {useEffect,useState} from 'react';
import LanguageProvider from './context/LanguageProvider.jsx';
import {useLanguage} from './context/language.js';
import LanguageSwitch from './components/LanguageSwitch.jsx';
import {webUrl} from './services/api.js';
import CatalogPage from './pages/CatalogPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import {getCatalogue,saveCatalogue,STORAGE_KEY} from './services/api.js';
export default function App(){return <LanguageProvider><CatalogueApp/></LanguageProvider>;}
function CatalogueApp(){
  const {t,name,lang}=useLanguage();
  const [data,setData]=useState(null),[error,setError]=useState(''),[admin,setAdmin]=useState(location.hash==='#admin');
  useEffect(()=>{const read=()=>{try{setData(getCatalogue());setError('');}catch{setError('Unable to read saved catalogue. Check browser storage access or restore a valid backup.');}};const route=()=>setAdmin(location.hash==='#admin');const sync=e=>{if(e.key===STORAGE_KEY||e.key===null)read();};read();addEventListener('hashchange',route);addEventListener('storage',sync);return()=>{removeEventListener('hashchange',route);removeEventListener('storage',sync);};},[]);
  function update(next){try{saveCatalogue(next);setData(next);setError('');}catch(e){setError('Changes were not saved. Check browser storage access and available space.');throw e;}}
  useEffect(()=>{if(!data)return;const title=name(data.settings,'tabTitle');document.title=title||`${name(data.settings)} | ${t('Fireworks catalogue')}`;let link=document.querySelector('link[rel="icon"]');if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link);}if(!link.dataset.defaultIcon)link.dataset.defaultIcon=link.getAttribute('href')||'/favicon.svg';link.href=webUrl(data.settings.faviconUrl)||link.dataset.defaultIcon;link.removeAttribute('type');},[data,lang,name,t]);
  return <>{error&&!data&&<div className="wrap error-language"><LanguageSwitch/></div>}{error&&<div className="error global-error" role="alert">{t(error)}</div>}{data?(admin?<AdminPage data={data} onChange={update}/>:<CatalogPage data={data}/>):!error&&<p className="loading">{t('Loading catalogue…')}</p>}</>;
}
