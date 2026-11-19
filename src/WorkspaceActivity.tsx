import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, MessageCircle } from "lucide-react";
import { api } from "./api";
import type { InterviewSession } from "./InterviewPractice";
import type { TrackedApplication } from "./types";

export default function WorkspaceActivity() {
  const [jobs, setJobs] = useState<TrackedApplication[]>();
  const [latestInterview, setLatestInterview] = useState<InterviewSession | null>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void api.applications().then((items) => {
      if (active) setJobs(items.filter(({ stage }) => stage === "saved").slice(0, 2));
    }).catch(() => { if (active) setFailed(true); });
    void api.interviews().then((items) => {
      if (active) setLatestInterview(items.reduce<InterviewSession | null>((latest, item) =>
        !latest || item.updated > latest.updated ? item : latest, null));
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <section className="workspace-activity" aria-label="استئناف التقديم والمقابلات">
    <article>
      <h2><Bookmark size={19} aria-hidden="true" /> الفرص المحفوظة</h2>
      {jobs?.length ? <ul>{jobs.map((item) => <li key={item.id}><a href={`/for-job/${item.id}`}>{item.title}</a></li>)}</ul>
        : <p>{jobs ? "احفظ فرصة من صفحة الوظيفة لتظهر هنا." : failed ? "افتح سجل التقديم لعرض فرصك." : "جارٍ تحميل الفرص…"}</p>}
      <a className="text-btn" href="/tools/applications">افتح سجل التقديم <ArrowLeft size={16} aria-hidden="true" /></a>
    </article>
    <article>
      <h2><MessageCircle size={19} aria-hidden="true" /> آخر جلسة مقابلة</h2>
      {latestInterview ? <p><strong>{latestInterview.vacancy.title}</strong></p>
        : <p>{latestInterview === null ? "ابدأ جلسة تدريب لتكملها لاحقًا." : failed ? "افتح التدريب لعرض جلساتك." : "جارٍ تحميل الجلسات…"}</p>}
      <a className="text-btn" href={latestInterview ? `/tools/interviews#interview-session-${latestInterview.vacancy.id}` : "/tools/interviews"}>
        {latestInterview ? "تابع الجلسة" : "افتح تدريب المقابلات"} <ArrowLeft size={16} aria-hidden="true" />
      </a>
    </article>
  </section>;
}

