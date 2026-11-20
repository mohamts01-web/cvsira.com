import { useEffect, useRef, useState } from "react";
import ToolGuide from "./design-system/ToolGuide";
import { Search, BriefcaseBusiness, MapPin, ArrowLeft } from "lucide-react";
import type { Draft } from "./types";
import { fetchVacancy, type Vacancy } from "./JobTarget";
import { vacancyEvidence } from "../shared/vacancy-evidence.mjs";

type JobResult = {
  id: number;
  title: string;
  company?: string;
  location?: string;
};
const matchFields = [
  ["title", "المسمّى الوظيفي"],
  ["company", "اسم الجهة"],
  ["location", "الموقع"],
] as const;

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DiscoverJobs({ drafts }: { drafts: Draft[] }) {
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState<string[]>([]);
  const [partial, setPartial] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [details, setDetails] = useState<Map<number, Vacancy>>(() => new Map());
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">(
    "idle",
  );
  const request = useRef<AbortController | null>(null);
  const source = drafts.find((draft) => draft.id === selectedId) ?? drafts[0];
  const suggestions = [
    ...new Map(
      [source?.content.headline, ...(source?.content.skills ?? [])]
        .map((value) => value?.trim() ?? "")
        .filter(
          (value) =>
            value.length > 0 && value.length <= 100 && normalize(value),
        )
        .map((value) => [normalize(value), value] as const),
    ).values(),
  ].slice(0, 6);
  const suggestedTerms = suggestions.slice(0, 3);
  const visibleJobs = jobs
    .map((job) => {
      const matches = searched.flatMap((term) => {
        const phrase = normalize(term);
        const match = matchFields.findIndex(([field]) => {
          const value = job[field];
          return typeof value === "string" && normalize(value).includes(phrase);
        });
        return match < 0 ? [] : [{ term, match }];
      });
      const relevance = matches.reduce(
        (total, { match }) => total + [4, 2, 1][match],
        0,
      );
      return { job, matches, relevance };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 8);
  const rankedJobs = visibleJobs
    .map((candidate) => {
      const vacancy = details.get(candidate.job.id);
      const evidence =
        source && vacancy ? vacancyEvidence(source.content, vacancy) : [];
      const score = evidence.reduce((total, item) => total + item.weight, 0);
      return { ...candidate, evidence, score };
    })
    .sort((a, b) => b.score - a.score || b.relevance - a.relevance);
  const candidateIds = visibleJobs.map(({ job }) => job.id).join(",");
  const hasDraft = Boolean(source);
  useEffect(() => {
    setDetails(new Map());
    if (!candidateIds || !hasDraft) return;
    const controller = new AbortController();
    async function loadDetails() {
      const ids = candidateIds.split(",").map(Number);
      const found = new Map<number, Vacancy>();
      for (
        let offset = 0;
        offset < ids.length && !controller.signal.aborted;
        offset += 4
      ) {
        const batch = await Promise.allSettled(
          ids
            .slice(offset, offset + 4)
            .map((id) => fetchVacancy(id, controller.signal)),
        );
        for (const result of batch)
          if (result.status === "fulfilled")
            found.set(result.value.id, result.value);
      }
      if (!controller.signal.aborted) setDetails(found);
    }
    void loadDetails();
    return () => controller.abort();
  }, [candidateIds, hasDraft]);
  useEffect(() => {
    if (location.hash === "#discover-jobs")
      document.getElementById("discover-jobs")?.scrollIntoView();
    return () => request.current?.abort();
  }, []);

  async function search(terms: string[]) {
    const keywords = terms
      .map((term) => term.trim())
      .filter((term) => normalize(term))
      .slice(0, 3);
    if (!keywords.length) return;
    request.current?.abort();
    const next = new AbortController();
    request.current = next;
    setStatus("loading");
    setSearched(keywords);
    setPartial(false);
    setJobs([]);
    const lookups = await Promise.allSettled(
      keywords.map(async (keyword) => {
        const response = await fetch(
          "/api/discover-jobs?" + new URLSearchParams({ q: keyword }),
          {
            signal: next.signal,
            credentials: "omit",
          },
        );
        if (!response.ok) throw new Error("job_search_unavailable");
        const data = await response.json();
        if (!Array.isArray(data.jobs)) throw new Error("invalid_job_results");
        return data.jobs.filter(
          (job: JobResult) =>
            job &&
            Number.isSafeInteger(job.id) &&
            job.id > 0 &&
            typeof job.title === "string",
        ) as JobResult[];
      }),
    );
    if (next.signal.aborted) return;
    const result = lookups.flatMap((lookup) =>
      lookup.status === "fulfilled" ? [lookup.value] : [],
    );
    if (!result.length) {
      setStatus("error");
      return;
    }
    setJobs([...new Map(result.flat().map((job) => [job.id, job])).values()]);
    setPartial(result.length < keywords.length);
    setStatus("loaded");
  }

  return (
    <section
      className="discover-jobs"
      id="discover-jobs"
      aria-labelledby="discover-jobs-title"
    >
      <div className="tool-span">
        <ToolGuide
          steps={[
            "اختر سيرة لاقتراح كلمات البحث",
            "استعرض متطلبات الفرصة",
            "جهّز نسخة تناسب الوظيفة",
          ]}
        />
      </div>
      <h2 id="discover-jobs-title">اكتشف فرصًا لتخصيص سيرتك</h2>
      <p>ابحث بمسمّى أو مهارة في إعلانات إلمام وظائف النشطة.</p>
      {source && (
        <div className="discover-suggestions">
          {drafts.length > 1 && (
            <label>
              اقتراحات البحث من مسودة
              <select
                value={source.id}
                onChange={(event) => setSelectedId(event.currentTarget.value)}
              >
                {drafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    {draft.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {suggestions.length > 0 && (
            <div role="group" aria-label="عبارات بحث من السيرة">
              {suggestions.map((term) => (
                <button
                  type="button"
                  key={term}
                  className="secondary"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
          {suggestedTerms.length > 1 && (
            <div>
              <p>
                عبارات الاقتراح من المسودة:{" "}
                <bdi>{suggestedTerms.join("، ")}</bdi>
              </p>
              <button
                type="button"
                className="primary"
                disabled={status === "loading"}
                onClick={() => void search(suggestedTerms)}
              >
                اقترح فرصًا بهذه العبارات
              </button>
            </div>
          )}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void search([query]);
        }}
      >
        <label htmlFor="discover-query">المسمّى أو المهارة</label>
        <div className="discover-actions">
          <input
            id="discover-query"
            dir="auto"
            value={query}
            maxLength={100}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="مثل: مشرف بيع"
            required
          />
          <button
            type="submit"
            className="primary"
            disabled={status === "loading" || !normalize(query)}
          >
            <Search size={16} aria-hidden="true" /> ابحث
          </button>
        </div>
      </form>
      <p role="status">
        {status === "loading" && "جارٍ البحث عن الفرص…"}
        {status === "error" && "تعذّر جلب الإعلانات. حاول مرة أخرى."}
        {status === "loaded" &&
          (jobs.length
            ? `نتائج البحث عن «${searched.join("، ")}»`
            : "لم نجد فرصًا بالعبارات التي اكتمل البحث عنها. جرّب مسمّى أقصر أو مهارة واحدة.")}
        {partial && " تعذّر البحث ببعض العبارات. عُرضت النتائج المتاحة."}
      </p>
      {visibleJobs.length > 0 && (
        <div className="tool-results-heading">
          <h3>الفرص المتاحة</h3>
          <span>{visibleJobs.length.toLocaleString("ar-SA")} نتيجة</span>
        </div>
      )}
      {visibleJobs.length > 0 && (
        <ul>
          {rankedJobs.map(({ job, matches, evidence }) => (
            <li key={job.id}>
              <span className="job-result-icon" aria-hidden="true">
                <BriefcaseBusiness size={25} />
              </span>
              <div className="job-result-content">
                <span className="ds-eyebrow">فرصة #{job.id}</span>
                <h3>{job.title}</h3>
                <p className="job-result-location">
                  <MapPin size={14} aria-hidden="true" />
                  {[job.company, job.location].filter(Boolean).join(" · ")}
                </p>
                {searched.length === 1 && matches.length > 0 && (
                  <small>
                    ظهرت عبارة البحث في {matchFields[matches[0].match][1]}.
                  </small>
                )}
                {searched.length > 1 &&
                  matches.map(({ term, match }) => (
                    <p key={term}>
                      <small>
                        <bdi>{term}</bdi> في {matchFields[match][1]}
                      </small>
                    </p>
                  ))}
                {evidence.map(({ kind, label, value }) => (
                  <p key={kind}>
                    <small>
                      {label} · <bdi>{value}</bdi>
                    </small>
                  </p>
                ))}
              </div>
              <a className="secondary" href={`/for-job/${job.id}`}>
                خصّص سيرتك
                <ArrowLeft size={16} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
