import { useEffect, useId, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const blobs = [
  { size: 180, left: 4, top: 8, delay: -3 },
  { size: 220, left: 58, top: 18, delay: -11 },
  { size: 160, left: 8, top: 68, delay: -7 },
  { size: 190, left: 68, top: 72, delay: -15 },
];

export function NeuralAccessLogin({ children, className }: { children: ReactNode; className?: string }) {
  const filterId = `elmam-liquid-${useId().replace(/:/g, "")}`;
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = root.current;
    if (!element || reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--liquid-x", `${(event.clientX - rect.left - rect.width / 2) * 0.025}px`);
        element.style.setProperty("--liquid-y", `${(event.clientY - rect.top - rect.height / 2) * 0.025}px`);
      });
    };
    const reset = () => { cancelAnimationFrame(frame); element.style.removeProperty("--liquid-x"); element.style.removeProperty("--liquid-y"); };
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", reset);
    return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset); reset(); };
  }, [reduced]);
  return <div ref={root} className={cn("elmam-liquid-login", className)} data-paused={!!reduced} dir="rtl">
    <svg className="liquid-filter" aria-hidden="true" width="0" height="0"><defs><filter id={filterId} colorInterpolationFilters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" /><feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" /></filter></defs></svg>
    <div className="liquid-stage" aria-hidden="true" style={{ filter: `url(#${filterId})` }}>{blobs.map((blob, index) => <div key={index} className="liquid-blob" style={{ width: blob.size, height: blob.size, left: `${blob.left}%`, top: `${blob.top}%`, animationDelay: `${blob.delay}s` }} />)}</div>
    <div className="liquid-content"><div className="liquid-identity"><div className="liquid-logo"><img src="/assets/logo-symbol.svg" alt="إلمام" width="44" height="44" /></div><span>مساحة لإمكاناتك القادمة</span></div>{children}<div className="liquid-footer"><span>حسابك، مسوداتك، وخطوتك القادمة.</span></div></div>
  </div>;
}
export default NeuralAccessLogin;
