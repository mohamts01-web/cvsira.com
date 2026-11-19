import { ApplicationDelivery } from "./ApplicationDelivery";
import { useEffect, useRef, useState } from "react";
import type { Draft } from "./types";
import type { Vacancy } from "./JobTarget";

export default function ApplicationLetter({ vacancy, owner, drafts }: { vacancy: Vacancy; owner?: string; drafts: Draft[] }) {
  const details = useRef<HTMLDetailsElement>(null);
  const letterField = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (location.hash !== "#application-letter" || !details.current) return;
    details.current.open = true;
    details.current.scrollIntoView({ block: "start" });
  }, []);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [role, setRole] = useState(vacancy.aggregate ? "" : vacancy.title);
  const [name, setName] = useState("");
  const [evidence, setEvidence] = useState("");
  const [letter, setLetter] = useState("");
  const [status, setStatus] = useState("");

  return <details className="interview-practice" id="application-letter" ref={details}>
    <summary>جهّز رسالة التقديم</summary>
    <p>اكتب مثالًا حقيقيًا يوضح صلتك بالوظيفة، مثل مهمة نفذتها أو مشروع أنجزته.</p>
    <form className="tracker-form application-letter-form" onSubmit={(event) => {
      event.preventDefault();
      const jobTitle = role.trim();
      const signature = name.trim();
      const example = evidence.trim();
      if (!jobTitle || !signature || !example) {
        setStatus("أكمل المسمّى والاسم والمثال قبل تجهيز الرسالة.");
        return;
      }
      const text = language === "ar"
        ? `الموضوع: التقديم على وظيفة ${jobTitle}\n\nالسلام عليكم،\n\nأرغب في التقديم على وظيفة ${jobTitle}${vacancy.company ? ` لدى ${vacancy.company}` : ""}.\n\n${example}\n\nأرفق سيرتي الذاتية للاطلاع، وشكرًا لوقتكم.\n\n${signature}`
        : `Subject: Application for ${jobTitle}\n\nDear Hiring Team,\n\nI am applying for the ${jobTitle} position${vacancy.company ? ` at ${vacancy.company}` : ""}.\n\n${example}\n\nPlease find my CV attached. Thank you for your consideration.\n\nBest regards,\n${signature}`;
      setLetter(text);
      requestAnimationFrame(() => letterField.current?.focus());
      setStatus("الرسالة جاهزة للمراجعة والتعديل.");
    }}>
      <label className="field"><span>لغة الرسالة</span>
        <select value={language} onChange={(event) => setLanguage(event.currentTarget.value === "en" ? "en" : "ar")}>
          <option value="ar">العربية</option><option value="en">English</option>
        </select>
      </label>
      <label className="field"><span>المسمّى الوظيفي</span>
        <input dir="auto" required maxLength={240} value={role} onChange={(event) => setRole(event.currentTarget.value)} />
      </label>
      <label className="field"><span>اسمك بلغة الرسالة</span>
        <input dir="auto" required maxLength={120} value={name} onChange={(event) => setName(event.currentTarget.value)} />
      </label>
      <label className="field"><span>مثال من خبرتك بلغة الرسالة</span>
        <textarea dir="auto" required rows={3} maxLength={1500} value={evidence} onChange={(event) => setEvidence(event.currentTarget.value)} />
      </label>
      <button className="secondary" type="submit">{letter ? "إعادة تجهيز الرسالة" : "جهّز الرسالة"}</button>
    </form>
    {letter && <>
      <label className="field"><span>راجع نص الرسالة وعدّله</span>
        <textarea ref={letterField} dir="auto" rows={10} value={letter} onChange={(event) => { setLetter(event.currentTarget.value); setStatus(""); }} />
      </label>
      <button className="secondary" type="button" onClick={async () => {
        try {
          await navigator.clipboard.writeText(letter);
          setStatus("نُسخت رسالة التقديم.");
        } catch { setStatus("يمكنك تحديد نص الرسالة ونسخه يدويًا."); }
      }}>انسخ الرسالة</button>
      <ApplicationDelivery letter={letter} vacancy={vacancy} owner={owner} drafts={drafts} />
    </>}
    <p role="status">{status}</p>
  </details>;
}
