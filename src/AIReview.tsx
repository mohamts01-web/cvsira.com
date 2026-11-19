import { useEffect, useRef, useState } from "react";
import { X, CheckCheck, Eye, Columns2 } from "lucide-react";
import type { Resume, Design } from "./types";
import { resumeChanges } from "../shared/presentation.mjs";
import Paper from "./Paper";
import { ImportCounts } from "./ImportReport";
import type { Vacancy } from "./JobTarget";
export default function AIReview({
  before,
  after,
  design,
  busy,
  onApply,
  onClose,
  appliedKeys = [],
  imported = false,
  vacancy = null,
  onSaveCopy,
  reviewError,
  copyUnavailable,
}: {
  before: Resume;
  after: Resume;
  design: Design;
  busy: boolean;
  onApply: (keys: string[]) => void;
  onClose: () => void;
  appliedKeys?: string[];
  imported?: boolean;
  vacancy?: Vacancy | null;
  onSaveCopy?: () => void;
  reviewError?: string;
  copyUnavailable?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [preview, setPreview] = useState(false);
  const changes = resumeChanges(before, after);
  const remaining = changes.filter(
    (c: { key: string }) => !appliedKeys.includes(c.key),
  );
  useEffect(() => {
    ref.current?.showModal();
    heading.current?.focus();
  }, []);
  return (
    <dialog ref={ref} className="modal ai-review" aria-labelledby="ai-review-heading" onCancel={(event) => {
      event.preventDefault();
      if (!busy) onClose();
    }}>
      <header className="review-heading">
        <div>
          <span className="eyebrow">راجع قبل الاعتماد</span>
          <h2 ref={heading} id="ai-review-heading" tabIndex={-1}>{vacancy ? "راجع سيرتك المخصصة" : "اقتراحك جاهز"}</h2>
          <p>
            {changes.length
              ? `تغيّرت ${changes.length} من أقسام وبيانات السيرة. الأصل محفوظ حتى اعتمادك.`
              : "لم تتغير بيانات السيرة. يمكنك الاحتفاظ بالأصل."}
          </p>
        </div>
        <button
          className="icon-btn"
          aria-label="إغلاق المراجعة"
          disabled={busy}
          onClick={onClose}
        >
          <X />
        </button>
      </header>
      {imported && (
        <div className="review-read-summary">
          البيانات المستخرجة من ملفك
          <ImportCounts data={after} />
        </div>
      )}
      <div className="review-tabs" role="group" aria-label="طريقة مراجعة الاقتراح">
        <button
          className={!preview ? "selected" : ""}
          aria-pressed={!preview}
          onClick={() => setPreview(false)}
        >
          <Columns2 size={17} />
          قبل وبعد
        </button>
        <button
          className={preview ? "selected" : ""}
          aria-pressed={preview}
          onClick={() => setPreview(true)}
        >
          <Eye size={17} />
          معاينة السيرة
        </button>
      </div>
      <div className="review-content">
        {preview ? (
          <div className="review-paper">
            <Paper
              data={after}
              design={design}
              zoom={Math.min(0.85, (window.innerWidth - 80) / 794)}
            />
          </div>
        ) : (
          <div className={vacancy ? "targeted-review" : undefined}>
          {vacancy && <aside className="review-vacancy" aria-label="الوظيفة المستهدفة">
            <h3>{vacancy.title}</h3>
            {vacancy.company && <p>{vacancy.company}</p>}
            {vacancy.aggregate && <p>تختلف المتطلبات حسب المسمى في هذا الإعلان المجمّع.</p>}
            {vacancy.qualification && <p>{vacancy.qualification}</p>}
            {vacancy.experience && <p>{vacancy.experience}</p>}
            {vacancy.description && <details><summary>نص الإعلان</summary><p dir="auto">{vacancy.description}</p></details>}
            <a href={`https://jobs.cvsira.com/j/${vacancy.id}`} target="_blank" rel="noreferrer">عرض الإعلان</a>
          </aside>}
          <div className="change-list">
            {changes.map(
              (c: {
                key: string;
                label: string;
                before: string;
                after: string;
              }) => (
                <section
                  key={c.key}
                  className={appliedKeys.includes(c.key) ? "applied" : ""}
                >
                  <h3>{c.label}</h3>
                  <div className="change-columns">
                    <article>
                      <span>قبل</span>
                      <p dir="auto">{c.before || "لم تُضف بيانات"}</p>
                    </article>
                    <article className="after">
                      <span>الاقتراح</span>
                      <p dir="auto">{c.after || "أزيل هذا المحتوى"}</p>
                    </article>
                  </div>
                  <button
                    className="apply-section-button"
                    disabled={busy || appliedKeys.includes(c.key)}
                    onClick={() => onApply([c.key])}
                  >
                    <CheckCheck size={15} />
                    {appliedKeys.includes(c.key)
                      ? "تم اعتماد هذا القسم"
                      : "اعتماد هذا القسم فقط"}
                  </button>
                </section>
              ),
            )}
          </div>
          </div>
        )}
      </div>
      {reviewError && <p className="review-read-summary" role="alert">{reviewError}</p>}
      {copyUnavailable && <p className="review-read-summary">{copyUnavailable}</p>}
      {onSaveCopy && !copyUnavailable && !appliedKeys.length && changes.length > 0 && (
        <p className="review-read-summary">احفظ نسخة مستقلة لتبقى سيرتك الأساسية متاحة للفرص الأخرى.</p>
      )}
      <footer className="review-actions">
        {onSaveCopy && <button className={copyUnavailable || appliedKeys.length ? "secondary" : "primary"} disabled={Boolean(copyUnavailable) || busy || !changes.length || appliedKeys.length > 0} onClick={onSaveCopy}>حفظ كمسودة جديدة</button>}
        <button
          className={onSaveCopy && !copyUnavailable && !appliedKeys.length ? "secondary" : "primary"}
          disabled={busy || !remaining.length}
          onClick={() => onApply(remaining.map((c: { key: string }) => c.key))}
        >
          <CheckCheck size={18} />
          {vacancy ? "طبّق على المسودة الحالية" : "اعتماد الكل المتبقي"} ({remaining.length})
        </button>
        <button className="secondary" disabled={busy} onClick={onClose}>
          {appliedKeys.length ? "إغلاق المراجعة" : "الاحتفاظ بالأصل"}
        </button>
      </footer>
    </dialog>
  );
}
