import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  FileText,
  Sparkles,
  BriefcaseBusiness,
  ArrowLeft,
  Check,
  Pause,
  Play,
} from "lucide-react";
import { MagicCard } from "../components/magicui/magic-card";
import { BlurFade } from "../components/magicui/blur-fade";
import { AnimatedBeam } from "../components/magicui/animated-beam";
import { DotPattern } from "../components/magicui/dot-pattern";
import { BorderBeam } from "../components/magicui/border-beam";

export function ProductCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <MagicCard
      className={"ds-card " + className}
      gradientColor="var(--ui-accent-soft)"
      gradientFrom="var(--ui-accent)"
      gradientTo="var(--ui-strong-border)"
      gradientOpacity={0.4}
    >
      {children}
    </MagicCard>
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BlurFade
      className={className}
      duration={0.42}
      offset={10}
      blur="3px"
      inView
    >
      {children}
    </BlurFade>
  );
}
export function CareerFlow({ compact = false }: { compact?: boolean }) {
  const container = useRef<HTMLDivElement>(null),
    cv = useRef<HTMLDivElement>(null),
    ai = useRef<HTMLDivElement>(null),
    job = useRef<HTMLDivElement>(null);
  const visible = useInView(container),
    reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const active = visible && pageVisible && !reduced && !paused;
  return (
    <div className={"ds-flow " + (compact ? "compact" : "")} ref={container}>
      <DotPattern width={24} height={24} className="ds-dots" />
      <div className="ds-flow-nodes">
        <div ref={cv}>
          <FileText />
          <span>سيرتك</span>
        </div>
        <div ref={ai} className="ds-flow-center">
          <Sparkles />
          <span>إلمام CV</span>
        </div>
        <div ref={job}>
          <BriefcaseBusiness />
          <span>فرصتك</span>
        </div>
      </div>
      {active && (
        <>
          <AnimatedBeam
            containerRef={container}
            fromRef={cv}
            toRef={ai}
            duration={4}
            pathColor="var(--ui-border)"
            gradientStartColor="var(--ui-accent)"
            gradientStopColor="var(--ui-accent-text)"
          />
          <AnimatedBeam
            containerRef={container}
            fromRef={ai}
            toRef={job}
            duration={4}
            delay={1}
            pathColor="var(--ui-border)"
            gradientStartColor="var(--ui-accent)"
            gradientStopColor="var(--ui-accent-text)"
          />
        </>
      )}
      <p>من خبرتك إلى سيرة تناسب الفرصة.</p>
      {!reduced && (
        <button
          className="ds-motion-toggle"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "تشغيل حركة المشهد" : "إيقاف حركة المشهد"}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
    </div>
  );
}
export function MagicHero({
  onStart,
  onTry,
}: {
  onStart: () => void;
  onTry: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <section className="ds-hero">
      <div className="ds-hero-copy">
        <span className="ds-eyebrow">
          <span />
          مساحتك المهنية، بخطوة أوضح
        </span>
        <Reveal>
          <h1>
            خبرتك تستحق
            <br />
            <em>سيرة تحكيها.</em>
          </h1>
        </Reveal>
        <p>
          أنشئ سيرتك بالعربية أو الإنجليزية، خصّصها للوظيفة، وراجع اقتراحات
          المساعد قبل اعتمادها.
        </p>
        <div className="ds-hero-actions">
          <button className="primary large" onClick={onStart}>
            أنشئ سيرتك الآن
            <ArrowLeft size={18} />
          </button>
          <button className="secondary large" onClick={onTry}>
            جرّب المحرر
          </button>
        </div>
        <div className="ds-hero-proof">
          <span>
            <Check size={16} />
            معاينة مباشرة
          </span>
          <span>
            <Check size={16} />
            PDF وWord
          </span>
          <span>
            <Check size={16} />
            عربي وإنجليزي
          </span>
        </div>
      </div>
      <Reveal className="ds-product-scene">
        <div className="ds-scene-bar">
          <span className="ds-window-dots">● ● ●</span>
          <span>سيرتك، في سياق الفرصة</span>
          <span className="ds-live-dot" />
        </div>
        <CareerFlow />
        <div className="ds-scene-paper">
          <div className="ds-scene-name">
            <FileText size={24} />
            <div>
              <strong>اسمك الكامل</strong>
              <span>المسمى المهني · المدينة</span>
            </div>
            <span className="ds-tag">معاينة توضيحية</span>
          </div>
          {["ملخص مهني واضح", "خبراتك وإنجازاتك", "مهارات تناسب الوظيفة"].map(
            (text, i) => (
              <div className="ds-paper-section" key={text}>
                <span>{text}</span>
                <div>
                  <i style={{ width: 88 - i * 10 + "%" }} />
                  <i style={{ width: 60 + i * 8 + "%" }} />
                </div>
                <Check size={16} />
              </div>
            ),
          )}
        </div>
        <div className="ds-scene-foot">
          <Sparkles size={16} />
          <span>اقتراحات تراجعها. ونسخة تعتمدها.</span>
        </div>
        {!reduced && (
          <BorderBeam
            duration={8}
            colorFrom="var(--ui-accent)"
            colorTo="var(--ui-accent-text)"
            size={180}
          />
        )}
      </Reveal>
    </section>
  );
}
