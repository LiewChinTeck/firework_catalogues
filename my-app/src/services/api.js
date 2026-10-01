// Local demo adapter. Replace with authenticated server requests for a shared catalogue.

export const STORAGE_KEY='firework-catalogue-v1';

export const uid=()=>crypto.randomUUID();

export function webUrl(value){
  try{
    const url=new URL(value);

    return ['https:','http:'].includes(url.protocol)
      ?url.href
      :'';
  }catch{
    return '';
  }
}

/* ---------------- Google Drive ---------------- */

export function googleDriveId(value){
  const safe=webUrl(value);

  if(!safe)return '';

  try{
    const url=new URL(safe);
    const host=url.hostname.toLowerCase();

    if(
      host!=='drive.google.com' &&
      host!=='www.drive.google.com'
    ){
      return '';
    }

    // https://drive.google.com/file/d/FILE_ID/view
    const fileMatch=url.pathname.match(
      /^\/file\/d\/([^/]+)/
    );

    if(fileMatch){
      return fileMatch[1];
    }

    // https://drive.google.com/open?id=FILE_ID
    // https://drive.google.com/uc?id=FILE_ID
    const queryId=url.searchParams.get('id');

    if(queryId){
      return queryId;
    }

    return '';
  }catch{
    return '';
  }
}

export function googleDriveVideoUrl(value){
  const id=googleDriveId(value);

  if(!id)return '';

  return `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
}

export function googleDriveImageUrl(value){
  const id=googleDriveId(value);

  if(!id)return '';

  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2000`;
}

/* ---------------- Video links ---------------- */

export function videoSource(value){
  const safe=webUrl(value);

  if(!safe)return null;

  const driveUrl=googleDriveVideoUrl(safe);

  if(driveUrl){
    return {
      type:'drive',
      url:driveUrl
    };
  }

  const url=new URL(safe);
  const host=url.hostname.toLowerCase();

  /* YouTube */

  if([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtu.be',
    'www.youtube-nocookie.com'
  ].includes(host)){

    let id='';

    if(host==='youtu.be'){
      id=url.pathname.slice(1);
    }else{
      id=
        url.searchParams.get('v') ||
        url.pathname.match(
          /^\/(?:embed|shorts)\/([^/]+)/
        )?.[1] ||
        '';
    }

    if(/^[A-Za-z0-9_-]{11}$/.test(id)){
      return {
        type:'embed',
        url:
          `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
      };
    }

    return null;
  }

  /* Direct video */

  if(/\.(mp4|webm|ogg)$/i.test(url.pathname)){
    return {
      type:'file',
      url:safe
    };
  }

  return null;
}

/* ---------------- Settings ---------------- */

export const defaultSettings={
  name:'天际烟花',
  nameEn:'SKYLINE',
  tagline:'一点星火，点亮难忘之夜。',
  taglineEn:'A little spark. An unforgettable night.',
  logoUrl:'',
  faviconUrl:'',
  tabTitle:'',
  tabTitleEn:'',
  phone:'',
  whatsapp:'',
  email:'',
  address:'',
  addressEn:'',
  hours:'',
  hoursEn:''
};

/* ---------------- Seed data ---------------- */

const seed={
  settings:{
    ...defaultSettings
  },

  categories:[
    {
      id:'aerial',
      name:'Aerial fireworks'
    },
    {
      id:'fountains',
      name:'Fountains'
    },
    {
      id:'sparklers',
      name:'Sparklers'
    }
  ],

  series:[
    {
      id:'gold',
      categoryId:'aerial',
      name:'Gold collection'
    },
    {
      id:'signature',
      categoryId:'aerial',
      name:'Signature collection'
    }
  ],

  products:[
    ['Golden sky','aerial','gold'],
    ['Midnight bloom','aerial','signature'],
    ['Ruby constellation','aerial','signature'],
    ['Silver fountain','fountains',''],
    ['Celebration spark','sparklers',''],
    ['Golden rain','aerial','gold']
  ].map(([name,categoryId,seriesId],i)=>({
    id:`sample-${i}`,
    name,
    categoryId,
    seriesId,
    coverUrl:'',
    videoUrl:'',
    visible:true
  }))
};

/* ---------------- Contact helpers ---------------- */

export function phoneLink(value,whatsapp=false){
  const raw=String(value||'').trim();

  if(
    !raw ||
    !/^[+\d\s()-]+$/.test(raw)
  ){
    return '';
  }

  const digits=raw.replace(/\D/g,'');

  if(
    digits.length<6 ||
    digits.length>15
  ){
    return '';
  }

  return whatsapp
    ?`https://wa.me/${digits}`
    :`tel:${raw.startsWith('+')?'+':''}${digits}`;
}

export function emailLink(value){
  const email=String(value||'').trim();

  return /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)
    ?`mailto:${email}`
    :'';
}

/* ---------------- Validation ---------------- */

export function validate(data){
  if(
    !data ||
    !data.settings ||
    typeof data.settings.name!=='string' ||
    typeof data.settings.tagline!=='string' ||
    typeof data.settings.logoUrl!=='string'
  ){
    throw Error('Invalid catalogue settings.');
  }

  for(
    const key of [
      'categories',
      'series',
      'products'
    ]
  ){
    if(
      !Array.isArray(data[key]) ||
      data[key].some(
        x=>
          !x ||
          typeof x.id!=='string' ||
          typeof x.name!=='string' ||
          !x.name.trim()
      ) ||
      new Set(
        data[key].map(x=>x.id)
      ).size!==data[key].length
    ){
      throw Error('Invalid catalogue data.');
    }
  }

  if(
    data.series.some(
      s=>
        !data.categories.some(
          c=>c.id===s.categoryId
        )
    )
  ){
    throw Error(
      'Series must belong to a category.'
    );
  }

  if(
    data.products.some(
      p=>
        (
          typeof p.categoryId!=='string' ||
          (
            p.categoryId &&
            !data.categories.some(
              c=>c.id===p.categoryId
            )
          )
        ) ||
        (
          p.seriesId &&
          !data.series.some(
            s=>
              s.id===p.seriesId &&
              s.categoryId===p.categoryId
          )
        ) ||
        typeof p.visible!=='boolean' ||
        typeof p.videoUrl!=='string' ||
        typeof p.coverUrl!=='string'
    )
  ){
    throw Error('Invalid product data.');
  }

  for(
    const key of Object.keys(defaultSettings)
  ){
    if(
      data.settings[key]!==undefined &&
      typeof data.settings[key]!=='string'
    ){
      throw Error(
        'Invalid catalogue settings.'
      );
    }
  }

  for(
    const key of [
      'categories',
      'series',
      'products'
    ]
  ){
    if(
      data[key].some(
        x=>
          x.nameEn!==undefined &&
          typeof x.nameEn!=='string'
      )
    ){
      throw Error(
        'Invalid catalogue data.'
      );
    }
  }

  for(
    const p of data.products
  ){
    for(
      const key of [
        'coverMediaId',
        'videoMediaId',
        'coverFileName',
        'videoFileName'
      ]
    ){
      if(
        p[key]!==undefined &&
        typeof p[key]!=='string'
      ){
        throw Error(
          'Invalid product data.'
        );
      }
    }
  }

  return {
    ...data,

    settings:{
      ...defaultSettings,
      nameEn:'',
      taglineEn:'',
      ...data.settings
    }
  };
}

/* ---------------- Storage ---------------- */

export function getCatalogue(){
  const raw=localStorage.getItem(
    STORAGE_KEY
  );

  return validate(
    raw
      ?JSON.parse(raw)
      :structuredClone(seed)
  );
}

export function saveCatalogue(data){
  const valid=validate(data);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(valid)
  );

  return valid;
}