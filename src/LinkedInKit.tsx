import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { api } from "./api";
import type { Draft, Entry, Resume } from "./types";

export function LinkedInLibrary({ drafts }: { drafts: Draft[] }) {
  const [ids, setIds] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    api.linkedInDraftIds().then((saved) => {
      if (active) setIds(saved);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  const profiles = drafts.filter(({ id }) => ids?.includes(id));
  return <section className="interview-library" aria-labelledby="linkedin-library-title">
    <h2 id="linkedin-library-title">ملفات LinkedIn</h2>
    {!ids ? <p role="status">{failed ? "تعذّر تحميل الملفات المحفوظة." : "جارٍ تحميل ملفات LinkedIn…"}</p>
      : profiles.length ? <ul>{profiles.map((draft) => <li key={draft.id}>
        <a href={`/editor/${draft.id}#linkedin-kit`}>{draft.title}</a>
      </li>)}</ul>
      : <p>احفظ تعديلات LinkedIn من مساعد إحدى المسودات لتظهر هنا.</p>}
  </section>;
}

function entryText(entry: Entry) {
  const heading = [
    entry.title, entry.major, entry.organization,
    [entry.start, entry.end].filter(Boolean).join(" – "),
  ].map((part) => part?.trim()).filter(Boolean).join(" | ");
  const bullets = [...(entry.details ?? []), ...(entry.achievements ?? [])]
    .map((line) => line.trim()).filter(Boolean);
  return [heading, ...[...new Set(bullets)].map((line) => `• ${line}`)].filter(Boolean).join("\n");
}

function ProfileText({ label, initial, value, rows, onChange, onStatus }: {
  label: string;
  initial: string;
  value: string;
  rows: number;
  onStatus: (message: string) => void;
  onChange: (value: string) => void;
}) {
  return <div className="linkedin-field">
    <label><strong>{label}</strong><textarea dir="auto" rows={rows} maxLength={8000} value={value} onChange={(event) => { onChange(event.currentTarget.value); onStatus(""); }} /></label>
    <button type="button" className="secondary" disabled={!value.trim()} aria-label={`نسخ ${label}`} onClick={async () => {
      try {
        await navigator.clipboard.writeText(value.trim());
        onStatus(`تم نسخ ${label}.`);
      } catch { onStatus("تعذّر النسخ التلقائي. حدّد النص وانسخه يدويًا."); }
    }}><Copy size={15} aria-hidden="true" /> نسخ</button>
    {initial && value !== initial && <button type="button" className="secondary" onClick={() => { onChange(initial); onStatus("استُعيد النص من المسودة."); }}>استعادة نص السيرة</button>}
  </div>;
}

export default function LinkedInKit({ resume, draftId }: { resume: Resume; draftId?: string }) {
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(() => location.hash === "#linkedin-kit");
  const [ready, setReady] = useState(!draftId);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [revision, setRevision] = useState(0);
  const [edited, setEdited] = useState<Record<string, string[]> | null>(null);
  useEffect(() => {
    if (!open || !draftId || ready) return;
    let active = true;
    api.linkedInProfile(draftId).then((existing) => {
      if (!active) return;
      if (existing) {
        setEdited(existing.sections);
        setRevision(existing.revision);
      }
      setReady(true);
    }).catch(() => { if (active) { setLoadError(true); setReady(true); } });
    return () => { active = false; };
  }, [open, draftId, ready]);
  useEffect(() => {
    if (open && ready && location.hash === "#linkedin-kit")
      document.getElementById("linkedin-kit")?.scrollIntoView({ block: "start" });
  }, [open, ready]);
  const sections = [
    { id: "headline", label: "العنوان المهني", name: "Headline", items: [resume.headline], rows: 2 },
    { id: "about", label: "النبذة", name: "About", items: [resume.summary], rows: 4 },
    { id: "experience", label: "الخبرات", name: "Experience", items: resume.experience.map(entryText), rows: 5 },
    { id: "education", label: "التعليم", name: "Education", items: resume.education.map(entryText), rows: 3 },
    { id: "projects", label: "المشاريع", name: "Projects", items: resume.projects.map(entryText), rows: 4 },
    { id: "certifications", label: "التراخيص والشهادات", name: "Licenses & certifications", items: resume.certifications, rows: 2 },
    { id: "skills", label: "المهارات", name: "Skills", items: [[...new Set(resume.skills.map((skill) => skill.trim()).filter(Boolean))].join("\n")], rows: 4 },
  ];
  const original = Object.fromEntries(sections.map(({ id, items }) => [id, items.map((item) => item?.trim() ?? "").filter(Boolean)]));

  return <details id="linkedin-kit" className="linkedin-kit" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>جهّز ملفك على LinkedIn</summary>
    <p>عدّل النصوص هنا ثم انسخها إلى القسم المناسب في LinkedIn. تبقى تعديلات LinkedIn منفصلة عن نص السيرة.</p>
    {!ready && <p role="status">جارٍ تحميل ملف LinkedIn…</p>}
    {loadError && <p role="status">تعذّر تحميل النص المحفوظ. أعد فتح المسودة قبل الحفظ.</p>}
    {ready && sections.map(({ id, label, name, rows }) => {
      const entries = edited?.[id]?.length ? edited[id] : original[id];
      return <fieldset className="linkedin-section" key={id} disabled={saving}>
        <legend>{label} · <bdi>{name}</bdi></legend>
        {entries.length ? entries.map((value, index) => <ProfileText
          key={index}
          label={entries.length === 1 ? label : `${label}، العنصر ${index + 1}`}
          initial={original[id][index] ?? ""}
          value={value}
          rows={rows}
          onChange={(text) => {
            setEdited((previous) => ({ ...previous, [id]: entries.map((item, i) => i === index ? text : item) }));
            setDirty(true);
          }}
          onStatus={setStatus}
        />) : <p>أكمل هذا القسم في سيرتك ليظهر هنا.</p>}
      </fieldset>;
    })}
    {draftId && ready && !loadError && <button type="button" className="primary" disabled={saving || !dirty} onClick={async () => {
      if (!edited) return;
      setSaving(true);
      try {
        const saved = await api.saveLinkedInProfile(draftId, edited, revision);
        setRevision(saved.revision);
        setDirty(false);
        setStatus("حُفظت تعديلات LinkedIn مع هذه المسودة.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "تعذّر حفظ ملف LinkedIn.");
      } finally { setSaving(false); }
    }}>احفظ تعديلات LinkedIn</button>}
    <p role="status">{status}</p>
  </details>;
}
