import {useState} from "react";
import type {User} from "@supabase/supabase-js";
import {UserRound,Save,FileText,ArrowLeft,Settings} from "lucide-react";
import {auth} from "./api";
import {cleanPersonalProfile,savePersonalProfile} from "../shared/personal-profile.mjs";
import {resumeHTML} from "../shared/render.mjs";
import type {Draft} from "./types";
import "./personal-profile.css";
import PreviewNotice from "./anchor/PreviewNotice";

export default function PersonalProfile({user,drafts,onOpen,onAccount}:{user:User;drafts:Draft[];onOpen:(id:string)=>void;onAccount:()=>void}){
  const preview=import.meta.env.VITE_PRICING_PREVIEW==="true";
  const storageKey="elmam.preview.profile."+user.id;
  const recent=[...drafts].sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at));
  const empty=cleanPersonalProfile({});
  const [values,setValues]=useState(()=>{
    try{return cleanPersonalProfile(preview?JSON.parse(localStorage.getItem(storageKey)||"null")??user.user_metadata?.elmam_profile??{}:user.user_metadata?.elmam_profile??{});}catch{return empty;}
  });
  const [saved,setSaved]=useState(JSON.stringify(values)),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
  const [selected,setSelected]=useState(recent[0]?.id??"");
  const resume=recent.find(draft=>draft.id===selected)??recent[0];
  const dirty=JSON.stringify(values)!==saved;
  function useResume(){
    if(!resume)return;
    const content=resume.content;
    try{setValues(cleanPersonalProfile({name:content.name,headline:content.headline,phone:content.phone,city:content.city,country:content.country,contactEmail:content.email,linkedin:content.linkedin,bio:content.summary}));setMessage("نُقلت بيانات السيرة إلى النموذج. راجعها ثم احفظها.");setError("");}catch{setError("راجع بيانات السيرة قبل نقلها إلى الملف الشخصي.");}
  }
  async function save(event:React.FormEvent){
    event.preventDefault();if(busy)return;setBusy(true);setMessage("");setError("");
    try{
      const checked=cleanPersonalProfile(values);
      if(preview)localStorage.setItem(storageKey,JSON.stringify(checked));
      else {if(!auth)throw Error("تسجيل الدخول غير متاح.");await savePersonalProfile(auth,user.id,checked);}
      setValues(checked);setSaved(JSON.stringify(checked));setMessage(preview?"حُفظ الملف التجريبي في هذا المتصفح.":"حُفظت بيانات ملفك الشخصي.");
    }catch(cause){setError(cause instanceof Error?cause.message:"تعذّر الحفظ. حاول مرة أخرى.");}finally{setBusy(false);}
  }
  return <main className="container personal-profile-page">
    <header className="profile-heading"><div className="profile-avatar" aria-hidden="true"><UserRound size={30}/></div><div><span className="ds-eyebrow">مساحتك المهنية</span><h1>ملفي الشخصي</h1><p>بياناتك وسيرك الذاتية في مكان واحد.</p></div><button type="button" className="secondary" onClick={onAccount}><Settings size={17} aria-hidden="true"/>إعدادات الحساب والربط</button></header>
    {preview&&<PreviewNotice message="تُحفظ تعديلات الملف الشخصي التجريبية في هذا المتصفح فقط."/>}
    <div className="profile-layout"><section className="profile-card"><h2>بياناتي المهنية</h2><p>تحديث هذه البيانات مستقل عن محتوى السير المحفوظة.</p><form onSubmit={save}>
      <fieldset disabled={busy}><legend className="sr-only">تعديل بيانات الملف الشخصي</legend><div className="profile-fields">{[
        ["name","الاسم الكامل",120],["headline","المسمى المهني",180],["phone","رقم الجوال",40],["contactEmail","بريد التواصل",254],["city","المدينة",100],["country","الدولة",100],["linkedin","رابط LinkedIn",300],
      ].map(([field,label,max])=><label key={field}> <span>{label}</span><input value={values[field as keyof typeof values]} type={field==="contactEmail"?"email":field==="linkedin"?"url":field==="phone"?"tel":"text"} dir={["contactEmail","linkedin","phone"].includes(String(field))?"ltr":undefined} maxLength={Number(max)} onChange={event=>{setValues({...values,[field]:event.target.value});setMessage("");}}/></label>)}<label className="profile-wide"><span>نبذة مهنية</span><textarea rows={4} maxLength={1200} value={values.bio} onChange={event=>{setValues({...values,bio:event.target.value});setMessage("");}}/></label></div></fieldset>
      <div className="profile-save"><button type="submit" className="primary" disabled={busy||!dirty}><Save size={17} aria-hidden="true"/>{busy?"جارٍ الحفظ…":"حفظ البيانات"}</button><span>{dirty?"لديك تغييرات لم تُحفظ":"البيانات محفوظة"}</span></div>
      {message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}
    </form><div className="profile-login-email"><strong>بريد تسجيل الدخول</strong><p dir="ltr">{user.email}</p><small>بريد التواصل أعلاه لا يغيّر البريد المستخدم للدخول.</small></div></section>
    <section className="profile-card profile-resumes"><h2><FileText size={21} aria-hidden="true"/>سيري الذاتية</h2>{resume?<><label className="field"><span>اختر السيرة للمعاينة</span><select value={resume.id} onChange={event=>setSelected(event.target.value)}>{recent.map(draft=><option key={draft.id} value={draft.id}>{draft.title}</option>)}</select></label><div className="profile-resume-preview"><iframe title={"معاينة السيرة "+resume.title} sandbox="" referrerPolicy="no-referrer" srcDoc={resumeHTML(resume.content,resume.design)}/></div><h3>{resume.title}</h3><p>آخر تعديل {new Date(resume.updated_at).toLocaleDateString("ar-SA")}</p><button type="button" className="primary" onClick={()=>onOpen(resume.id)}>افتح السيرة للتحرير<ArrowLeft size={17} aria-hidden="true"/></button><button type="button" className="secondary" disabled={busy} onClick={useResume}>استخدم بيانات السيرة في ملفي</button></>:<p>لم تحفظ سيرة بعد. أنشئ سيرتك من مساحتك المهنية لتظهر هنا.</p>}<a href="/documents#resume-drafts">عرض جميع السير المحفوظة<ArrowLeft size={16} aria-hidden="true"/></a></section></div>
  </main>;
}
