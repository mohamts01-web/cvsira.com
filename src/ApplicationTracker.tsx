import ToolGuide from "./design-system/ToolGuide";
import { Bookmark, Send, MessagesSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "./api";
import type { Vacancy } from "./JobTarget";
import type {
  ApplicationStage as Stage,
  TrackedApplication as TrackedJob,
} from "./types";

const stages = {
  saved: "أرغب في التقديم",
  applied: "قدّمت",
  interview: "موعد مقابلة",
  closed: "انتهت المتابعة",
};
const filters = [
  {
    id: "all",
    label: "الكل",
    empty: "يمكنك إضافة إعلان إلى المتابعة من صفحة السيرة الخاصة به.",
  },
  {
    id: "saved",
    label: "الفرص المحفوظة",
    empty: "لا توجد فرص محفوظة للتقديم لاحقًا.",
  },
  { id: "applied", label: "التقديمات", empty: "لا توجد تقديمات مسجلة." },
] as const;
const keyFor = (owner: string) => `elmam.cv.applications.${owner}`;

function readTracker(owner: string): TrackedJob[] {
  try {
    const data = JSON.parse(localStorage.getItem(keyFor(owner)) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row) =>
        row &&
        Number.isSafeInteger(row.id) &&
        row.id > 0 &&
        typeof row.title === "string" &&
        (row.company === null || typeof row.company === "string") &&
        Object.hasOwn(stages, row.stage),
    );
  } catch {
    return [];
  }
}

function TrackerForm({
  job,
  initialStage,
  onSave,
}: {
  job: Pick<Vacancy, "id" | "title" | "company">;
  initialStage: Stage | "";
  onSave: (
    entry: Omit<TrackedJob, "stage"> & { stage: Stage | "" },
  ) => Promise<void>;
}) {
  const [stage, setStage] = useState<Stage | "">(initialStage);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <form
      className="tracker-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
          await onSave({
            id: job.id,
            title: job.title,
            company: job.company,
            stage,
          });
          setStatus(
            stage ? "حُفظت حالة التقديم." : "أُزيل الإعلان من المتابعة.",
          );
        } catch {
          setStatus("تعذّر حفظ حالة التقديم. حاول مجددًا.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <label className="field">
        <span>حالة التقديم</span>
        <select
          disabled={saving}
          value={stage}
          onChange={(event) => {
            setStage(event.currentTarget.value as Stage | "");
            setStatus("");
          }}
        >
          <option value="">بدون متابعة</option>
          {Object.entries(stages).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button className="secondary" type="submit" disabled={saving}>
        حفظ حالة التقديم
      </button>
      <p role="status">{status}</p>
    </form>
  );
}

export default function ApplicationTracker({
  owner,
  job,
}: {
  owner: string;
  job?: Vacancy;
}) {
  const [query, setQuery] = useState("");
  const signedIn = owner !== "guest";
  const [entries, setEntries] = useState(() => readTracker(owner));
  const [ready, setReady] = useState(!signedIn);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [localEntries, setLocalEntries] = useState(() =>
    signedIn ? readTracker(owner) : [],
  );
  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    api
      .applications()
      .then((items) => {
        if (!active) return;
        setEntries(items);
        setReady(true);
      })
      .catch(() => {
        if (active) setError("تعذّر تحميل متابعة التقديم من حسابك.");
      });
    return () => {
      active = false;
    };
  }, [signedIn, attempt]);
  useEffect(() => {
    const refresh = () => setAttempt((value) => value + 1);
    window.addEventListener("elmam-application-updated", refresh);
    return () =>
      window.removeEventListener("elmam-application-updated", refresh);
  }, []);
  async function save(
    entry: Omit<TrackedJob, "stage"> & { stage: Stage | "" },
  ) {
    if (signedIn) {
      const updated = (await api.saveApplication(entry)).find(
        ({ id }) => id === entry.id,
      );
      setEntries((items) => {
        const remaining = items.filter(({ id }) => id !== entry.id);
        return updated ? [updated, ...remaining] : remaining;
      });
      setLocalEntries((items) => items.filter(({ id }) => id !== entry.id));
      try {
        localStorage.setItem(
          keyFor(owner),
          JSON.stringify(
            readTracker(owner).filter(({ id }) => id !== entry.id),
          ),
        );
      } catch {
        /* Already saved to the account. */
      }
      return;
    }
    const remaining = readTracker(owner).filter(({ id }) => id !== entry.id);
    const next = entry.stage
      ? [{ ...entry, stage: entry.stage }, ...remaining]
      : remaining;
    localStorage.setItem(keyFor(owner), JSON.stringify(next));
    setEntries(next);
  }
  const loading = !ready && (
    <p role="status">
      {error || "جارٍ تحميل متابعة التقديم…"}{" "}
      {error && (
        <button
          type="button"
          className="text-btn"
          onClick={() => {
            setError("");
            setAttempt(attempt + 1);
          }}
        >
          أعد المحاولة
        </button>
      )}
    </p>
  );
  if (job)
    return (
      <details className="interview-practice">
        <summary>تابع تقديمك لهذه الوظيفة</summary>
        <p>
          {signedIn
            ? "تُحفظ الحالة في حسابك وتظهر على أجهزتك."
            : "تُحفظ الحالة في هذا المتصفح."}
        </p>
        {loading || (
          <TrackerForm
            key={
              job.id + ":" + entries.find((item) => item.id === job.id)?.stage
            }
            job={job}
            initialStage={
              entries.find(({ id }) => id === job.id)?.stage ??
              localEntries.find(({ id }) => id === job.id)?.stage ??
              ""
            }
            onSave={save}
          />
        )}
      </details>
    );
  const accountIds = new Set(entries.map(({ id }) => id));
  const allEntries = [
    ...entries,
    ...localEntries.filter(({ id }) => !accountIds.has(id)),
  ];
  const savedCount = allEntries.filter(({ stage }) => stage === "saved").length;
  const counts = {
    all: allEntries.length,
    saved: savedCount,
    applied: allEntries.length - savedCount,
  };
  const visible = allEntries.filter(
    ({ stage, title, company }) =>
      (filter === "all" ||
        (filter === "saved" ? stage === "saved" : stage !== "saved")) &&
      [title, company]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <section className="interview-library" aria-label="متابعة التقديم">
      <ToolGuide
        steps={[
          "احفظ الفرصة من صفحة الوظيفة",
          "حدّث حالتها بعد التقديم",
          "ارجع لتفاصيلها قبل المقابلة",
        ]}
        action={{ href: "/tools/jobs", label: "ابحث عن فرصة" }}
      />
      <div className="tool-metrics">
        {[
          { label: "فرص محفوظة", value: savedCount, icon: Bookmark },
          {
            label: "قدّمت عليها",
            value: allEntries.filter((x) => x.stage === "applied").length,
            icon: Send,
          },
          {
            label: "مقابلات قادمة",
            value: allEntries.filter((x) => x.stage === "interview").length,
            icon: MessagesSquare,
          },
        ].map((m) => (
          <article key={m.label}>
            <m.icon size={21} />
            <strong>{m.value.toLocaleString("ar-SA")}</strong>
            <span>{m.label}</span>
          </article>
        ))}
      </div>
      <div className="tool-list-heading">
        <h2>سجل فرصك</h2>
        <label className="tool-search">
          <Search size={17} />
          <input
            aria-label="ابحث في التقديمات"
            placeholder="المسمى أو الجهة"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {loading || (
        <>
          <div
            className="draft-library-filter"
            role="group"
            aria-label="تصفية متابعة التقديم"
          >
            {filters.map(({ id, label }) => (
              <button
                type="button"
                key={id}
                className="secondary"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label} <span>{counts[id].toLocaleString("ar-SA")}</span>
              </button>
            ))}
          </div>
          {!visible.length && (
            <p className="tool-empty" role="status">
              {filters.find(({ id }) => id === filter)?.empty}
            </p>
          )}
          {visible.map((entry) => (
            <details className="interview-practice" key={entry.id}>
              <summary>
                <span className="record-title">{entry.title}</span>
                <span className={"record-status stage-" + entry.stage}>
                  {stages[entry.stage]}
                </span>
                <span className="record-toggle" aria-hidden="true">
                  ⌄
                </span>
              </summary>
              {entry.company && <p>{entry.company}</p>}
              <a href={`/for-job/${entry.id}`}>
                صفحة تجهيز السيرة لهذه الوظيفة
              </a>
              {signedIn && !accountIds.has(entry.id) && (
                <p>
                  هذه الحالة محفوظة في هذا المتصفح. احفظها هنا لإضافتها إلى
                  حسابك.
                </p>
              )}
              <TrackerForm
                job={entry}
                initialStage={entry.stage}
                onSave={save}
              />
            </details>
          ))}
        </>
      )}
    </section>
  );
}
