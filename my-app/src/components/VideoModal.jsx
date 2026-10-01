import {useEffect,useRef,useState} from 'react';
import {useLanguage} from '../context/language.js';
import {videoSource,webUrl} from '../services/api.js';
import useMedia from '../hooks/useMedia.js';

export default function VideoModal({product,onClose}){
  const {t,name}=useLanguage();
  const dialog=useRef(null);
  const [failed,setFailed]=useState(false);
  const [imageFailed,setImageFailed]=useState(false);

  const video=useMedia(product.videoMediaId,product.videoUrl);
  const cover=useMedia(product.coverMediaId,product.coverUrl);

  const source=product.videoMediaId
    ? (video.url ? {type:'file',url:video.url} : null)
    : videoSource(product.videoUrl);

  const original=webUrl(product.videoUrl);
  const loading=video.loading||cover.loading;

  useEffect(()=>{
    const node=dialog.current;
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;

    node.showModal();
    document.body.style.overflow='hidden';

    return ()=>{
      node.close();
      document.body.style.overflow=overflow;
      previous?.focus();
    };
  },[]);

  function renderVideo(){
    if(!source||failed)return null;

    // Google Drive and YouTube both need an iframe.
    if(source.type==='drive'||source.type==='embed'){
      return (
        <iframe
          title={t('Watch {name}',{name:name(product)})}
          src={source.url}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onError={()=>setFailed(true)}
        />
      );
    }

    // Direct MP4/WebM/OGG or uploaded media.
    if(source.type==='file'){
      return (
        <video
          src={source.url}
          controls
          autoPlay
          playsInline
          onError={()=>setFailed(true)}
        />
      );
    }

    return null;
  }

  const videoElement=renderVideo();

  return (
    <dialog
      ref={dialog}
      className="video-dialog"
      aria-labelledby="video-title"
      onCancel={e=>{
        e.preventDefault();
        onClose();
      }}
      onClick={e=>{
        if(e.target===dialog.current){
          const r=dialog.current.getBoundingClientRect();

          if(
            e.clientX<r.left||
            e.clientX>r.right||
            e.clientY<r.top||
            e.clientY>r.bottom
          ){
            onClose();
          }
        }
      }}
    >
      <div className="dialog-heading">
        <div>
          <small>{t('Product details')}</small>
          <h2 id="video-title">{name(product)}</h2>
        </div>

        <button
          className="icon-button"
          onClick={onClose}
          aria-label={t('Close video')}
          autoFocus
        >
          ×
        </button>
      </div>

      <div className="video-stage">
        {loading ? (
          <p role="status">{t('Loading media…')}</p>
        ) : videoElement ? (
          videoElement
        ) : cover.url&&!imageFailed ? (
          <img
            className="detail-image"
            src={cover.url}
            alt={name(product)}
            onError={()=>setImageFailed(true)}
          />
        ) : (
          <div className="empty">
            <span>✺</span>

            <h3>
              {t(
                failed
                  ? 'Video could not be loaded'
                  : video.error||cover.error
                    ? 'Local file is missing. Please upload it again.'
                    : 'No media added'
              )}
            </h3>

            <p>
              {t(
                failed
                  ? 'Try opening the original link.'
                  : 'Contact us for product information.'
              )}
            </p>
          </div>
        )}
      </div>

      {!loading&&(video.error||cover.error||failed)&&(
        <p className="media-feedback">
          {t(
            failed
              ? 'Video could not be loaded'
              : 'Local file is missing. Please upload it again.'
          )}
        </p>
      )}

      <div className="dialog-footer">
        <span>
          {t('Make your next celebration unforgettable.')}
        </span>

        {original&&(
          <a
            href={original}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Open video')} ↗
          </a>
        )}
      </div>
    </dialog>
  );
}