import { Check, ArrowLeft } from "lucide-react";

export default function ToolGuide({
  steps,
  action,
}: {
  steps: string[];
  action?: { href: string; label: string };
}) {
  return (
    <section className="tool-guide" aria-label="طريقة الاستخدام">
      <div>
        <span className="ds-eyebrow">خطوتك التالية واضحة</span>
        <ol>
          {steps.map((step) => (
            <li key={step}>
              <Check size={16} aria-hidden="true" />
              {step}
            </li>
          ))}
        </ol>
      </div>
      {action && (
        <a className="secondary" href={action.href}>
          {action.label}
          <ArrowLeft size={16} />
        </a>
      )}
    </section>
  );
}
