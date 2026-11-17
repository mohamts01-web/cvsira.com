import { useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowDown, Check, FileText, Sparkles, Target, MessageCircle, Layers, Plus } from "lucide-react";
import ClarityPreview from "./ClarityPreview";
import TailoringExample from "./TailoringExample";
import { PolicyLinks } from "./LegalPage";

const journeys = [
  { icon: FileText, title: "قصتك، بصياغة تستحقها.", label: "01 / السيرة الذاتية", text: "اجمع خبراتك ومهاراتك في سيرة عربية أو إنجليزية. شاهدها تتكوّن أمامك، وعدّل كل تفصيل.", action: "ابدأ سيرتك" },
  { icon: Target, title: "لا ترسل نفس السيرة لكل فرصة.", label: "02 / تخصيص للوظيفة", text: "قارن سيرتك بمتطلبات الوظيفة، وراجع اقتراحات التحسين قبل اعتمادها. القرار دائمًا لك.", action: "استكشف المحرر" },
  { icon: MessageCircle, title: "ما بعد السيرة يبدأ هنا.", label: "03 / استعداد مهني", text: "جهّز حضورك على لينكدإن، تدرّب على المقابلة، وتابع طلباتك من مساحتك المهنية.", action: "جرّب مساحة العمل" },
];

function CareerOrb() {
  const points = Array.from({ length: 720 }, (_, i) => {
    const y = 1 - (i / 719) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    const z = Math.sin(theta) * radius;
    return <circle key={i} cx={260 + Math.cos(theta) * radius * 205} cy={260 + y * 205} r={1.1 + (z + 1) * 1.1} opacity={0.2 + (z + 1) * 0.35} />;
  });
  return <div className="career-sphere" aria-hidden="true">
    <svg viewBox="0 0 520 520" className="sphere-dots"><g fill="currentColor">{points}</g></svg>
    <div className="sphere-ring ring-one" /><div className="sphere-ring ring-two" />
    <div className="sphere-center"><div className="orb-brand-plaque"><img src="/elmam-brand.svg" alt="" width="210" height="101" /></div><span>YOUR NEXT CHAPTER</span></div>
    <span className="orb-label orb-label-one"><Sparkles size={16} /> إمكاناتك أوسع</span>
    <span className="orb-label orb-label-two"><Target size={16} /> فرصتك أقرب</span>
  </div>;
}

export default function Home({ onStart, onTry, onPlans }: { onStart: () => void; onTry: (template?: string) => void; onPlans: () => void }) {
  const [journey, setJourney] = useState(0);
  const [ambientMotion, setAmbientMotion] = useState(true);
  const reduced = useReducedMotion();
  const current = journeys[journey];
  const Icon = current.icon;
  const reveal = { initial: reduced ? false as const : { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.6 } };
  return <LazyMotion features={domAnimation}>
    <main className="elmam-home" data-motion={ambientMotion && !reduced ? "playing" : "paused"}>
      <section className="new-hero">
        <div className="container hero-composition">
          <m.div className="hero-editorial" {...reveal}>
            <span className="chapter-label"><span /> مساحة لإمكاناتك القادمة</span>
            <h1>أنت أكثر<br />من <span className="outlined-word">سيرة.</span></h1>
            <p>خبراتك تستحق أن تُرى. إلمام يجمع قصتك المهنية، ويمنحك الأدوات لتقدّمها بثقة — من أول سطر، إلى فرصتك القادمة.</p>
            <div className="new-hero-actions"><button className="primary large" onClick={onStart}>ابدأ فصلك القادم <ArrowLeft size={20} aria-hidden="true" /></button><button className="hero-demo" onClick={() => onTry()}>جرّب قبل أن تبدأ <ArrowLeft size={18} aria-hidden="true" /></button></div>
            <div className="hero-footnote"><Check size={16} aria-hidden="true" /> إنشاء ومعاينة مجانية <span>العربية / English</span></div>
          </m.div>
          <m.div className="hero-orb-scene" {...reveal}><CareerOrb /></m.div>
          <div className="hero-bottom"><span dir="ltr">ELMAM / CAREER STUDIO</span><a href="#how">اكتشف الرحلة <ArrowDown size={16} aria-hidden="true" /></a><button className="motion-toggle" type="button" disabled={!!reduced} aria-pressed={!ambientMotion} onClick={() => setAmbientMotion((value) => !value)}>{reduced ? "حركة مخففة" : ambientMotion ? "إيقاف الحركة" : "تشغيل الحركة"}</button></div>
        </div>
      </section>
      <div className="capability-ribbon"><div className="container"><span>سيرة ذاتية</span><Plus aria-hidden="true" size={16} /><span>تخصيص للفرص</span><Plus aria-hidden="true" size={16} /><span>استعداد للمقابلة</span><Plus aria-hidden="true" size={16} /><span>حضور مهني</span></div></div>
      <section className="container journey-section" id="how">
        <m.div className="section-heading" {...reveal}><span className="chapter-label">01 — من أين تبدأ؟</span><h2>مسارك ليس خطًا واحدًا.<br /><span>أدواتك أيضًا.</span></h2><p>اختر خطوتك. إلمام يساعدك أن تجعلها أوضح.</p></m.div>
        <div className="journey-layout">
          <div className="journey-navigation" role="group" aria-label="استكشف أدوات إلمام">{journeys.map((item, i) => <button key={item.label} className={journey === i ? "active" : ""} aria-pressed={journey === i} onClick={() => setJourney(i)}><span>{item.label}</span><item.icon size={24} aria-hidden="true" /><ArrowLeft size={20} aria-hidden="true" /></button>)}</div>
          <m.article key={journey} className="journey-feature" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}><div className="feature-mark"><Icon size={48} strokeWidth={1.3} aria-hidden="true" /><span dir="ltr">0{journey + 1}</span></div><h3>{current.title}</h3><p>{current.text}</p><button className="text-btn" onClick={() => journey === 0 ? onStart() : onTry()}>{current.action}<ArrowLeft size={18} aria-hidden="true" /></button></m.article>
        </div>
      </section>
      <section className="studio-section" id="templates"><div className="container studio-layout"><m.div {...reveal}><span className="chapter-label">02 — مساحة تصنع الفرق</span><h2>الكلمات لك.<br /><span>والوضوح علينا.</span></h2><p>ثلاثة قوالب، معاينة مباشرة، وتفاصيل تحت تحكمك. اختر الشكل الذي يخدم قصتك، لا العكس.</p><ul className="studio-checks"><li><Check size={18} aria-hidden="true" /> قوالب عربية وإنجليزية</li><li><Check size={18} aria-hidden="true" /> تعديل المحتوى والتصميم</li><li><Check size={18} aria-hidden="true" /> تنزيل PDF ضمن الباقة</li></ul><button className="primary" onClick={() => onTry()}>ادخل الاستوديو <Layers size={18} aria-hidden="true" /></button></m.div><m.div className="studio-preview" {...reveal}><ClarityPreview onUse={onTry} /></m.div></div></section>
      <div className="container tailoring-wrap"><span className="chapter-label">03 — لكل فرصة حكايتها</span><TailoringExample /></div>
      <m.section className="container connection-section" {...reveal}><div className="connection-art" aria-hidden="true"><MessageCircle size={72} strokeWidth={1} /><span>هنا ↔ هناك</span></div><div><span className="chapter-label">مساحة واحدة. أينما كنت.</span><h2>ابدأ هنا.<br />أكمل في تيليجرام.</h2><p>اربط حسابك مرة واحدة لتستعيد مسوداتك وباقتك ورصيدك من الموقع أو البوت.</p><a className="secondary" href="https://t.me/etmam_cv_bot" target="_blank" rel="noreferrer">افتح بوت إلمام <ArrowLeft size={18} aria-hidden="true" /></a></div></m.section>
      <section className="container editorial-guides"><div className="section-heading"><span className="chapter-label">معرفة تفتح الطريق</span><h2>قبل أن تضغط «إرسال».</h2></div><div className="guide-grid">{[["/ats-resume/", "01", "كيف تكتب سيرة متوافقة مع ATS؟"], ["/graduate-resume/", "02", "بداية قوية، حتى دون خبرة طويلة."], ["/english-resume/", "03", "قصتك المهنية، باللغة الإنجليزية."]].map(([href, n, title]) => <a key={href} href={href}><span dir="ltr">READ / {n}</span><h3>{title}</h3><ArrowLeft size={24} aria-hidden="true" /></a>)}</div></section>
      <section className="container new-faq"><div><span className="chapter-label">بوضوح، من البداية</span><h2>أسئلتك،<br />قبل خطوتك.</h2></div><div>{[["هل يمكنني تجربة الموقع مجانًا؟", "نعم، يمكنك إدخال بياناتك ومعاينة السيرة. الحفظ الدائم والاستيراد والذكاء الاصطناعي والتنزيل تحتاج تفعيل باقة."], ["هل أحتاج باقتين للموقع والبوت؟", "لا. اربط الحسابين لتستخدم نفس الباقة والمسودات والرصيد."], ["ماذا يحدث بعد انتهاء الباقة؟", "يمكنك عرض المسودات وتنزيل النسخ المعتمدة سابقًا. استئناف التعديل والذكاء الاصطناعي يحتاج التجديد."]].map(([q, a]) => <details key={q}><summary>{q}<Plus size={20} aria-hidden="true" /></summary><p>{a}</p></details>)}</div></section>
      <section className="closing-section"><div className="container"><span className="chapter-label">الفصل القادم ينتظرك</span><h2>لديك ما يستحق<br />أن <span>يُرى.</span></h2><div><button className="primary large" onClick={onStart}>ابدأ سيرتك الآن <ArrowLeft size={20} aria-hidden="true" /></button><button className="closing-plans" onClick={onPlans}>استكشف الباقة</button></div><div className="closing-pattern" aria-hidden="true" /></div></section>
    </main>
    <footer className="new-footer"><div className="container"><div className="footer-signature"><img src="/elmam-brand.svg" alt="إلمام" width="210" height="101" /><p>مساحة لإمكاناتك القادمة.</p></div><PolicyLinks /><a href="https://t.me/mohamdto21" target="_blank" rel="noreferrer">الدعم والمساعدة <ArrowLeft size={16} aria-hidden="true" /></a><small>سيرتك بالعربية والإنجليزية</small></div></footer>
  </LazyMotion>;
}
