import { useEffect, useRef } from "react";

export default function PricingPreview() {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let observer: ResizeObserver | undefined;

    function fitContent() {
      observer?.disconnect();
      const body = element?.contentDocument?.body;
      if (!body || !element) return;
      const resize = () => {
        element.style.height = `${Math.ceil(body.getBoundingClientRect().height)}px`;
      };
      observer = new ResizeObserver(resize);
      observer.observe(body);
      resize();
    }

    element.addEventListener("load", fitContent);
    if (element.contentDocument?.readyState === "complete") fitContent();
    return () => {
      element.removeEventListener("load", fitContent);
      observer?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={frame}
      className="pricing-preview-frame"
      src="/pricing-experience/index.html"
      title="معاينة باقات إلمام CV التفاعلية"
    />
  );
}

