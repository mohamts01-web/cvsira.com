// Adapted from the user-supplied Loops two-card slider reference; no Loops endpoints or subscriber pricing.
import {useId,useState} from "react";
import {ArrowLeft,SlidersHorizontal} from "lucide-react";
import {NumberTicker} from "../magicui/number-ticker";
import {customCreditQuote} from "../../../shared/credit-preview.mjs";
import {creditMoney} from "./pricing-table";

export function LoopsPricingSlider({discount,onSelect}:{discount:boolean;onSelect:(points:number,amountMinor:number)=>void}){
  const id=useId();
  const [points,setPoints]=useState(120);
  const [input,setInput]=useState("120");
  const valid=/^\d+$/.test(input)&&Number(input)>=15&&Number(input)<=1000;
  const quote=customCreditQuote(points,discount);
  const change=(value:number)=>{setPoints(value);setInput(String(value));};
  return <section className="credit-custom" aria-labelledby={id+"-title"}>
    <div className="credit-custom-controls"><span className="ds-eyebrow"><SlidersHorizontal size={17} aria-hidden="true"/>رصيد على مقاسك</span><h2 id={id+"-title"}>اختر العدد الذي يناسبك.</h2><p>حرّك المؤشر أو اكتب العدد. يزداد التوفير مع الكميات الأكبر.</p>
      <label className="credit-number-label" htmlFor={id+"-number"}>عدد النقاط</label>
      <div className="credit-number"><input id={id+"-number"} type="number" min={15} max={1000} step={1} inputMode="numeric" dir="ltr" value={input} aria-invalid={!valid} aria-describedby={id+"-hint"} onChange={e=>{const next=e.target.value;setInput(next);if(/^\d+$/.test(next)&&Number(next)>=15&&Number(next)<=1000)setPoints(Number(next));}}/><span>نقطة</span></div>
      <label className="sr-only" htmlFor={id+"-range"}>تحديد عدد النقاط بالسحب</label>
      <input className="credit-range" id={id+"-range"} type="range" min={15} max={1000} step={1} value={points} aria-valuetext={points.toLocaleString("ar-SA")+" نقطة"} onChange={e=>change(Number(e.target.value))} style={{background:`linear-gradient(to left,var(--ui-accent) ${(points-15)/985*100}%,var(--ui-border) ${(points-15)/985*100}%)`}}/>
      <div className="credit-range-ends"><span>١٥ نقطة</span><span>١٬٠٠٠ نقطة</span></div>
      <p id={id+"-hint"} className={!valid?"credit-input-error":""}>{valid?"من ١٥ إلى ١٬٠٠٠ نقطة، دون الالتزام بحزمة جاهزة.":"أدخل عددًا صحيحًا من 15 إلى 1000 نقطة لتحديث السعر."}</p>
      <div className="credit-presets" aria-label="كميات سريعة">{[50,120,500,1000].map(value=><button key={value} type="button" aria-pressed={valid&&points===value} onClick={()=>change(value)}>{value.toLocaleString("ar-SA")}</button>)}</div>
    </div>
    <aside className="credit-custom-total"><span className="ds-eyebrow">ملخص اختيارك</span><h3>{valid?points.toLocaleString("ar-SA")+" نقطة":"راجع عدد النقاط"}</h3><div className="credit-price"><span aria-hidden="true"><NumberTicker value={quote.amountMinor/100} decimalPlaces={2}/></span><span className="sr-only">{creditMoney(quote.amountMinor)}</span><span>ريال</span></div>
      <p>{valid?creditMoney(Math.round(quote.amountMinor/points))+" ريال تقريبًا لكل نقطة":"السعر المعروض لآخر عدد صالح. صحّح العدد للمتابعة."}</p>
      {discount&&<p className="credit-discount-note">قبل الخصم <s>{creditMoney(quote.baseMinor)} ريال</s> · خصم أول شراء ٢٠٪</p>}
      <p>نفس أدوات إلمام، بكمية تختارها. يظهر الإجمالي قبل تأكيد الدفع.</p>
      <button type="button" className="primary" disabled={!valid} onClick={()=>onSelect(points,quote.amountMinor)}>راجع اختيارك<ArrowLeft size={17} aria-hidden="true"/></button>
      <small>تسعير مقترح للمعاينة، دون تنفيذ شراء أو إضافة رصيد.</small>
    </aside>
  </section>;
}
