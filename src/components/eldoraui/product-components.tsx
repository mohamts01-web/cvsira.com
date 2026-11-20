import {useRef,useState,type ReactNode} from "react";
import {useInView,useReducedMotion} from "framer-motion";
import {ArrowLeft,FileText,Lock,MessageCircle,Pause,Play,RotateCw,Sparkles} from "lucide-react";
import {AnimatedList} from "./animated-list";
/** Adapted from EldoraUI Browser, Card Flip Hover, Clerk OTP, Integrations and Live Button.
 * Only real product controls are exposed; demonstration-only browser actions and random OTPs are omitted. */
export function BrowserFrame({children,title="معاينة إلمام"}:{children:ReactNode;title?:string}){
 return <div className="eldora-browser"><div className="eldora-browser-bar"><span className="eldora-window-dots" aria-hidden="true"><i/><i/><i/></span><span><Lock size={13} aria-hidden="true"/>{title}</span><span className="eldora-browser-label">ELMAM</span></div>{children}</div>
}
export function CardFlipHover({front,details,href}:{front:ReactNode;details:string;href:string}){
 const [flipped,setFlipped]=useState(false);
 return <article className="eldora-flip"><div className={"eldora-flip-inner "+(flipped?"is-flipped":"")}><div className="eldora-flip-front" aria-hidden={flipped}>{front}</div><div className="eldora-flip-back" aria-hidden={!flipped}><Sparkles size={28} aria-hidden="true"/><p>{details}</p></div></div><div className="eldora-flip-actions"><button type="button" aria-expanded={flipped} onClick={()=>setFlipped(v=>!v)}><RotateCw size={15} aria-hidden="true"/>{flipped?"ارجع البطاقة":"كيف تساعدني؟"}</button><a href={href}>افتح الأداة<ArrowLeft size={15} aria-hidden="true"/></a></div></article>
}
export function LiveButton({children,href}:{children:ReactNode;href:string}){
 return <a className="eldora-live" href={href} target="_blank" rel="noreferrer"><span className="eldora-live-dot" aria-hidden="true"/>{children}<ArrowLeft size={16} aria-hidden="true"/></a>
}
export function OTPField({value,onChange,disabled=false}:{value:string;onChange:(value:string)=>void;disabled?:boolean}){
 const normalize=(text:string)=>text.replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[^0-9]/g,"").slice(0,10);
 return <label className="field eldora-otp" htmlFor="email-otp"><span>رمز الدخول من البريد</span><span className="eldora-otp-slots" dir="ltr" aria-hidden="true">{Array.from({length:Math.max(6,value.length)},(_,i)=><b className={value[i]?"filled":""} key={i}>{value[i]||"—"}</b>)}</span><input id="email-otp" type="text" inputMode="numeric" autoComplete="one-time-code" disabled={disabled} value={value} onChange={e=>onChange(normalize(e.target.value))} maxLength={10} aria-describedby="email-otp-help"/><small id="email-otp-help">الصق الرمز كاملًا أو اكتبه هنا.</small></label>
}
const previews=[["سيرتك الذاتية","خبراتك ومهاراتك في نسخة مرتبة."],["تخصيص للوظيفة","راجع الاقتراحات قبل اعتمادها."],["جاهز للتقديم","سيرة ورسالة واستعداد للمقابلة."]];
export function AnimatedJourney(){
 const [paused,setPaused]=useState(false),ref=useRef<HTMLDivElement>(null),visible=useInView(ref,{margin:"80px"}),reduced=useReducedMotion();
 const cards=previews.map(([title,text],i)=><div className="eldora-list-card" key={title}><span>0{i+1}</span><FileText size={22} aria-hidden="true"/><div><strong>{title}</strong><p>{text}</p></div></div>);
 return <div className="eldora-list-demo" ref={ref}><div className="eldora-list-stage" aria-hidden="true">{!paused&&!reduced&&visible?<AnimatedList columnGap={100} scaleFactor={.035} formationDuration={.65} scrollDownDuration={3}>{cards}</AnimatedList>:<div className="eldora-list-static">{cards}</div>}</div><div className="eldora-list-controls"><span>مثال توضيحي لرحلتك</span><button type="button" disabled={!!reduced} onClick={()=>setPaused(v=>!v)} aria-label={paused?"تشغيل حركة البطاقات":"إيقاف حركة البطاقات"}>{paused||reduced?<Play size={16}/>:<Pause size={16}/>}</button></div></div>
}
export function IntegrationFlow(){return <div className="eldora-integrations" aria-label="السيرة والمساعد وتيليجرام في مساحة مترابطة"><svg viewBox="0 0 600 120" aria-hidden="true" preserveAspectRatio="none"><path d="M70 60H530"/><path className="eldora-photon" d="M70 60H530"/></svg>{[{Icon:FileText,title:"سيرتك"},{Icon:Sparkles,title:"مساعدك"},{Icon:MessageCircle,title:"تيليجرام"}].map(({Icon,title})=><div key={title}><span><Icon size={26} aria-hidden="true"/></span><strong>{title}</strong></div>)}</div>}
