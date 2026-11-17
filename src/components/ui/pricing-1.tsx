import type { ReactNode } from "react";
import { CheckIcon, PlusIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/pricing-1-utils/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type PricingPlan = { label: string; description: string; price: string; currency: string; period: string; features: string[] };
const faqs = [
  { value: "purchase", question: "هل تتجدد الباقة تلقائيًا؟", answer: "لا. باقة إلمام CV دفعة واحدة للمدة المعروضة، بدون تجديد تلقائي." },
  { value: "free", question: "هل يمكنني تجربة المحرر قبل الشراء؟", answer: "نعم، إدخال البيانات ومعاينة السيرة مجانيان. الحفظ الدائم والذكاء الاصطناعي والتنزيل تحتاج تفعيل الباقة." },
  { value: "ai", question: "هل تنزيل PDF يستهلك رصيدي؟", answer: "لا، تنزيل PDF لا يخصم من رصيد الذكاء الاصطناعي. تستخدم العمليات للتحسين والترجمة والاستيراد." },
  { value: "templates", question: "هل تدعم القوالب العربية والإنجليزية؟", answer: "نعم، تتوفر ثلاثة قوالب تدعم العربية والإنجليزية ويمكنك معاينتها قبل اختيار الشكل المناسب." },
  { value: "telegram", question: "هل أحتاج باقة أخرى لبوت تيليجرام؟", answer: "لا، اربط حسابك بالبوت لتستخدم الباقة والمسودات والرصيد نفسه من الموقع أو تيليجرام." },
  { value: "expired", question: "ماذا يحدث بعد انتهاء مدة الباقة؟", answer: "يمكنك عرض المسودات وتنزيل النسخ المعتمدة سابقًا. استئناف التعديل والذكاء الاصطناعي يحتاج التجديد." },
];

export function Pricing({ plan, children, sandbox = false }: { plan: PricingPlan; children: ReactNode; sandbox?: boolean }) {
  return <section className="elmam-pricing mx-auto w-full max-w-5xl" aria-label="باقة إلمام والأسئلة الشائعة" dir="rtl">
    <div className="mb-8 flex flex-col items-center gap-4 text-center">
      <Badge variant="outline">باقة واحدة. خطوة أوضح.</Badge>
      <h2 className="text-3xl font-bold text-foreground sm:text-4xl">كل ما تحتاجه لتقدّم قصتك بثقة.</h2>
      <p className="max-w-xl text-base text-muted-foreground">السعر والمدة والرصيد واضحون من البداية.</p>
    </div>
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <article className="elmam-pricing-card flex flex-col gap-6 rounded-4xl bg-card p-6 shadow-elevated-lg sm:p-8" aria-labelledby="whop-plan-title">
        <div className="flex flex-col gap-3"><Badge className="self-start" variant="secondary">{sandbox ? "للاختبار فقط" : "بدون تجديد تلقائي"}</Badge><h3 id="whop-plan-title" className="text-2xl font-bold text-foreground">{plan.label}</h3><p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p></div>
        <div><div className="flex items-baseline gap-3"><strong className="text-6xl font-bold text-foreground">{plan.price}</strong><span className="text-xl text-muted-foreground">{plan.currency}</span></div><p className="mt-3 text-sm text-muted-foreground">{plan.period}</p>{!sandbox && <small className="text-muted-foreground">السعر شامل الضريبة</small>}</div>
        <Separator />
        <ul className="flex flex-col gap-4">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-3"><CheckIcon className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" /><span className="text-sm leading-relaxed text-muted-foreground">{feature}</span></li>)}</ul>
        <div className="elmam-pricing-actions flex flex-col gap-3">{children}</div>
      </article>
      <div className="flex flex-col gap-4"><h3 className="text-sm font-bold text-muted-foreground">أسئلتك قبل خطوتك القادمة</h3><Accordion type="single" collapsible defaultValue="purchase" dir="rtl" className="flex flex-col gap-3">{faqs.map((faq) => <AccordionItem key={faq.value} value={faq.value} className="rounded-2xl border-none bg-muted px-5"><AccordionTrigger className="text-sm text-foreground [&>svg]:hidden"><span className="text-start">{faq.question}</span><PlusIcon className="size-4 shrink-0 text-primary transition-transform group-data-[state=open]:rotate-45" aria-hidden="true" /></AccordionTrigger><AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></div>
    </div>
  </section>;
}
export default Pricing;
