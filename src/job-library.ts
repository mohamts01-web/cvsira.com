import { useEffect, useState } from "react";
import { libraryParams, readLibrary } from "../shared/job-library.mjs";
export type LibraryJob = {id:number;title:string;company:string|null;location:string|null};
export type LibraryResult = {jobs:LibraryJob[];total:number;page:number};
// Share a short-lived public response between homepage and browser. No personal data.
const cache=new Map<string,{at:number;data:LibraryResult}>();
export async function fetchLibrary(params:string,signal:AbortSignal):Promise<LibraryResult> {
  const key=libraryParams(params).toString();
  const previous=cache.get(key);
  if(previous&&Date.now()-previous.at<60000)return previous.data;
  const response=await fetch("/api/job-library"+(key?"?"+key:""),{signal,credentials:"omit"});
  if(!response.ok)throw Error("library_unavailable");
  const data=readLibrary(await response.json()) as LibraryResult;
  if(data.page!==Number(new URLSearchParams(key).get("page")||1))throw Error("invalid_library_page");
  if(cache.size>30)cache.delete(cache.keys().next().value!);
  cache.set(key,{at:Date.now(),data});
  return data;
}
export function useJobLibrary(params="") {
  const [state,setState]=useState<{data:LibraryResult|null;loading:boolean;error:boolean}>({data:null,loading:true,error:false});
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let disposed=false;
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    setState({data:null,loading:true,error:false});
    fetchLibrary(params,controller.signal).then(data=>{
      if(!controller.signal.aborted)setState({data,loading:false,error:false});
    }).catch(()=>{
      if(!disposed)setState({data:null,loading:false,error:true});
    }).finally(()=>clearTimeout(timeout));
    return ()=>{disposed=true;clearTimeout(timeout);controller.abort()};
  },[params,retry]);
  useEffect(()=>{
    const refresh=()=>{if(document.visibilityState==="visible")setRetry(n=>n+1)};
    const interval=setInterval(refresh,300000);
    window.addEventListener("focus",refresh);
    return ()=>{clearInterval(interval);window.removeEventListener("focus",refresh)};
  },[]);
  return {...state,retry:()=>setRetry(n=>n+1)};
}
