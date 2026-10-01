import {useEffect,useState} from 'react';
import {readMedia} from '../services/media.js';
import {webUrl} from '../services/api.js';
export default function useMedia(id,url='',file=null){
  const [state,setState]=useState({id:null,file:null,url:'',error:false,loading:false});
  useEffect(()=>{let active=true,objectUrl='';if(!id&&!file)return;setState({id,file,url:'',error:false,loading:true});const load=file?Promise.resolve(file):readMedia(id);load.then(blob=>{if(!active)return;if(!blob){setState({id,file,url:'',error:true,loading:false});return;}objectUrl=URL.createObjectURL(blob);setState({id,file,url:objectUrl,error:false,loading:false});}).catch(()=>{if(active)setState({id,file,url:'',error:true,loading:false});});return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};},[id,file]);
  if(!id&&!file)return {url:webUrl(url),error:false,loading:false};return state.id===id&&state.file===file?state:{url:'',error:false,loading:true};
}
