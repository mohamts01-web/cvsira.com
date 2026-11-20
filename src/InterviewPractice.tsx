import ToolGuide from "./design-system/ToolGuide";
import InterviewDictation from "./InterviewDictation";
import { InterviewFeedback } from "./InterviewFeedback";
import type { Draft } from "./types";
import InterviewRecording from "./InterviewRecording";
import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Vacancy } from "./JobTarget";

const baseQuestions = [
  [
    "intro",
    "عرّفنا بنفسك. ما الذي يجعلك مهتمًا بهذه الوظيفة؟",
    "اربط خبرة أو مهارة لديك بمسؤولية من الإعلان، واذكر لماذا يهمك الدور.",
  ],
  [
    "example",
    "صف موقفًا استخدمت فيه مهارة تفيدك في هذه الوظيفة.",
    "يمكنك الاستعانة بموقف من العمل أو التدريب أو مشروع دراسي. اذكر ما فعلته أنت وكيف انتهى الموقف.",
  ],
  [
    "learn",
    "كيف ستتعامل مع مهمة جديدة عليك في هذا الدور؟",
    "اشرح كيف ستفهم المطلوب، ومتى ستطلب المساعدة، وكيف ستتحقق من جودة النتيجة.",
  ],
];

type Notes = Record<string, string>;
type PracticeState = { notes: Notes; topic: string; questionId: string };
export type InterviewSession = PracticeState & {
  vacancy: Vacancy;
  revision: number;
  updated: string;
};
export const generalPractice: Vacancy = {
  id: 0,
  title: "تدريب عام للمقابلات",
  company: null,
  location: null,
  qualification: null,
  experience: null,
  description: "",
  aggregate: false,
};
const interviewPrefix = (owner: string) => `elmam.cv.interview.${owner}.`;

export function InterviewLibrary({
  owner,
  drafts,
}: {
  owner: string;
  drafts: Draft[];
}) {
  useEffect(() => {
    if (location.hash === "#interview-library")
      document.getElementById("interview-library")?.scrollIntoView();
  }, []);
  const [entries] = useState(() => {
    const prefix = interviewPrefix(owner);
    const saved: { vacancy: Vacancy; updated: number }[] = [];
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (!key?.startsWith(prefix)) continue;
        const id = key.slice(prefix.length);
        if (!/^\d+$/.test(id)) continue;
        try {
          const entry = JSON.parse(localStorage.getItem(key) ?? "null");
          if (
            entry?.vacancy?.id === Number(id) &&
            typeof entry.vacancy.title === "string"
          )
            saved.push(entry);
          else if (
            Object.values(readPractice(key).notes).some((answer) =>
              answer.trim(),
            )
          ) {
            saved.push({
              updated: 0,
              vacancy: {
                id: Number(id),
                title: `إعلان #${id}`,
                company: null,
                location: null,
                qualification: null,
                experience: null,
                description: "",
                aggregate: false,
              },
            });
          }
        } catch {
          /* Other sessions remain available. */
        }
      }
    } catch {
      /* Storage can be disabled by the browser. */
    }
    return saved.sort((a, b) => b.updated - a.updated);
  });
  const [cloudEntries, setCloudEntries] = useState<InterviewSession[] | null>(
    owner === "guest" ? [] : null,
  );
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    if (owner === "guest") return;
    let active = true;
    api
      .interviews()
      .then((items) => {
        if (active) setCloudEntries(items);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [owner]);
  const cloudIds = new Set(cloudEntries?.map(({ vacancy }) => vacancy.id));
  const localEntries = entries.filter(
    ({ vacancy }) => !cloudIds.has(vacancy.id),
  );
  const hasGeneral =
    cloudIds.has(0) || localEntries.some(({ vacancy }) => vacancy.id === 0);

  return (
    <section
      className="interview-library"
      id="interview-library"
      aria-label="تحضير المقابلات المحفوظ"
    >
      <ToolGuide
        steps={[
          "اختر جلسة عامة أو مقابلة لوظيفة",
          "صغ إجابتك كتابةً أو صوتيًا",
          "راجع الإجابة واحفظ تقدمك",
        ]}
        action={{ href: "/tools/jobs", label: "تدرّب لوظيفة محددة" }}
      />
      <h2>جلساتك التدريبية</h2>
      <p>
        {owner === "guest"
          ? "تدرّب على الأسئلة الشائعة واحفظ إجاباتك في هذا المتصفح."
          : "ارجع إلى جلسات المقابلة المحفوظة في حسابك."}
      </p>
      {!cloudEntries && (
        <p role="status">
          {loadError
            ? "تعذّر تحميل الجلسات من حسابك. أعد تحميل الصفحة للمحاولة."
            : "جارٍ تحميل الجلسات…"}
        </p>
      )}
      {(cloudEntries || loadError) && (
        <>
          {!hasGeneral && (
            <InterviewPractice
              vacancy={generalPractice}
              owner={owner}
              drafts={drafts}
              library
            />
          )}
          {cloudEntries?.map((entry) => (
            <InterviewPractice
              key={entry.vacancy.id}
              vacancy={entry.vacancy}
              owner={owner}
              drafts={drafts}
              library
              initial={entry}
            />
          ))}
          {localEntries.map(({ vacancy }) => (
            <InterviewPractice
              key={vacancy.id}
              vacancy={vacancy}
              owner={owner}
              drafts={drafts}
              library
            />
          ))}
        </>
      )}
    </section>
  );
}

function readPractice(key: string): PracticeState {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      const notes = "notes" in stored ? stored.notes : stored;
      if (notes && typeof notes === "object" && !Array.isArray(notes)) {
        return {
          notes: Object.fromEntries(
            Object.entries(notes).filter(
              ([, value]) => typeof value === "string",
            ),
          ),
          topic:
            "topic" in stored && typeof stored.topic === "string"
              ? stored.topic
              : "",
          questionId:
            "questionId" in stored && typeof stored.questionId === "string"
              ? stored.questionId
              : "",
        };
      }
    }
  } catch {
    /* Practice still works without saved answers. */
  }
  return { notes: {}, topic: "", questionId: "" };
}

export default function InterviewPractice({
  vacancy,
  owner,
  drafts,
  library = false,
  initial,
}: {
  drafts: Draft[];
  vacancy: Vacancy;
  owner: string;
  library?: boolean;
  initial?: InterviewSession;
}) {
  const storageKey = interviewPrefix(owner) + vacancy.id;
  const questionHeading = useRef<HTMLLegendElement>(null);
  const practice = useRef<HTMLDetailsElement>(null);
  const libraryId = `interview-session-${vacancy.id}`;
  useEffect(() => {
    if (library && practice.current && location.hash === "#" + libraryId) {
      practice.current.open = true;
      practice.current.scrollIntoView({ block: "start" });
    }
  }, [library, libraryId]);
  const [saved] = useState(() => initial ?? readPractice(storageKey));
  const [notes, setNotes] = useState(saved.notes);
  const [topic, setTopic] = useState(saved.topic);
  const [questionId, setQuestionId] = useState(saved.questionId);
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(initial?.revision ?? 0);
  const [loading, setLoading] = useState(
    owner !== "guest" && !initial && !library,
  );
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    if (!loading) return;
    let active = true;
    api
      .interview(vacancy.id)
      .then((entry) => {
        if (!active || !entry) return;
        setNotes(entry.notes);
        setTopic(entry.topic);
        setQuestionId(entry.questionId);
        setRevision(entry.revision);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loading, vacancy.id]);
  const general = vacancy.id === generalPractice.id;
  const qualification = vacancy.aggregate ? "" : vacancy.qualification?.trim();
  const requiredExperience = vacancy.aggregate
    ? ""
    : vacancy.experience?.trim();
  const questions = [...baseQuestions];
  if (qualification)
    questions.push([
      "qualification",
      "كيف أعدّك مؤهلك أو تدريبك لتنفيذ مهام الوظيفة؟",
      "اذكر مادة أو مشروعًا أو تدريبًا ذا صلة ووضّح كيف استفدت منه.",
    ]);
  if (requiredExperience)
    questions.push([
      "required-experience",
      "ما أقرب خبرة لديك للخبرة المطلوبة في الإعلان؟",
      "اذكر دورك ونطاق عملك والنتيجة. إذا كانت خبرتك في مجال مختلف، وضّح المهارات التي تستطيع نقلها إلى هذا الدور.",
    ]);
  if (!general)
    questions.push([
      "job-task",
      "كيف ستنفّذ هذه المهمة لو طلبناها منك في أول أسبوع؟",
      "وضّح ما تحتاج لمعرفته أولًا، ثم رتّب خطوات التنفيذ واشرح كيف تتحقق من النتيجة.",
    ]);
  const index = Math.max(
    0,
    questions.findIndex(([id]) => id === questionId),
  );
  const [id, question, guidance] = questions[index];
  const answered = questions.filter(([key]) =>
    Boolean(notes[key]?.trim()),
  ).length;
  function moveQuestion(next: number) {
    setQuestionId(questions[next][0]);
    setStatus("");
    requestAnimationFrame(() => questionHeading.current?.focus());
  }
  const displayedQuestion = general
    ? [
        "عرّفنا بنفسك. ما المجال الذي ترغب في العمل فيه؟",
        "صف موقفًا استخدمت فيه مهارة تهمك في عملك القادم.",
        "كيف تتعامل مع مهمة جديدة عليك؟",
      ][index]
    : question;
  const displayedGuidance =
    general && index === 0
      ? "اذكر مجالك ومهارة أو تجربة توضح ما تستطيع تقديمه."
      : guidance;

  return (
    <details
      ref={practice}
      className="interview-practice"
      id={library ? libraryId : "interview-practice"}
      open={
        !library && location.hash === "#interview-practice" ? true : undefined
      }
    >
      <summary>
        <span className="record-symbol" aria-hidden="true">
          ◎
        </span>
        <span className="record-title">
          {library || general
            ? [vacancy.title, vacancy.company].filter(Boolean).join(" · ")
            : "تدرّب على مقابلة هذه الوظيفة"}
        </span>
        <span className="practice-completion">
          {answered} / {questions.length} إجابة
        </span>
        <span className="record-toggle" aria-hidden="true">
          ⌄
        </span>
      </summary>
      {!library && (
        <p>
          {vacancy.title}
          {vacancy.company && ` · ${vacancy.company}`}
        </p>
      )}
      {vacancy.aggregate && (
        <p>اختر مسمى واحدًا من الإعلان المجمّع وابنِ إجاباتك حوله.</p>
      )}
      {vacancy.description && (
        <details>
          <summary>ارجع إلى وصف الوظيفة أثناء التدريب</summary>
          <p className="job-target-description">{vacancy.description}</p>
        </details>
      )}
      {loading && <p role="status">جارٍ تحميل إجاباتك…</p>}
      {loadError && (
        <p role="status">
          تعذّر تحميل الجلسة من الحساب. أعد تحميل الصفحة قبل الحفظ.
        </p>
      )}
      <fieldset disabled={loading}>
        <legend ref={questionHeading} tabIndex={-1}>
          السؤال {index + 1} من {questions.length}
        </legend>
        <p className="interview-progress" aria-live="polite">
          أجبت عن {answered} من {questions.length}
        </p>
        <label htmlFor={`interview-answer-${vacancy.id}`}>
          {displayedQuestion}
        </label>
        {id === "qualification" && (
          <p className="interview-requirement">
            <strong>المؤهل المذكور في الإعلان</strong>
            <br />
            <bdi>{qualification}</bdi>
          </p>
        )}
        {id === "required-experience" && (
          <p className="interview-requirement">
            <strong>الخبرة المذكورة في الإعلان</strong>
            <br />
            <bdi>{requiredExperience}</bdi>
          </p>
        )}
        {id === "job-task" && (
          <label className="field">
            <span>اختر مهمة أو مهارة من وصف الوظيفة</span>
            <input
              dir="auto"
              value={topic}
              maxLength={240}
              onChange={(event) => {
                setTopic(event.currentTarget.value);
                setStatus("");
              }}
              placeholder="انسخ مهمة من الوصف أو اكتبها هنا"
            />
          </label>
        )}
        <p>{displayedGuidance}</p>
        <textarea
          id={`interview-answer-${vacancy.id}`}
          rows={5}
          maxLength={2500}
          value={notes[id] ?? ""}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setNotes((previous) => ({ ...previous, [id]: value }));
            setStatus("");
          }}
        />
      </fieldset>
      {!loading && (
        <InterviewDictation
          key={`dictation-${id}`}
          append={(words) => {
            setNotes((previous) => ({
              ...previous,
              [id]: [previous[id], words]
                .filter(Boolean)
                .join(" ")
                .slice(0, 2500),
            }));
            setStatus("");
          }}
        />
      )}
      {!loading && (
        <InterviewFeedback
          key={"feedback-" + id}
          drafts={drafts}
          question={displayedQuestion}
          role={vacancy.title}
          answer={notes[id] ?? ""}
        />
      )}
      {!loading && <InterviewRecording key={"recording-" + id} />}
      <details>
        <summary>راجع إجابتك</summary>
        <ul>
          <li>هل أجبت عن السؤال مباشرة؟</li>
          <li>هل ذكرت مثالًا محددًا ودورك فيه؟</li>
          <li>هل وضّحت النتيجة أو ما تعلمته وربطته بالوظيفة؟</li>
        </ul>
      </details>
      <div className="interview-actions">
        <button
          type="button"
          className="secondary"
          disabled={loading || index === 0}
          onClick={() => moveQuestion(index - 1)}
        >
          السابق
        </button>
        <button
          type="button"
          className="secondary"
          disabled={loading || index === questions.length - 1}
          onClick={() => moveQuestion(index + 1)}
        >
          السؤال التالي
        </button>
        <button
          type="button"
          className="primary"
          disabled={loading || saving || loadError}
          onClick={async () => {
            setSaving(true);
            try {
              const entry = { vacancy, notes, topic, questionId: id, revision };
              if (owner !== "guest") {
                const result = await api.saveInterview(entry);
                setRevision(result.revision);
                setStatus("حُفظت الإجابات في حسابك.");
              } else {
                localStorage.setItem(
                  storageKey,
                  JSON.stringify({ ...entry, updated: Date.now() }),
                );
                setStatus("حُفظت الإجابات في هذا المتصفح.");
              }
            } catch (error) {
              setStatus(
                error instanceof Error ? error.message : "تعذّر حفظ الإجابات.",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving
            ? "جارٍ حفظ الإجابات…"
            : owner === "guest"
              ? "حفظ على هذا الجهاز"
              : "احفظ الإجابات في حسابك"}
        </button>
      </div>
      <p role="status">{status}</p>
    </details>
  );
}
