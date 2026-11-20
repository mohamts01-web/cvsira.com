import {useId,useRef,useState} from "react";
import {motion,useReducedMotion} from "framer-motion";
import {Sparkles,CheckCircle2} from "lucide-react";
import {creditPacks} from "../shared/credit-preview.mjs";
import {PricingTable,creditMoney} from "./components/ui/pricing-table";
import {LoopsPricingSlider} from "./components/ui/pricing-slider-loops";
import "./credit-design.css";

export default function CreditDesignPreview(){
  const [discount,setDiscount]=useState(false),[selection,setSelection]=useState<{points:number;amountMinor:number}|null>(null);
  const summary=useRef<HTMLDivElement>(null),id=useId(),reduced=useReducedMotion();
  function review(points:number,amountMinor:number){setSelection({points,amountMinor});requestAnimationFrame(()=>{summary.current?.focus({preventScroll:true});summary.current?.scrollIntoView({behavior:reduced?"instant":"smooth",block:"center"});});}
  return <div className="credit-design" dir="rtl">
    <p className="credit-preview-note">معاينة الرصيد الجديد · الأرقام والأسعار مقترحة للمراجعة. الشراء ومنحة النقطتين غير مفعّلين في هذه المعاينة.</p>
    <header className="credit-heading"><span className="ds-eyebrow"><Sparkles size={17} aria-hidden="true"/>أدواتك المهنية، على كيفك</span><h1>خطوتك القادمة.<br/><em>برصيد تختاره.</em></h1><p>خصّص سيرتك، استعد للمقابلة وجهّز تقديمك. اختر حزمة أو حدّد رصيدك بنفسك.</p><span className="credit-gift">بداية مقترحة بنقطتين مجانيتين مرة واحدة</span></header>
    <fieldset className="credit-offer-toggle"><legend className="sr-only">عرض السعر المقترح</legend>{[{value:false,label:"السعر الأساسي"},{value:true,label:"أول شراء",badge:"خصم ٢٠٪"}].map(option=><button key={option.label} type="button" aria-pressed={discount===option.value} onClick={()=>{setDiscount(option.value);setSelection(null);}}>{discount===option.value&&<motion.span className="credit-toggle-pill" layoutId={id} transition={{duration:reduced?0:.24}}/>}<span>{option.label}</span>{option.badge&&<small>{option.badge}</small>}</button>)}</fieldset>
    <PricingTable plans={creditPacks} discount={discount} onSelect={plan=>review(plan.points,plan.amountMinor)}/>
    <div className="credit-selection" ref={summary} tabIndex={-1} hidden={!selection} role="status">{selection&&<><CheckCircle2 size={22} aria-hidden="true"/><div><strong>اختيارك {selection.points.toLocaleString("ar-SA")} نقطة مقابل {creditMoney(selection.amountMinor)} ريال</strong><p>هذا استعراض للتصميم. لم يُنشأ طلب دفع ولم يتغير رصيد حسابك.</p></div><button type="button" className="secondary" onClick={()=>setSelection(null)}>إغلاق</button></>}</div>
    <LoopsPricingSlider discount={discount} onSelect={review}/>
    <section className="credit-usage" aria-labelledby={id+"-usage"}><span className="ds-eyebrow">قبل ما تبدأ، تعرف التكلفة</span><h2 id={id+"-usage"}>وين تستخدم نقاطك؟</h2><p>تصوّر مقترح لتكلفة الأدوات. يظهر الخصم من الرصيد قبل تنفيذ كل طلب.</p><div className="credit-usage-grid">{[["تخصيص السيرة لوظيفة","٢ نقطة"],["التحضير لمقابلة","٢ نقطة"],["تحسين قسم من السيرة","٠٫٥ نقطة"],["إجابة المساعد المهنية","٠٫٢ نقطة"],["تجهيز محتوى LinkedIn","٣ نقاط"],["إرسال من بريدك","نقطة لكل إرسال ناجح لمستلم واحد"]].map(([label,cost])=><article key={label}><h3>{label}</h3><strong>{cost}</strong></article>)}</div><p>الإرسال المباشر من Gmail ما زال محصورًا بحسابات الاختبار المصرح بها. إنشاء الرسالة أو تخصيص السيرة له تكلفة مستقلة تظهر قبل التنفيذ.</p></section>
  </div>;
}
