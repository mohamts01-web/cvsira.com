import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, LayoutTemplate } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { defaultDesign, sampleResume, TEMPLATES } from "../shared/model.mjs";
import type { Resume } from "./types";
import Paper from "./Paper";

export default function ClarityPreview({ onUse }: { onUse: (template: string) => void }) {
  const [template, setTemplate] = useState("modern");
  const [zoom, setZoom] = useState(0.48);
  const windowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const selected = TEMPLATES.findIndex((item) => item.id === template);
  const move = (offset: number) => setTemplate(TEMPLATES[(selected + offset + TEMPLATES.length) % TEMPLATES.length].id);
  useEffect(() => {
    const element = windowRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setZoom(Math.min(0.48, entry.contentRect.width / 794));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <m.section
      className="clarity-preview"
      aria-label="معاينة قوالب السيرة الذاتية"
      initial={reduced ? false : { y: 20, rotateX: 3 }}
      whileInView={{ y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="clarity-preview-heading">
        <span className="clarity-preview-icon"><FileText size={20} aria-hidden="true" /></span>
        <div><strong>وضوحك المهني، على ورقة</strong><span>سيرة توضيحية · اختر شكلها</span></div>
        <span className="clarity-preview-status"><CheckCircle2 size={16} aria-hidden="true" /> معاينة</span>
      </div>
      <div className="clarity-template-options" role="group" aria-label="اختر قالب المعاينة">
        {TEMPLATES.map((item) => <button key={item.id} type="button" aria-pressed={template === item.id} onClick={() => setTemplate(item.id)}><LayoutTemplate size={16} aria-hidden="true" />{item.name}</button>)}
      </div>
      <div className="clarity-gallery-controls">
        <button type="button" className="icon-btn" aria-label="القالب السابق" onClick={() => move(-1)}><ArrowRight size={18} aria-hidden="true" /></button>
        <span aria-live="polite">{TEMPLATES[selected]?.name} · {selected + 1} / {TEMPLATES.length}</span>
        <button type="button" className="icon-btn" aria-label="القالب التالي" onClick={() => move(1)}><ArrowLeft size={18} aria-hidden="true" /></button>
      </div>
      <div className="clarity-paper-window" ref={windowRef}><div className="clarity-paper-transition" key={template}><Paper data={sampleResume as Resume} design={{ ...defaultDesign(), template, accent: "#0B1F4B" }} zoom={zoom} /></div></div>
      <div className="clarity-preview-caption"><span>سيرة توضيحية</span><button className="preview-use" type="button" onClick={() => onUse(template)}>حرّر بهذا القالب ←</button></div>
    </m.section>
  );
}
