import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { pg } from "./pg.mjs";
import {
  sampleResume,
  emptyResume,
  defaultDesign,
  normalizeCode,
} from "../shared/model.mjs";
const c = JSON.parse(
  fs.readFileSync(
    "E:/مشاريعي/.elmam-local-data/etmam-web/runtime.local.json",
    "utf8",
  ),
);
if (!c.serviceKey) throw Error("private_server_key_required");
const admin = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }),
  user = createClient(c.supabaseUrl, c.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const tag = "etmam-qa-" + crypto.randomUUID(),
  email = tag + "@example.com",
  batch = "disposable-" + tag,
  results = [];
let uid, actor, token;
const lit = (s) => "'" + String(s).replaceAll("'", "''") + "'";
async function api(path, body, method) {
  const r = await fetch(c.supabaseUrl + "/functions/v1/etmam-api" + path, {
    method: method || (body === undefined ? "GET" : "POST"),
    redirect: "error",
    signal: AbortSignal.timeout(25000),
    headers: {
      apikey: c.publishableKey,
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Origin: "https://cv.cvsira.com",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const j = await r.json();
  return {
    status: r.status,
    data: j,
    cors: r.headers.get("Access-Control-Allow-Origin"),
  };
}
const pass = (name) => {
  results.push({ name, passed: true });
  console.log("PASS " + name);
};
async function job(kind, d, extra = {}) {
  const r = await api("/jobs", {
    kind,
    draftId: d.id,
    revision: d.revision,
    consent: true,
    idempotencyKey: crypto.randomUUID(),
    ...extra,
  });
  assert.equal(r.status, 202, JSON.stringify(r.data));
  let j = r.data;
  for (
    let i = 0;
    i < 70 && !["completed", "failed", "uncertain"].includes(j.state);
    i++
  ) {
    await new Promise((r) => setTimeout(r, 1600));
    j = (await api("/jobs/" + j.id)).data;
  }
  assert.equal(j.state, "completed", j.error || "Job incomplete");
  return j;
}
try {
  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (link.error) throw Error("test_auth_link_failed");
  uid = link.data.user.id;
  const verificationType =
    link.data.properties.verification_type === "signup"
      ? "signup"
      : "magiclink";
  const verified = await user.auth.verifyOtp({
    token_hash: link.data.properties.hashed_token,
    type: verificationType,
  });
  if (verified.error)
    throw Error(
      "test_auth_verification_failed:" +
        verified.error.code +
        ":" +
        verified.error.status +
        ":" +
        verificationType,
    );
  token = verified.data.session.access_token;
  let me = await api("/me");
  assert.equal(me.status, 200, JSON.stringify(me.data));
  assert.equal(me.cors, "https://cv.cvsira.com");
  assert.equal(verified.data.user.id, uid);
  assert.equal(verified.data.user.email, email);
  assert.match(me.data.id,/^[a-f0-9-]{36}$/i);
  assert.equal(me.data.membership,null);
  actor = me.data.id;
  pass("verified email identity and production CORS");

  assert.match(actor,/^[a-f0-9-]{36}$/i);
  assert.equal(me.data.membership,null);
  pg("INSERT INTO etmam.memberships(account_id,activated,expires,ai_limit,ai_used) VALUES ("+lit(actor)+",now(),now()+interval '1 hour',1,0)");
  const english = process.argv.includes('--english');
  const careerShift = process.argv.includes('--career-shift');
  const graduate = process.argv.includes('--graduate');
  const content=graduate ? {
    ...emptyResume(),language:'ar',profile:'graduate',name:'خريجة تجريبية',email:'tester@example.invalid',
    headline:'حديثة تخرج في الإدارة',summary:'أنجزت مشروعًا جامعيًا رتبت فيه سجلات المصروفات وراجعت المستندات.',
    education:[{title:'بكالوريوس الإدارة',organization:'جامعة تجريبية',end:'2026'}],
    projects:[{title:'مشروع جامعي لمراجعة المصروفات',details:['رتبت سجلات المصروفات وراجعت المستندات المرفقة.']}],
    skills:['تنظيم السجلات'],
  } : careerShift ? {
    ...emptyResume(),language:'ar',profile:'experienced',name:'مرشح تجريبي',email:'tester@example.invalid',
    headline:'منسق خدمة عملاء',summary:'أتابع الطلبات وأطابق سجلات العملاء وأراجع المستندات الناقصة مع الفريق.',
    experience:[{title:'منسق خدمة عملاء',organization:'شركة تجريبية',start:'2023',end:'2025',details:['راجعت سجلات طلبات العملاء وطابقت البيانات الواردة فيها.']}],
    skills:['مراجعة السجلات','متابعة الطلبات'],
  } : english ? {
    ...emptyResume(),language:'en',name:'Sample Applicant',headline:'Junior Accountant',
    email:'tester@example.invalid',summary:'Reviewed purchase invoices and prepared weekly reconciliation reports during an internship.',
    skills:['Excel','Invoice reconciliation'],
  } : {...structuredClone(sampleResume),email:'tester@example.invalid',summary:'لدي خبرة في تنظيم العمليات وإعداد التقارير باستخدام إكسل.'};
  const created=await api('/drafts',{title:'DISPOSABLE QA',content,design:defaultDesign()});
  assert.equal(created.status,201);
  const d=created.data;
  const vacancyResponse=await fetch('https://jobs.cvsira.com/api/cv-job/1454',{signal:AbortSignal.timeout(10000)});
  assert.equal(vacancyResponse.status,200);
  const listing=await vacancyResponse.json();
  const tailored=await job('improve',d,{jobTarget:listing});
  assert(tailored.result?.content);
  assert.equal(tailored.result.content.name,content.name);
  assert.equal(tailored.result.content.email,content.email);
  assert.equal(tailored.result.content.language,content.language);
  if(graduate){
    const proposed=tailored.result.content;
    assert.equal(proposed.profile,'graduate');
    assert.equal(proposed.experience.length,0);
    assert.equal(proposed.education[0].title,content.education[0].title);
    assert.equal(proposed.projects.length,1);
    assert.doesNotMatch(JSON.stringify(proposed), /Excel|إكسل|بكالوريوس المحاسبة|محاسب سابق/i);
    pass('graduate tailoring kept academic evidence and did not invent employment');
  }
  if(careerShift){
    const proposed=tailored.result.content;
    assert.equal(proposed.experience.length,1);
    assert.equal(proposed.experience[0].title,content.experience[0].title);
    assert.equal(proposed.experience[0].organization,content.experience[0].organization);
    assert.equal(proposed.education.length,0);
    assert.doesNotMatch(JSON.stringify(proposed), /Excel|إكسل|بكالوريوس|محاسب سابق/i);
    pass('career-change wording retained actual role and did not add target qualifications');
  }
  const copy=await api('/drafts',{title:'DISPOSABLE QA – tailored',content:tailored.result.content,design:{...d.design,targetVacancy:{id:listing.id,title:listing.title}}});
  assert.equal(copy.status,201);
  assert.equal(copy.data.design.targetVacancy.id,listing.id);
  assert.notEqual(copy.data.id,d.id);
  const original=await api('/drafts/'+d.id);
  assert.equal(original.data.content.summary,content.summary);
  assert.equal(original.data.revision,d.revision);
  pass('live tailoring and independent draft with original preserved');
  const approved=await api('/drafts/'+copy.data.id+'/approve',{revision:copy.data.revision});
  assert.equal(approved.status,200);
  const pdf=await job('export',approved.data);
  const file=await fetch(pdf.result.downloadUrl,{signal:AbortSignal.timeout(20000)});
  assert.equal(file.status,200);
  const bytes=Buffer.from(await file.arrayBuffer());
  assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
  if(english) fs.writeFileSync('private/pdf-local-check/cloud-tailored-en.pdf',bytes);
  pass('live signed PDF download');
} finally {
  try { if (actor) {
    const { data: objects } = await admin.storage
      .from("etmam-private")
      .list(actor);
    if (objects?.length)
      await admin.storage
        .from("etmam-private")
        .remove(objects.map((x) => actor + "/" + x.name));
    pg(
      `BEGIN;DELETE FROM etmam.pdf_cache WHERE account_id=${lit(actor)};DELETE FROM etmam.jobs WHERE account_id=${lit(actor)};DELETE FROM etmam.link_tokens WHERE account_id=${lit(actor)};DELETE FROM etmam.code_attempts WHERE account_id=${lit(actor)};DELETE FROM etmam.sessions WHERE account_id=${lit(actor)};DELETE FROM etmam.drafts WHERE account_id=${lit(actor)};DELETE FROM etmam.codes WHERE batch=${lit(batch)};DELETE FROM etmam.memberships WHERE account_id=${lit(actor)};DELETE FROM etmam.identities WHERE account_id=${lit(actor)};DELETE FROM etmam.accounts WHERE id=${lit(actor)};COMMIT;`,
    );
  }
  } finally { if (uid) { const removed=await admin.auth.admin.deleteUser(uid); if(removed.error) throw Error("temporary_auth_cleanup_failed"); } }
  console.log("Disposable test data cleaned; existing accounts untouched.");
}
