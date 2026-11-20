import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpLeft, Check, FileText, Layers, Mail, Pause, Play, Sparkles, Target } from "lucide-react";

const scenes = [
  { label: "ابنِ سيرتك", icon: FileText, title: "خبرتك تأخذ شكلها", note: "من بياناتك إلى سيرة واضحة" },
  { label: "خصّصها للفرصة", icon: Target, title: "تفاصيلك المناسبة لهذه الوظيفة", note: "اقتراح تراجعه قبل الاعتماد" },
  { label: "جهّز تقديمك", icon: Mail, title: "سيرتك ورسالتك في مكان واحد", note: "أنت تختار المستلم وتراجع الإرسال" },
];

function ResumeSheet({ tailored }: { tailored: boolean }) {
  return <div className="showcase-resume" aria-hidden="true">
    <div className="showcase-resume-top"><span>CV</span><span>إلمام</span></div>
    <strong>سارة عبدالله</strong><small>أخصائية عمليات</small>
    <div className="showcase-contact">الرياض · sara@example.com</div>
    <b>الملخص المهني</b>
    <p>{tailored ? "تنسيق العمليات ومتابعة الطلبات وإعداد تقارير تدعم وضوح سير العمل." : "خبرة في تنظيم البيانات ومتابعة الطلبات والتنسيق بين فرق العمل."}</p>
    <b>الخبرات المهنية</b>
    <div className="showcase-resume-row"><span>أخصائية عمليات</span><small>٢٠٢٣ — الآن</small></div>
    <p>تنظيم الطلبات اليومية والتنسيق مع الأقسام المعنية.</p>
    <div className={tailored ? "showcase-highlight" : ""}>إعداد تقارير المصروفات باستخدام Excel.</div>
    <b>المهارات</b><div className="showcase-skills"><i>Excel</i><i>تنسيق العمليات</i><i>إعداد التقارير</i></div>
  </div>;
}

export default function CareerShowcase({ animated }: { animated: boolean }) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!animated || !playing) return;
    const timer = window.setInterval(() => setScene(value => (value + 1) % scenes.length), 4200);
    return () => window.clearInterval(timer);
  }, [animated, playing]);
  const current = scenes[scene];
  const transition = { duration: animated ? .55 : 0, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  return <section className="career-showcase" aria-label="جرّب مشاهد رحلة السيرة">
    <div className="showcase-toolbar"><span><span className="showcase-live" />معاينة تفاعلية</span>
      {animated && <button type="button" className="showcase-play" aria-label={playing ? "إيقاف العرض التلقائي" : "تشغيل العرض التلقائي"} aria-pressed={playing} onClick={() => setPlaying(!playing)}>
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>}
    </div>
    <div className="showcase-stage" data-scene={scene}>
      <div className="showcase-grid" aria-hidden="true" />
      <div className="showcase-orbit orbit-one" aria-hidden="true" />
      <div className="showcase-orbit orbit-two" aria-hidden="true" />
      <div className="showcase-line" aria-hidden="true"><i /></div>
      <div className="showcase-satellite satellite-one" aria-hidden="true"><Sparkles size={23} /></div>
      <div className="showcase-satellite satellite-two" aria-hidden="true"><Layers size={21} /></div>
      <m.div className="showcase-paper-position" animate={{ rotate: scene === 0 ? -7 : scene === 1 ? -3 : -10, x: scene === 2 ? 28 : 0, y: scene === 2 ? -30 : 0 }} transition={transition}>
        <ResumeSheet tailored={scene > 0} />
      </m.div>
      <AnimatePresence mode="wait">
        {scene === 0 ? <m.div key="build" className="showcase-floating-card showcase-build" initial={{opacity: 0, y: animated ? 18 : 0}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} transition={transition}>
          <span className="showcase-card-icon"><FileText size={21} /></span><div><strong>سيرتك تتكوّن أمامك</strong><span>الخبرة · التعليم · المهارات</span></div><Check size={17} />
        </m.div> : scene === 1 ? <m.div key="target" className="showcase-floating-card showcase-target" initial={{opacity: 0, x: animated ? -28 : 0}} animate={{opacity: 1, x: 0}} exit={{opacity: 0}} transition={transition}>
          <div className="showcase-job-heading"><span className="showcase-card-icon"><Target size={21} /></span><div><small>مثال لوظيفة</small><strong>أخصائي عمليات</strong></div><ArrowUpLeft size={20} /></div>
          <p>المتطلب في الإعلان</p><b>إعداد التقارير باستخدام Excel</b>
          <span className="showcase-match"><Check size={14} /> مهارة مذكورة في السيرة</span>
        </m.div> : <m.div key="send" className="showcase-envelope" initial={{opacity: 0, y: animated ? 28 : 0}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} transition={transition}>
          <div className="showcase-envelope-flap" aria-hidden="true" /><span className="showcase-mail-seal"><Mail size={25} /></span>
          <strong>طلب تقديم على وظيفة</strong><span>رسالتك + السيرة المخصصة.pdf</span>
          <span className="showcase-envelope-action"><Check size={14} /> جاهزة لمراجعتك</span>
        </m.div>}
      </AnimatePresence>
      <span className="showcase-file-chip" aria-hidden="true"><Check size={14} /> عربي / English</span>
    </div>
    <div className="showcase-caption" aria-live={playing && animated ? "off" : "polite"}><strong>{current.title}</strong><span>{current.note}</span></div>
    <div className="showcase-tabs" role="group" aria-label="اختر مشهد السيرة">
      {scenes.map(({ label, icon: Icon }, index) => <button type="button" key={label} aria-pressed={scene === index} onClick={() => { setScene(index); setPlaying(false); }}>
        <Icon size={17} aria-hidden="true" /><span>{label}</span>
      </button>)}
    </div>
  </section>;
}

export function ConnectedWorkspace() {
  return <div className="connected-workspace" aria-label="المسودة نفسها في الموقع وتيليجرام">
    <div className="connected-web"><div className="connected-window-dots"><i /><i /><i /></div>
      <FileText size={32} aria-hidden="true" /><strong>سيرتي المهنية</strong><span>الموقع</span>
      <div className="connected-lines" aria-hidden="true"><i /><i /><i /></div>
      <small><Check size={13} /> محفوظة في حسابك</small>
    </div>
    <div className="connected-flow" aria-hidden="true"><i /><i /><i /></div>
    <div className="connected-phone"><div className="connected-phone-speaker" /><div className="connected-chat-head"><img src="/elmam-brand.svg" alt="" width="40" height="22" /><span>بوت إلمام</span></div>
      <div className="connected-bubble">أكمل سيرتك من هنا</div><div className="connected-chat-file"><FileText size={25} /><span>سيرتي المهنية.pdf</span></div>
      <div className="connected-chat-button">افتح المسودة <ArrowUpLeft size={14} /></div>
    </div>
  </div>;
}

