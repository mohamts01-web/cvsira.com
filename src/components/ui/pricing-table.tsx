// Adapted from the pricing-table reference supplied by the user.
// Uses the project's existing Framer Motion and number ticker instead of missing template utilities.
import {motion,useReducedMotion} from "framer-motion";
import {Check,ArrowLeft} from "lucide-react";
import {NumberTicker} from "../magicui/number-ticker";

export type CreditPlan={id:string;name:string;points:number;amountMinor:number;description:string;popular?:boolean};
export const creditMoney=(minor:number)=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:minor%100?2:0,maximumFractionDigits:2}).format(minor/100);
export function PricingTable({plans,discount,onSelect}:{plans:CreditPlan[];discount:boolean;onSelect:(plan:CreditPlan)=>void}){
  const reduce=useReducedMotion();
  return <div className="credit-plan-grid">{plans.map(plan=>{
    const price=discount?Math.round(plan.amountMinor*.8):plan.amountMinor;
    return <motion.section key={plan.id} className={"credit-plan "+(plan.popular?"is-popular":"")} aria-labelledby={"credit-plan-"+plan.id} whileHover={reduce?undefined:{y:-4}} transition={{duration:.2}}>
      {plan.popular&&<span className="credit-popular">الخيار الموصى به</span>}
      <span className="credit-plan-symbol" aria-hidden="true">{plan.popular?"✦":"✧"}</span>
      <h2 id={"credit-plan-"+plan.id}>{plan.name}</h2><p>{plan.description}</p>
      <div className="credit-quantity"><strong>{plan.points.toLocaleString("ar-SA")}</strong><span>نقطة</span></div>
      <div className="credit-price"><span aria-hidden="true"><NumberTicker value={price/100} decimalPlaces={discount?2:0}/></span><span className="sr-only">{creditMoney(price)}</span><span>ريال</span></div>
      <div className="credit-price-note">{discount?<><s>{creditMoney(plan.amountMinor)} ريال</s><span>وفّر ٢٠٪ لأول شراء</span></>:<span>شراء مرة واحدة · دون تجديد تلقائي</span>}</div>
      <button type="button" className={plan.popular?"primary":"secondary"} onClick={()=>onSelect({...plan,amountMinor:price})}>اختر {plan.name}<ArrowLeft size={17} aria-hidden="true"/></button>
      <ul>{["استخدم الرصيد في الأدوات التي تحتاجها","تكلفة واضحة قبل تنفيذ الطلب","الطلب الفاشل لا يستهلك رصيدًا"].map(feature=><li key={feature}><Check size={17} aria-hidden="true"/>{feature}</li>)}</ul>
    </motion.section>;
  })}</div>;
}
