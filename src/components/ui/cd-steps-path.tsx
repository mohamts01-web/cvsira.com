import * as React from "react";
import {animate,motion,useInView,useMotionValue,useMotionValueEvent,useReducedMotion,useSpring,useTransform,type MotionValue} from "framer-motion";
import {ArrowLeft,ArrowRight,Check,Moon,Pause,Play,RotateCcw,Sun} from "lucide-react";
import {cn} from "@/lib/utils";
import {clampStep,pathX,pathWave,stepAtX} from "./steps-path-geometry";

// Adapted from the user's supplied 21st StepsPath component.
export interface PathStep {id:string;title:string;body:string;icon?:React.ReactNode}
export interface StepsPathProps {
 steps:PathStep[];title?:string;defaultStep?:number;theme?:"system"|"light"|"dark";accentColor?:string;
 autoPlay?:boolean;autoPlayInterval?:number;onChange?:(index:number)=>void;className?:string;
 dir?:"rtl"|"ltr";onThemeChange?:()=>void;
}
const ACCENT="var(--sp-gold)",PH=92;
const number=(value:number)=>value.toLocaleString("ar-SA");
function StepCard({s,i,pos,w,reduce,active,total,rtl}:{s:PathStep;i:number;pos:MotionValue<number>;w:number;reduce:boolean;active:boolean;total:number;rtl:boolean}){
 const d=useTransform(pos,p=>i-p);
 const x=useTransform(d,v=>(rtl?-1:1)*(reduce?v*(w+16):Math.sign(v)*Math.min(Math.abs(v),1)*w*.7+Math.max(0,Math.abs(v)-1)*w*.2*Math.sign(v)));
 const rotateY=useTransform(d,v=>reduce?0:Math.max(-1.3,Math.min(1.3,v))*(rtl?30:-30));
 const scale=useTransform(d,v=>reduce?1:1-Math.min(Math.abs(v),2)*.1);
 const opacity=useTransform(d,v=>Math.max(0,1-Math.abs(v)*(reduce?1:.45)));
 const zi=useTransform(d,v=>100-Math.round(Math.abs(v)*10));
 const num=useTransform(d,v=>reduce?0:v*(rtl?30:-30));
 return <motion.li aria-hidden={!active} aria-roledescription="بطاقة خطوة" aria-label={"الخطوة "+number(i+1)+" من "+number(total)+": "+s.title} className="absolute left-1/2 top-0 list-none" style={{width:w,marginLeft:-w/2,x,rotateY,scale,opacity,zIndex:zi}}>
  <div className="sp-card relative overflow-hidden rounded-3xl border border-border bg-card p-5">
   <motion.span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none text-[120px] font-black leading-none text-primary/10" style={{x:num}}>{number(i+1)}</motion.span>
   <div className="relative flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl text-primary-foreground" style={{background:"linear-gradient(135deg,var(--primary),"+ACCENT+")"}}>{s.icon??<span className="font-bold">{number(i+1)}</span>}</span><p className="text-xs font-semibold text-muted-foreground">الخطوة {number(i+1)}</p></div>
   <h3 className="relative mt-3 text-xl font-semibold">{s.title}</h3><p className="relative mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
  </div>
 </motion.li>
}
function useDark(theme:"system"|"light"|"dark"){
 const [dark,setDark]=React.useState(theme==="dark");
 React.useEffect(()=>{if(theme!=="system"){setDark(theme==="dark");return}
  const media=matchMedia("(prefers-color-scheme: dark)");setDark(media.matches);
  const change=(event:MediaQueryListEvent)=>setDark(event.matches);media.addEventListener("change",change);return()=>media.removeEventListener("change",change);
 },[theme]);return [dark,setDark] as const;
}
export function StepsPath({steps,title="رحلتك في إلمام CV",defaultStep=0,theme="system",accentColor="var(--ui-accent)",autoPlay=false,autoPlayInterval=4800,onChange,className,dir="rtl",onThemeChange}:StepsPathProps){
 const reduce=!!useReducedMotion(),rtl=dir==="rtl";
 const [dark,setDark]=useDark(theme);
 const n=steps.length,last=Math.max(1,n-1),box=React.useRef<HTMLDivElement>(null);
 const inView=useInView(box,{amount:.3});
 const [width,setWidth]=React.useState(520),[step,setStep]=React.useState(()=>clampStep(defaultStep,n)),[burst,setBurst]=React.useState(0),[playing,setPlaying]=React.useState(autoPlay&&!reduce);
 const [hovered,setHovered]=React.useState(false),[pageVisible,setPageVisible]=React.useState(true);
 const stage=React.useRef<HTMLDivElement>(null),[cardHeight,setCardHeight]=React.useState(255);
 const stepRef=React.useRef(step);stepRef.current=step;
 const notifiedStep=React.useRef(step);
 const pos=useMotionValue(clampStep(defaultStep,n)),spring=useSpring(pos,{stiffness:400,damping:40}),sp=reduce?pos:spring;
 const widthValue=useMotionValue(width),rtlValue=useMotionValue(rtl?1:0),lastValue=useMotionValue(last);
 const animation=React.useRef<{stop:()=>void}|null>(null),mounted=React.useRef(true),epoch=React.useRef(0);
 const drag=React.useRef<{v:number;t:number;p:number;kind:"knob"|"card";x:number;y:number;locked:boolean}|null>(null);
 const gradientId="sp-grad-"+React.useId().replace(/:/g,"");
 React.useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;epoch.current++;animation.current?.stop()}},[]);
 React.useEffect(()=>{const el=box.current;if(!el)return;const resize=()=>setWidth(Math.max(100,el.offsetWidth));const observer=new ResizeObserver(resize);observer.observe(el);resize();return()=>observer.disconnect()},[]);
 React.useEffect(()=>{widthValue.set(width);rtlValue.set(rtl?1:0);lastValue.set(last)},[width,rtl,last,widthValue,rtlValue,lastValue]);
 React.useEffect(()=>{animation.current?.stop();pos.set(clampStep(stepRef.current,n));setStep(clampStep(stepRef.current,n))},[n,pos]);
 React.useEffect(()=>{const el=stage.current;if(!el)return;const cards=[...el.querySelectorAll<HTMLElement>(".sp-card")];const resize=()=>setCardHeight(Math.max(230,...cards.map(card=>card.offsetHeight))+12);const observer=new ResizeObserver(resize);cards.forEach(card=>observer.observe(card));resize();return()=>observer.disconnect()},[steps,width]);
 React.useEffect(()=>{const change=()=>setPageVisible(!document.hidden);change();document.addEventListener("visibilitychange",change);return()=>document.removeEventListener("visibilitychange",change)},[]);
 React.useEffect(()=>{if(reduce){animation.current?.stop();epoch.current++;pos.set(clampStep(stepRef.current,n));setPlaying(false)}},[reduce,n,pos]);
 useMotionValueEvent(pos,"change",value=>{if(!drag.current)return;const rounded=clampStep(value,n);stepRef.current=rounded;setStep(previous=>previous===rounded?previous:rounded)});
 const route=React.useMemo(()=>Array.from({length:90},(_,i)=>{const t=i/89;return (i?"L":"M")+pathX(t,width,rtl).toFixed(1)+" "+pathWave(t).toFixed(1)}).join(" "),[width,rtl]);
 const filled=useTransform(()=>{const t=Math.max(0,Math.min(1,sp.get()/lastValue.get())),count=Math.max(2,Math.round(t*90));return Array.from({length:count},(_,i)=>{const at=i/(count-1)*t;return (i?"L":"M")+pathX(at,widthValue.get(),!!rtlValue.get()).toFixed(1)+" "+pathWave(at).toFixed(1)}).join(" ")});
 const knobX=useTransform(()=>pathX(sp.get()/lastValue.get(),widthValue.get(),!!rtlValue.get())-22),knobY=useTransform(()=>pathWave(Math.max(0,Math.min(1,sp.get()/lastValue.get())))-22);
 const settle=React.useCallback((target:number,velocity=0)=>{
  if(!n)return;const next=clampStep(target,n),changed=next!==notifiedStep.current;stepRef.current=next;notifiedStep.current=next;setStep(next);if(changed)onChange?.(next);
  animation.current?.stop();const current=++epoch.current;
  if(reduce){pos.set(next);return}
  const run=animate(pos,next,{type:"spring",stiffness:160,damping:17,velocity});animation.current=run;
  run.then(()=>{if(mounted.current&&current===epoch.current)setBurst(value=>value+1)});
 },[n,onChange,pos,reduce]);
 React.useEffect(()=>{if(!playing||reduce||n<2||!inView||!pageVisible||hovered)return;const timer=window.setInterval(()=>{if(!drag.current)settle(stepRef.current>=n-1?0:stepRef.current+1)},Math.max(1500,autoPlayInterval));return()=>clearInterval(timer)},[playing,reduce,n,inView,pageVisible,hovered,autoPlayInterval,settle]);
 const begin=(kind:"knob"|"card")=>(event:React.PointerEvent)=>{if(event.pointerType==="mouse"&&event.button!==0)return;setPlaying(false);animation.current?.stop();pos.stop();if(kind==="knob")event.currentTarget.setPointerCapture(event.pointerId);drag.current={v:0,t:performance.now(),p:pos.get(),kind,x:event.clientX,y:event.clientY,locked:kind==="knob"}};
 const move=(event:React.PointerEvent)=>{
  const state=drag.current;if(!state)return;
  const dx=event.clientX-state.x,dy=event.clientY-state.y;
  if(state.kind==="card"&&!state.locked){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag.current=null;return}if(Math.abs(dx)<8)return;state.locked=true;event.currentTarget.setPointerCapture(event.pointerId)}
  const next=state.kind==="knob"?stepAtX(event.clientX-box.current!.getBoundingClientRect().left,width,n,rtl):state.p-dx/(Math.max(120,Math.min(300,width-60))*.7)*(rtl?-1:1);
  const now=performance.now();state.v=(next-pos.get())/Math.max(1,now-state.t)*1000;state.t=now;pos.set(Math.max(-.2,Math.min(n-.8,next)));
 };
 const end=()=>{const state=drag.current;drag.current=null;if(state)settle(Math.round(pos.get()+state.v*.1),state.v)};
 const keyboard=(event:React.KeyboardEvent)=>{const current=stepRef.current;const map:Record<string,number>={ArrowRight:current+(rtl?-1:1),ArrowLeft:current+(rtl?1:-1),ArrowUp:current+1,ArrowDown:current-1,Home:0,End:n-1};if(event.key in map){event.preventDefault();setPlaying(false);settle(map[event.key])}};
 const cw=Math.max(120,Math.min(300,width-60)),isLast=step===n-1;
 const button="sp-icon-button grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted disabled:opacity-35";
 if(!n)return null;
 return <div data-component="steps-path" dir={dir} className={cn(dark&&"dark","w-full max-w-xl steps-path",className)} style={{"--sp-gold":accentColor} as React.CSSProperties}>
  <section aria-roledescription="عرض خطوات تفاعلي" aria-label={title} className="relative w-full overflow-hidden rounded-3xl border border-border bg-background p-5 pb-6 text-foreground" onPointerEnter={()=>setHovered(true)} onPointerLeave={()=>setHovered(false)} onFocusCapture={event=>{if(!(event.target as HTMLElement).closest("[data-step-play]"))setPlaying(false)}}>
   <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{background:"radial-gradient(60% 40% at 50% 0%, color-mix(in oklab, "+ACCENT+" 16%, transparent), transparent),radial-gradient(50% 40% at 100% 100%, color-mix(in oklab,var(--primary) 12%,transparent),transparent)"}}/>
   <div className="relative flex items-center justify-between gap-3"><div><h2 className="sp-title text-lg font-semibold">{title}</h2><p className="sp-counter text-sm tabular-nums text-muted-foreground" aria-live={playing?"off":"polite"} aria-atomic="true">الخطوة {number(step+1)} من {number(n)}: {steps[step]?.title}{playing?" · عرض تلقائي":""}</p></div><div className="flex shrink-0 items-center gap-2">
    <button type="button" data-step-play aria-pressed={playing} aria-label={playing?"إيقاف عرض الخطوات":"تشغيل عرض الخطوات"} disabled={reduce||n<2} onClick={()=>setPlaying(value=>!value)} className={button}>{playing?<Pause className="size-4" aria-hidden="true"/>:<Play className="size-4" aria-hidden="true"/>}</button>
    <button type="button" aria-label={dark?"تفعيل الوضع الفاتح للموقع":"تفعيل الوضع الداكن للموقع"} onClick={()=>onThemeChange?onThemeChange():setDark(value=>!value)} className={button}>{dark?<Sun className="size-4" aria-hidden="true"/>:<Moon className="size-4" aria-hidden="true"/>}</button>
   </div></div>
   <div ref={box} className="relative mt-3 touch-none select-none" style={{height:PH}}>
    <svg width={width} height={PH} className="absolute inset-0 overflow-visible" aria-hidden="true"><defs><linearGradient id={gradientId} x1={rtl?"1":"0"} x2={rtl?"0":"1"}><stop offset="0" stopColor="var(--primary)"/><stop offset="1" stopColor={ACCENT}/></linearGradient></defs><path d={route} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 11" className="stroke-border"/><motion.path d={filled} fill="none" strokeWidth="6" strokeLinecap="round" stroke={"url(#"+gradientId+")"} style={{filter:"drop-shadow(0 0 6px color-mix(in oklab,var(--primary) 45%,transparent))"}}/></svg>
    {steps.map((s,i)=>{const t=i/last;return <button key={s.id} type="button" aria-current={i===step?"step":undefined} aria-label={"انتقل إلى الخطوة "+number(i+1)+": "+s.title} onClick={()=>{setPlaying(false);settle(i)}} className="sp-icon-button absolute grid size-11 place-items-center rounded-full" style={{left:pathX(t,width,rtl)-22,top:pathWave(t)-22}}><motion.span className={cn("grid size-7 place-items-center rounded-full border-2 text-xs font-bold",i<=step?"border-primary bg-primary text-primary-foreground":"border-border bg-card text-muted-foreground")} animate={{scale:reduce?1:i===step?1.15:1}} transition={reduce?{duration:0}:{type:"spring",stiffness:400,damping:16}}>{i<step?<Check className="size-3.5" aria-hidden="true"/>:number(i+1)}</motion.span></button>})}
    <motion.div className="absolute left-0 top-0 size-11" style={{x:knobX,y:knobY}}>
     {burst>0&&!reduce&&<span key={burst} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">{Array.from({length:10},(_,k)=>{const angle=k/10*Math.PI*2;return <motion.span key={k} className="absolute -ml-[3px] -mt-[3px] block size-1.5 rounded-full" style={{background:k%2?ACCENT:"var(--primary)"}} initial={{x:0,y:0,opacity:1,scale:1}} animate={{x:Math.cos(angle)*34,y:Math.sin(angle)*34,opacity:0,scale:.2}} transition={{duration:.7,ease:"easeOut"}}/>})}</span>}
     <div role="slider" tabIndex={0} aria-label="خطوة الرحلة" aria-orientation="horizontal" aria-valuemin={1} aria-valuemax={n} aria-valuenow={step+1} aria-valuetext={"الخطوة "+number(step+1)+": "+steps[step]?.title} onKeyDown={keyboard} onPointerDown={begin("knob")} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} className="sp-slider grid size-11 cursor-grab place-items-center rounded-full active:cursor-grabbing"><motion.span className="block size-7 rounded-full border-[3px] border-card" style={{background:"linear-gradient(135deg,"+ACCENT+",var(--primary))",boxShadow:"0 0 0 2px var(--primary),0 8px 18px -4px color-mix(in oklab,var(--primary) 60%,transparent)"}} whileTap={reduce?undefined:{scale:1.2}}/></div>
    </motion.div>
   </div>
   <div ref={stage} onPointerDown={begin("card")} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} className="relative mt-2 touch-pan-y cursor-grab select-none active:cursor-grabbing" style={{height:cardHeight,perspective:1000}}><ul className="relative h-full">{steps.map((s,i)=><StepCard key={s.id} s={s} i={i} pos={pos} w={cw} reduce={reduce} active={i===step} total={n} rtl={rtl}/>)}</ul></div>
   <div className="relative mt-3 flex items-center justify-between gap-3"><button type="button" className={button} aria-label="الخطوة السابقة" disabled={step===0} onClick={()=>{setPlaying(false);settle(step-1)}}>{rtl?<ArrowRight className="size-4" aria-hidden="true"/>:<ArrowLeft className="size-4" aria-hidden="true"/>}</button><p className="sp-hint text-center text-xs text-muted-foreground">اسحب المؤشر أو البطاقات، أو استخدم الأسهم.</p><button type="button" onClick={()=>{setPlaying(false);settle(isLast?0:step+1)}} className="sp-next flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">{isLast?<>من البداية<RotateCcw className="size-4" aria-hidden="true"/></>:<>التالي{rtl?<ArrowLeft className="size-4" aria-hidden="true"/>:<ArrowRight className="size-4" aria-hidden="true"/>}</>}</button></div>
  </section>
 </div>;
}
