import {useState} from 'react';
import {useLanguage} from '../context/language.js';
import useMedia from '../hooks/useMedia.js';
export default function ProductCard({product,category,series,index=0,onClick}){
  const {t,name}=useLanguage(),[failed,setFailed]=useState(false),cover=useMedia(product.coverMediaId,product.coverUrl),hasVideo=!!(product.videoMediaId||product.videoUrl);
  return <button className="product-card" onClick={onClick} aria-label={t('View {name}',{name:name(product)})}><div className={`product-cover tone-${index%4}`}>{cover.url&&!failed?<img src={cover.url} alt={name(product)} loading="lazy" onError={()=>setFailed(true)}/>:<div className="spark-art" aria-hidden="true">✺</div>}{hasVideo&&<span className="play" aria-hidden="true">▶</span>}</div><div className="card-info"><h3 title={name(product)}>{name(product)}</h3><small title={`${name(category)||t('Uncategorised')} · ${name(series)||t('No series')}`}>{name(series)||name(category)||t('Uncategorised')}</small></div></button>;
}
