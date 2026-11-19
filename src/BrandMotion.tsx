import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";

export default function BrandMotion() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.getElementById("root");
    if (!root) return;
    const selector = ".elmam-home .primary, .hero-orb-scene, .journey-feature, .guide-grid a, .draft-card, .career-overview article";
    let frame = 0;
    let active: HTMLElement | null = null;
    const reset = () => {
      if (!active) return;
      active.style.removeProperty("--light-x");
      active.style.removeProperty("--light-y");
      active.style.removeProperty("--magnet-x");
      active.style.removeProperty("--magnet-y");
      active.style.removeProperty("--tilt-x");
      active.style.removeProperty("--tilt-y");
      active = null;
    };
    const move = (event: PointerEvent) => {
      const origin = event.target as Element;
      if (origin.closest('.elmam-home[data-motion="paused"]')) {
        cancelAnimationFrame(frame);
        reset();
        return;
      }
      const target = origin.closest<HTMLElement>(selector);
      if (target !== active) reset();
      cancelAnimationFrame(frame);
      if (!target) return;
      active = target;
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        target.style.setProperty("--light-x", `${x}px`);
        target.style.setProperty("--light-y", `${y}px`);
        if (target.matches(".primary") && !target.matches(":disabled")) {
          target.style.setProperty("--magnet-x", `${(x / rect.width - 0.5) * 8}px`);
          target.style.setProperty("--magnet-y", `${(y / rect.height - 0.5) * 6}px`);
        }
        if (target.matches(".hero-orb-scene")) {
          target.style.setProperty("--tilt-x", `${(0.5 - y / rect.height) * 6}deg`);
          target.style.setProperty("--tilt-y", `${(x / rect.width - 0.5) * 6}deg`);
        }
      });
    };
    const leave = () => { cancelAnimationFrame(frame); reset(); };
    const motionObserver = new MutationObserver(() => {
      if (root.querySelector('.elmam-home[data-motion="paused"]')) leave();
    });
    motionObserver.observe(root, { attributes: true, attributeFilter: ["data-motion"], subtree: true });
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    return () => {
      motionObserver.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      leave();
    };
  }, [reduced]);
  return null;
}
