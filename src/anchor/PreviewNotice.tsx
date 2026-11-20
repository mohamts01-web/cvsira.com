import {useEffect,useState} from "react";
import {Info,X} from "lucide-react";

export default function PreviewNotice(){
 const [visible,setVisible]=useState(()=>{
  try{return sessionStorage.getItem("elmam-preview-dismissed")!=="1"}catch{return true}
 });
 const dismiss=()=>{
  setVisible(false);
  try{sessionStorage.setItem("elmam-preview-dismissed","1")}catch{/* Storage may be unavailable. */}
 };
 useEffect(()=>{
  if(!visible)return;
  const timer=window.setTimeout(dismiss,12000);
  return ()=>window.clearTimeout(timer);
 },[visible]);
 if(!visible)return null;
 return <aside className="preview-toast" role="status"><Info size={19} aria-hidden="true"/><div><strong>أنت في نسخة المعاينة</strong><p>تُحفظ المسودات التجريبية في هذا المتصفح.</p></div><button className="icon-btn" onClick={dismiss} aria-label="إغلاق إشعار المعاينة"><X size={17}/></button></aside>;
}
