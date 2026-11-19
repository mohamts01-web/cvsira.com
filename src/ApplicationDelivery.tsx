import { useEffect, useRef, useState } from "react";
import { applicationEmail, gmailRaw } from "../shared/application-email.mjs";
import { authorizeGmail, loadGoogleIdentity } from "./gmail";
import { api, waitJob } from "./api";
import { pdfFilename } from "../shared/presentation.mjs";
import type { Draft } from "./types";
import type { Vacancy } from "./JobTarget";

const gmailClient = import.meta.env.VITE_GMAIL_CLIENT_ID;
export function ApplicationDelivery({ letter, vacancy, owner, drafts }: { letter: string; vacancy: Vacancy; owner?: string; drafts: Draft[] }) {
  const [recipient, setRecipient] = useState("");
  const recipientReady = recipient.trim().length <= 254 && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(recipient.trim());
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<{ file: File; url: string }>();
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const [attachmentId, setAttachmentId] = useState("");
  const approved = drafts.filter(draft => draft.approved_revision !== null);
  const [status, setStatus] = useState("");
  const [providerReady, ready] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const key = "elmam.cv.mail." + owner + "." + vacancy.id;
  const [receipt, setReceipt] = useState(() => {
    try { return sessionStorage.getItem(key) ?? ""; } catch { return ""; }
  });
  function record(value: string) {
    if (value) sessionStorage.setItem(key, value); else sessionStorage.removeItem(key);
    setReceipt(value);
  }
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setStatus("");
    try { await action(); }
    catch (error) { setStatus(error instanceof Error ? error.message : "تعذّرت العملية."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function attachSaved() {
    const selection = approved.find(item => item.id === attachmentId);
    if (!selection) return;
    const latest = await api.getDraft(selection.id);
    if (latest.approved_revision !== selection.approved_revision || latest.approved_revision === null)
      throw Error("تغيّرت النسخة المعتمدة. حدّث الصفحة واختر السيرة من جديد.");
    const job = await waitJob(await api.startJob("export", latest));
    if (job.state !== "completed" || !job.result?.downloadUrl) throw Error(job.error || "تعذّر تجهيز السيرة.");
    const response = await fetch(job.result.downloadUrl);
    if (!response.ok) throw Error("تعذّر تحميل السيرة المعتمدة.");
    const pdf = await response.blob();
    if (pdf.size > 5 * 1024 * 1024 || await pdf.slice(0, 5).text() !== "%PDF-") throw Error("تعذّر إرفاق ملف PDF صالح بحجم لا يتجاوز 5 ميغابايت.");
    const afterExport = await api.getDraft(selection.id);
    if (afterExport.approved_revision !== latest.approved_revision)
      throw Error("تغيّرت النسخة المعتمدة أثناء تجهيز الملف. حدّث الصفحة واختر السيرة من جديد.");
    setFile(new File([pdf], pdfFilename(latest.title), { type: "application/pdf" }));
    setStatus("أُرفقت نسخة PDF المعتمدة.");
  }
  async function compose(draft: boolean) {
    if (!file || file.size > 5 * 1024 * 1024) throw Error("اختر ملف السيرة PDF بحجم أقصاه 5 ميغابايت.");
    const [heading, ...lines] = letter.trim().split(/\r?\n/);
    return applicationEmail({ recipient: recipient.trim(), subject: heading.replace(/^(?:الموضوع|Subject)\s*:\s*/i, ""),
      body: lines.join("\n").trim(), pdf: new Uint8Array(await file.arrayBuffer()), filename: file.name, draft });
  }
  async function track() {
    const existing = (await api.applications()).find(item => item.id === vacancy.id);
    if (!existing || existing.stage === "saved")
      await api.saveApplication({ id: vacancy.id, title: vacancy.title, company: vacancy.company, stage: "applied" });
    record("tracked");
    window.dispatchEvent(new Event("elmam-application-updated"));
    setStatus("أكّد Gmail الإرسال وحُفظ التقديم في حسابك.");
  }
  async function send() {
    if (receipt || sessionStorage.getItem(key)) return;
    const raw = gmailRaw(await compose(false));
    record("pending");
    let response: Response;
    try {
      response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
    } catch { throw Error("تعذّر تأكيد النتيجة. راجع البريد المرسل قبل أي محاولة أخرى."); }
    if (!response.ok) {
      if (response.status < 500) record("");
      if (response.status === 401) setToken("");
      throw Error(response.status === 401 ? "انتهى الاتصال. اربط Gmail مجددًا." : "تعذّر تأكيد الإرسال. راجع Gmail.");
    }
    const result = await response.json();
    if (!result.id) throw Error("راجع مجلد البريد المرسل للتحقق من النتيجة.");
    record("sent");
    setToken("");
    await track();
  }
  const readyToDeliver = Boolean(file && recipientReady && letter.trim());
  return <section className="application-delivery" aria-label="التقديم بالبريد">
    <div className="application-delivery-fields">
    <h3>المستلم والمرفق</h3>
    <label className="field"><span>بريد جهة التوظيف كما ورد في الإعلان</span>
      <input type="email" dir="ltr" maxLength={254} value={recipient} disabled={busy} onChange={e => setRecipient(e.target.value)} /></label>
    {approved.length > 0 && <>
      <label className="field"><span>اختر سيرة معتمدة من حسابك</span>
        <select value={attachmentId} disabled={busy} onChange={e => setAttachmentId(e.target.value)}>
          <option value="">اختر سيرة</option>
          {approved.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <button className="secondary" type="button" disabled={busy || !attachmentId} onClick={() => void run(attachSaved)}>أرفق النسخة المعتمدة</button>
    </>}
    {file && <div className="application-file">
      <p>المرفق الحالي <bdi>{file.name}</bdi></p>
      <div className="interview-actions">
        {preview?.file === file && <a className="secondary" href={preview.url} target="_blank" rel="noopener noreferrer">معاينة المرفق</a>}
        <button className="text-btn" type="button" disabled={busy} onClick={() => setFile(undefined)}>أزل المرفق</button>
      </div>
    </div>}
    <label className="field"><span>أو اختر ملف PDF من جهازك</span>
      <input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e => {
        const chosen = e.currentTarget.files?.[0];
        e.currentTarget.value = "";
        if (!chosen) return;
        void run(async () => {
          if (chosen.size > 5 * 1024 * 1024 || await chosen.slice(0, 5).text() !== "%PDF-")
            throw Error("اختر ملف PDF صالحًا بحجم أقصاه 5 ميغابايت.");
          setFile(new File([chosen], chosen.name, { type: "application/pdf" }));
        });
      }} /></label>
    </div>
    <div className="application-delivery-actions">
    <h3>طريقة الإرسال</h3>
    {!readyToDeliver && <p>أدخل بريد جهة التوظيف واختر ملف السيرة لتفعيل الخيارات.</p>}
    <button className="secondary" type="button" disabled={busy || !readyToDeliver} onClick={() => void run(async () => {
      const message = await compose(true);
      const url = URL.createObjectURL(new Blob([message], {type:"message/rfc822"}));
      const link = document.createElement("a"); link.href = url; link.download = "طلب تقديم.eml"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setStatus("نزّلت مسودة البريد مع السيرة. افتحها في تطبيق بريد يدعم EML وراجعها ثم أرسلها.");
    })}>نزّل مسودة البريد والمرفق</button>
    {gmailClient && owner && !receipt && <p>عند اختيار Gmail، نطلب إذن إرسال البريد. بعد تأكيد الإرسال يتلقى Google عنوان المستلم والرسالة ومرفق السيرة. <a href="/privacy#gmail-data" target="_blank" rel="noopener noreferrer">خصوصية ربط Gmail</a></p>}
    {gmailClient && owner && !receipt && <button className="primary" type="button" disabled={busy || !readyToDeliver} onClick={() => void run(async () => {
      if (!providerReady) { await loadGoogleIdentity(); ready(true); }
      else if (!token) setToken(await authorizeGmail(gmailClient));
      else await send();
    })}>{!providerReady ? "استخدم Gmail" : !token ? "اختر حساب Gmail" : "أرسل الرسالة والمرفق إلى " + recipient}</button>}
    {receipt === "pending" && <p>تحقّق من مجلد البريد المرسل. <button type="button" disabled={busy} onClick={() => record("")}>تحققت ولم تُرسل الرسالة</button></p>}
    {receipt === "sent" && <p>أكّد Gmail الإرسال. <button type="button" disabled={busy} onClick={() => void run(track)}>حدّث سجل التقديم</button></p>}
    {receipt === "tracked" && <p>أُرسلت الرسالة وسُجّل التقديم.</p>}
    <p role="status">{status}</p>
    </div>
  </section>;
}
