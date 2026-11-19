import { useRef, useState } from "react";
import { api, waitJob } from "./api";
import type { Draft } from "./types";

export function InterviewFeedback({ drafts, question, role, answer }: {
  drafts: Draft[]; question: string; role: string; answer: string;
}) {
  const [selected, select] = useState("");
  const draft = drafts.find(item => item.id === selected) ?? drafts[0];
  const [response, setResponse] = useState({ context: "", text: "" });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const context = JSON.stringify([question, role, answer, draft?.id, draft?.revision]);
  if (!draft) return null;

  async function review() {
    if (pending.current || !draft || !answer.trim()) return;
    pending.current = true;
    setBusy(true);
    try {
      const history = [{ role: "user", text: answer }];
      const result = await waitJob(await api.startJob("chat", draft, {
        consent: true, history,
        message: `راجع إجابة المقابلة الواردة في الرسائل السابقة بالترتيب. الوظيفة: ${role.slice(0, 200)}. السؤال: ${question}. استشهد بجملة من الإجابة وحدد نقطة قوة وتحسينًا عمليًا وسؤال متابعة. اعتمد فقط على ما ورد في الإجابة والسيرة، ولا تخترع نتائج.`,
      }));
      if (result.state !== "completed" || !result.result?.message) throw Error(result.error || "تعذّر تقييم الإجابة.");
      setResponse({ context, text: result.result.message });
    } catch (error) {
      setResponse({ context, text: error instanceof Error ? error.message : "تعذّر تقييم الإجابة." });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return <section aria-label="تقييم إجابة المقابلة">
    {drafts.length > 1 && <label>السيرة المستخدمة في التقييم <select value={draft.id} onChange={e => select(e.target.value)}>
      {drafts.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
    </select></label>}
    <button className="secondary" type="button" disabled={busy || !answer.trim()} onClick={() => void review()}>
      {busy ? "جارٍ تقييم الإجابة…" : "قيّم إجابتي المكتوبة · عملية ذكاء واحدة"}
    </button>
    {response.context === context && <p aria-live="polite" style={{ whiteSpace: "pre-line" }}>{response.text}</p>}
  </section>;
}
