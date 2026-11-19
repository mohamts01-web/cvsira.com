import {
  client,
  command,
  digest,
  env,
  legacyHash,
  publicError,
  readJSON,
  optionalEnv,
} from "../_shared/runtime.ts";
import { runJob, signPDF } from "../_shared/jobs.ts";
import { whopBilling } from "../_shared/whop-billing.ts";
import {
  billing,
  paddleCatalog,
  paddleCheckout,
  paddlePortal,
  paddleAPI,
  provisionPaddleTransaction,
  requirePaddleUser,
  previewPlanChange,
  confirmPlanChange,
} from "../_shared/paddle.ts";
import {
  normalizeCode,
  validateResume,
  validateDesign,
} from "../_shared/model.mjs";
type Draft = {
  id: string;
  content: Parameters<typeof validateResume>[0];
  revision: number;
};
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };
const cvOrigin = "https://cv.cvsira.com";
function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = env("ETMAM_WEB_ORIGINS").split(",");
  return {
    "Access-Control-Allow-Origin": origin === cvOrigin || allowed.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization,apikey,content-type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
}
Deno.serve(async (req) => {
  const headers = cors(req);
  const json = (body: unknown, status = 200) =>
    Response.json(body, { status, headers });
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (
    new URL(req.url).pathname.endsWith("/billing/public") &&
    req.method === "GET"
  )
    return json({
      liveReady:
        optionalEnv("ETMAM_DIRECT_BILLING_ENABLED") === "true" &&
        optionalEnv("ETMAM_PADDLE_ENVIRONMENT") === "live" &&
        optionalEnv("ETMAM_PADDLE_LIVE_READY") === "true",
    });
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token) throw Error("unauthorized");
    const { data, error } = await client().auth.getUser(token);
    if (error || !data.user?.email_confirmed_at || data.user.is_anonymous)
      throw Error("unauthorized");
    const actor = await command<string>(null, "resolve", {
      kind: "email",
      subject: data.user.id,
    });
    const path = new URL(req.url).pathname.replace(/^.*\/etmam-api/, "");
    const body = ["POST", "PUT"].includes(req.method)
      ? await readJSON(req)
      : {};
    const linkedIn = /^\/linkedin\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(path);
    if ((linkedIn && ["GET", "PUT"].includes(req.method)) || (path === "/linkedin" && req.method === "GET")) {
      const { sections = null, revision = null } = body;
      if (req.method === "PUT") {
        const keys = ["headline", "about", "experience", "education", "projects", "certifications", "skills"];
        if (!Number.isSafeInteger(revision) || revision < 0 || revision >= 2147483647 || !sections ||
          typeof sections !== "object" || Array.isArray(sections) ||
          !Object.entries(sections).every(([key, values]) => keys.includes(key) && Array.isArray(values) &&
            values.length <= 40 && values.every((value) => typeof value === "string" && value.length <= 8000)) ||
          new TextEncoder().encode(JSON.stringify(sections)).length > 110000)
          return json({ error: "محتوى LinkedIn تجاوز حد الحفظ أو يتضمن حقولًا غير صالحة." }, 400);
      }
      const result = await client().rpc("etmam_linkedin_profile", { p_actor: actor, p_draft: linkedIn?.[1] ?? null, p_sections: sections, p_revision: revision });
      if (result.error) return json({ error: "تعذّر الوصول إلى ملف LinkedIn." }, 503);
      if (req.method === "PUT" && result.data === null)
        return json({ error: "تعذّر الحفظ. تأكد من توفر المسودة وأعد فتحها إذا عُدّل الملف على جهاز آخر." }, 409);
      return json(result.data);
    }
    const interview = /^\/interviews(?:\/(\d{1,12}))?$/.exec(path);
    if (interview && (req.method === "GET" || req.method === "PUT" && interview[1])) {
      const job = interview[1] === undefined ? null : Number(interview[1]);
      let payload = null;
      let revision = null;
      if (req.method === "PUT") {
        const { vacancy, notes, topic, questionId } = body;
        revision = body.revision;
        const questions = ["intro", "example", "learn", "qualification", "required-experience", "job-task"];
        const bounded = (value: unknown, max: number) => typeof value === "string" && value.length <= max;
        if (!Number.isSafeInteger(revision) || revision < 0 || revision >= 2147483647 ||
          !vacancy || vacancy.id !== job || !bounded(vacancy.title, 300) || !vacancy.title.trim() ||
          typeof vacancy.aggregate !== "boolean" || !bounded(vacancy.description, 24000) ||
          !["company", "location", "qualification", "experience"].every((field) => vacancy[field] === null || bounded(vacancy[field], 1000)) ||
          !bounded(topic, 240) || !questions.includes(questionId) || !notes || typeof notes !== "object" ||
          Array.isArray(notes) || !Object.entries(notes).every(([key, value]) => questions.includes(key) && bounded(value, 2500)))
          return json({ error: "بيانات جلسة المقابلة غير صالحة." }, 400);
        const { id, title, company, location, qualification, experience, description, aggregate } = vacancy;
        payload = { vacancy: { id, title, company, location, qualification, experience, description, aggregate }, notes, topic, questionId };
        if (new TextEncoder().encode(JSON.stringify(payload)).length > 56000)
          return json({ error: "بيانات جلسة المقابلة طويلة جدًا." }, 400);
      }
      const result = await client().rpc("etmam_interview_sessions", { p_actor: actor, p_job: job, p_payload: payload, p_revision: revision });
      if (result.error) return json({ error: "تعذّر الوصول إلى جلسات المقابلة." }, 503);
      if (req.method === "PUT" && result.data === null)
        return json({ error: "تغيّرت الجلسة على جهاز آخر. احتفظ بنسخة من تعديلاتك وافتح الجلسة من جديد." }, 409);
      return json(result.data);
    }
    if (path === "/applications" && ["GET", "POST"].includes(req.method)) {
      let action = "list";
      let entry = {};
      if (req.method === "POST") {
        const { id, title, company, stage } = body;
        if (!Number.isSafeInteger(id) || id <= 0 || id > 999999999999)
          return json({ error: "رقم الإعلان غير صالح." }, 400);
        if (stage === "") {
          action = "remove";
          entry = { id };
        } else {
          if (!["saved", "applied", "interview", "closed"].includes(stage) ||
            typeof title !== "string" || !title.trim() ||
            (company !== null && typeof company !== "string"))
            return json({ error: "بيانات متابعة الإعلان غير صالحة." }, 400);
          action = "upsert";
          entry = { id, title: title.trim().slice(0, 300), company: company?.trim().slice(0, 300) || null, stage };
        }
      }
      const result = await client().rpc("etmam_application_tracker", { p_actor: actor, p_action: action, p_entry: entry });
      if (result.error) return json({ error: "تعذّرت مزامنة متابعة التقديم." }, 503);
      return json(result.data);
    }
    if (path === "/billing/catalog" && req.method === "GET")
      return json(await paddleCatalog(actor, data.user.email || ""));
    if (path.startsWith("/billing/whop/"))
      return json(await whopBilling(actor, data.user.email || "", path, req.method, body,
        req.headers.get("Origin") === cvOrigin ? cvOrigin + "/plans" : undefined));
    if (path.startsWith("/billing/")) {
      requirePaddleUser(data.user.email || "", false);
      if (path === "/billing/checkout" && req.method === "POST")
        return json(await paddleCheckout(actor, data.user.email || "", body));
      if (path === "/billing/status" && req.method === "GET")
        return json(await billing(actor, "status"));
      if (path === "/billing/portal" && req.method === "POST")
        return json(await paddlePortal(actor, data.user.email || ""));
      if (path === "/billing/change-preview" && req.method === "POST")
        return json(
          await previewPlanChange(
            actor,
            data.user.email || "",
            String(body.sku || ""),
          ),
        );
      if (path === "/billing/change-confirm" && req.method === "POST")
        return json(
          await confirmPlanChange(
            actor,
            data.user.email || "",
            String(body.id || ""),
          ),
        );
      if (path === "/billing/cancel-checkout" && req.method === "POST") {
        const intent = await billing(actor, "intent.get", {
          id: body.intentId,
        });
        if (intent.completed || !intent.transactionId)
          throw Error("checkout_pending");
        const tx = await paddleAPI("/transactions/" + intent.transactionId);
        if (tx.status === "canceled") return json({ canceled: true });
        if (!["draft", "ready"].includes(tx.status))
          throw Error("checkout_pending");
        const canceled = await paddleAPI(
          "/transactions/" + tx.id,
          { status: "canceled" },
          "PATCH",
        );
        return json({ canceled: canceled.status === "canceled" });
      }
      if (path === "/billing/confirm" && req.method === "POST") {
        const intent = await billing(actor, "intent.get", {
          id: body.intentId,
        });
        if (!intent.completed && intent.transactionId)
          await provisionPaddleTransaction(
            intent.transactionId,
            "evt_" + crypto.randomUUID().replaceAll("-", "").slice(0, 26),
            new Date().toISOString(),
          );
        return json(await billing(actor, "intent.get", { id: body.intentId }));
      }
    }
    if (path === "/me" && req.method === "GET")
      return json(await command(actor, "me"));
    if (path === "/redeem" && req.method === "POST") {
      const raw = normalizeCode(body.code);
      if (!/^(?:[A-F0-9]{24}|[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8})$/.test(raw))
        throw Error("invalid_code");
      return json(
        await command(actor, "redeem", {
          hash: await legacyHash("activation:" + raw),
        }),
      );
    }
    if (path === "/link" && req.method === "POST") {
      const raw =
        crypto.randomUUID().replaceAll("-", "") +
        crypto.randomUUID().replaceAll("-", "").slice(0, 16);
      await command(actor, "link.create", { hash: await digest(raw) });
      return json({ url: "https://t.me/etmam_cv_bot?start=link_" + raw });
    }
    if (path === "/drafts" && req.method === "GET")
      return json(await command(actor, "drafts.list"));
    if (path === "/drafts" && req.method === "POST")
      return json(
        await command(actor, "drafts.create", {
          title: String(body.title || "سيرتي الذاتية"),
          content: validateResume(body.content),
          design: validateDesign(body.design),
        }),
        201,
      );
    const match = path.match(/^\/drafts\/([0-9a-f-]{36})(\/approve)?$/i);
    if (match) {
      const id = match[1];
      if (req.method === "GET" && !match[2])
        return json(await command(actor, "drafts.get", { id }));
      if (req.method === "PUT" && !match[2])
        return json(
          await command(actor, "drafts.save", {
            id,
            revision: body.revision,
            title: String(body.title || "سيرتي الذاتية"),
            content: validateResume(body.content),
            design: validateDesign(body.design),
          }),
        );
      if (req.method === "DELETE" && !match[2])
        return json(await command(actor, "drafts.delete", { id }));
      if (req.method === "POST" && match[2]) {
        const d = await command<Draft>(actor, "drafts.get", { id });
        validateResume(d.content, { complete: true });
        return json(
          await command(actor, "drafts.approve", {
            id,
            revision: body.revision,
          }),
        );
      }
    }
    if (path === "/jobs" && req.method === "POST") {
      if (
        !["improve", "translate", "chat", "import", "export"].includes(
          body.kind,
        ) ||
        typeof body.idempotencyKey !== "string" ||
        body.idempotencyKey.length > 80
      )
        throw Error("invalid_job_kind");
      if (
        body.kind === "translate" &&
        !["ar", "en"].includes(body.targetLanguage)
      )
        throw Error("invalid_language");
      const job = await command<{ id: string }>(actor, "jobs.create", body);
      EdgeRuntime.waitUntil(runJob(actor, job.id));
      return json(job, 202);
    }
    const job = path.match(/^\/jobs\/([0-9a-f-]{36})(\/apply)?$/i);
    if (job) {
      if (req.method === "GET" && !job[2]) {
        const result = await command<{
          state: string;
          draft_id?: string;
          result?: { objectPath?: string; downloadUrl?: string };
        }>(actor, "jobs.get", { id: job[1] });
        if (result.result?.objectPath) {
          const current = result.draft_id
            ? await command<{ title: string }>(actor, "drafts.get", {
                id: result.draft_id,
              })
            : null;
          result.result = {
            downloadUrl: await signPDF(
              actor,
              result.result.objectPath,
              current?.title,
            ),
          };
        }
        return json(result);
      }
      if (req.method === "POST" && job[2])
        return json(
          await command(actor, "jobs.apply", {
            id: job[1],
            revision: body.revision,
            keys: body.keys,
          }),
        );
    }
    return json({ error: "الصفحة غير موجودة." }, 404);
  } catch (error) {
    const e = publicError(error);
    return json({ error: e.message }, e.status);
  }
});
