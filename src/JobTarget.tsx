import { useEffect, useState } from "react";
import { captureCvEvent, cvAnalyticsAllowed } from "./analytics";
import type { Resume } from "./types";
import { Building2, MapPin, GraduationCap, BriefcaseBusiness, ArrowUpLeft } from "lucide-react";
import { vacancyEvidence } from "../shared/vacancy-evidence.mjs";

const jobsOrigin = "https://jobs.cvsira.com";
const route = /^\/for-job\/(\d{1,12})\/?$/;
const storageKey = "elmam.cv.job";
function rememberedJob() {
  try { return sessionStorage.getItem(storageKey) ?? ""; }
  catch { return ""; }
}
export type Vacancy = {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  qualification: string | null;
  experience: string | null;
  description: string;
  aggregate: boolean;
  applicationMethod?: string;
  applicationEmail?: string;
  applicationEmailConfirmed?: boolean;
};

export async function fetchVacancy(id: number, signal: AbortSignal): Promise<Vacancy> {
  const endpoint = import.meta.env.VITE_LIVE_JOB_LIBRARY === "true" ? `/api/job-vacancy/${id}` : (import.meta.env.VITE_JOB_FIXTURES === "true" || ["127.0.0.1", "localhost"].includes(location.hostname) ? "/__jobs-preview" : jobsOrigin)+`/api/cv-job/${id}`;
  const response = await fetch(endpoint, { signal, credentials: "omit" });
  if (!response.ok) throw Error("job_unavailable");
  const result: Vacancy = await response.json();
  if (result.id !== id || typeof result.title !== "string" || !result.title.trim()) throw Error("invalid_job");
  return result;
}
export function useJobTarget(path: string, saved?: { id: number; title: string }, explicit = "") {
  const [id, setId] = useState(() => route.exec(path)?.[1] ?? (path === "/" ? "" : rememberedJob()));
  const [dismissed, setDismissed] = useState("");
  const explicitId = /^\d{1,12}$/.test(explicit) ? explicit : "";
  const savedKey = explicitId ? `${path}:${explicitId}` : saved ? `${path}:${saved.id}` : "";
  const isDismissed = Boolean(savedKey && dismissed === savedKey);
  const requested = route.exec(path)?.[1] ?? (isDismissed ? "" : explicitId || (saved ? String(saved.id) : id));
  const [job, setJob] = useState<Vacancy | null>(null);
  const [unavailableId, setUnavailableId] = useState("");
  useEffect(() => {
    setDismissed("");
    const requested = route.exec(path)?.[1];
    if (requested) setId(requested);
    else if (path === "/") setId("");
  }, [path]);
  useEffect(() => {
    const valid = /^\d{1,12}$/.test(id);
    try {
      if (valid) sessionStorage.setItem(storageKey, id);
      else sessionStorage.removeItem(storageKey);
    } catch { /* Targeting continues in the current page. */ }
  }, [id]);
  useEffect(() => {
    setJob(null);
    setUnavailableId("");
    if (!/^\d{1,12}$/.test(requested)) return;
    const controller = new AbortController();
    fetchVacancy(Number(requested), controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setJob(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setUnavailableId(requested);
      });
    return () => controller.abort();
  }, [requested]);
  const current = job?.id === Number(requested) ? job : null;
  function recordStart() {
    if (!current || !cvAnalyticsAllowed()) return;
    const key = "elmam.cv.started." + current.id;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* A disabled storage policy must not prevent starting a CV. */ }
    captureCvEvent("cv started", current.id);
    void fetch(`${jobsOrigin}/api/cv-job/${current.id}/start`, {
      method: "POST", credentials: "omit", keepalive: true,
      headers: { "Content-Type": "application/json" }, body: "{}",
    }).then(response => {
      if (!response.ok) throw Error("metrics_unavailable");
    }).catch(() => {
      try { sessionStorage.removeItem(key); } catch { /* Storage unavailable. */ }
    });
  }
  return { job: current, loading: Boolean(requested && !current && requested !== unavailableId), saved: isDismissed || explicitId ? undefined : saved, clear: () => {
    if (savedKey) setDismissed(savedKey);
    else setId("");
  }, recordStart };
}

export function JobTargetCard({ target, compact = false, resume }: {
  target: ReturnType<typeof useJobTarget>;
  compact?: boolean;
  resume?: Resume;
}) {
  const { job, loading, saved } = target;
  const Heading = compact ? "h3" : "h1";
  if (!job && compact && saved) return <section className="job-target-card" aria-live="polite">
    <h3>الوظيفة المستهدفة — {saved.title}</h3>
    <p>{loading ? "جارٍ تحميل الإعلان…" : "تعذّر تحميل الإعلان حاليًا. يمكنك متابعة تحرير سيرتك."}</p>
    <button className="text-btn" onClick={target.clear}>إخفاء سياق الإعلان</button>
  </section>;
  if (!job) return compact ? null : (
    <section className="job-target-card" aria-live="polite">
      <Heading>{loading ? "جارٍ تحميل تفاصيل الوظيفة…" : "أنشئ سيرتك الذاتية"}</Heading>
      {!loading && <p>تعذّر تحميل الإعلان حاليًا. تقدر تبدأ بسيرة عامة.</p>}
    </section>
  );
  const evidence = resume ? vacancyEvidence(resume, job) : [];
  if(!compact)return <section className="job-target-card opportunity-details">
    <div className="opportunity-labels"><span className="eyebrow">إلمام وظائف · إعلان #{job.id}</span><span className="opportunity-status">متاح في مكتبة الوظائف</span></div>
    <div className="opportunity-title"><span className="opportunity-company-icon" aria-hidden="true"><Building2 size={29}/></span><div>{job.company&&<p dir="auto">{job.company}</p>}<h1 dir="auto">{job.title}</h1></div></div>
    <dl className="opportunity-facts">{[["الموقع",job.location,MapPin],["المؤهل",job.aggregate?null:job.qualification,GraduationCap],["الخبرة",job.aggregate?null:job.experience,BriefcaseBusiness]].map(([label,value,Icon])=>typeof value==="string"&&value.trim()&&value.length<200?<div key={String(label)}><dt>{typeof Icon!=="string"&&Icon&&<Icon size={17} aria-hidden="true"/>}{String(label)}</dt><dd dir="auto">{value}</dd></div>:null)}</dl>
    {job.aggregate&&<p className="opportunity-notice">إعلان يضم عدة مسميات؛ راجع متطلبات كل مسمّى قبل تخصيص سيرتك.</p>}
    {job.description&&<details className="opportunity-description" open><summary>عن الفرصة ومتطلباتها</summary><div dir="auto">{job.description}</div></details>}
    <a className="opportunity-source" href={`${jobsOrigin}/j/${job.id}`} target="_blank" rel="noreferrer">راجع الإعلان وطريقة التقديم<ArrowUpLeft size={17}/></a>
  </section>;
  return (
    <section className="job-target-card">
      <span className="eyebrow">إلمام وظائف · إعلان #{job.id}</span>
      <Heading>{compact ? "الوظيفة المستهدفة — " : "جهّز سيرتك لـ"}{job.title}</Heading>
      <p>{[job.company, job.location].filter(Boolean).join(" · ")}</p>
      {job.aggregate && <p>هذا إعلان مجمّع. تختلف المتطلبات حسب المسمى.</p>}
      {[job.qualification, job.experience].some(Boolean) && (
        <ul>{[job.qualification, job.experience].filter(Boolean).map((value, index) => <li key={index}>{value}</li>)}</ul>
      )}
      {job.description && <details><summary>متطلبات وتفاصيل الإعلان</summary><p className="job-target-description">{job.description}</p></details>}
      {evidence.length > 0 && <ul aria-label="مؤشرات المطابقة مع سيرتك">
        {evidence.map(({ kind, label, value }) => <li key={kind}>{label} · <bdi>{value}</bdi></li>)}
      </ul>}
      {resume && !job.aggregate && (job.qualification || job.experience) && (
        <details className="job-evidence">
          <summary>قارن المتطلبات بما يظهر في سيرتك</summary>
          <dl>
            {job.qualification && <>
              <dt>المؤهل في الإعلان</dt><dd dir="auto">{job.qualification}</dd>
              <dt>التعليم في سيرتك</dt><dd>{resume.education.map(({ title, major }) => [title, major].filter((value) => value?.trim()).join(" · ")).filter(Boolean).join("، ") || "لم تضف مؤهلاً إلى المسودة بعد."}</dd>
            </>}
            {job.experience && <>
              <dt>الخبرة في الإعلان</dt><dd dir="auto">{job.experience}</dd>
              <dt>الخبرات في سيرتك</dt><dd>{resume.experience.map(({ title, start, end }) => [title, [start, end].filter((value) => value?.trim()).join(" – ")].filter((value) => value?.trim()).join(" · ")).filter(Boolean).join("، ") || "لم تضف خبرة إلى المسودة بعد."}</dd>
            </>}
          </dl>
          <p>راجِع تخصص المؤهل ومدة الخبرة قبل اعتماد تعديلات السيرة.</p>
        </details>
      )}
      <a href={`${jobsOrigin}/j/${job.id}`} target="_blank" rel="noreferrer">عرض الإعلان الأصلي ↗</a>
      {compact && <a className="job-interview-link" href={`/for-job/${job.id}#interview-practice`} target="_blank" rel="noreferrer">افتح تدريب المقابلة ↗</a>}
      {compact && <button className="text-btn" onClick={target.clear}>{saved ? "إخفاء سياق الإعلان" : "إزالة الاستهداف"}</button>}
    </section>
  );
}
