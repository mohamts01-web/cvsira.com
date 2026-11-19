import test from "node:test";
import assert from "node:assert/strict";
import { applicationEmail, gmailRaw } from "../shared/application-email.mjs";

const example = { recipient: "careers@example.invalid", subject: "التقديم على وظيفة محاسب", body: "السلام عليكم،\nأرفق السيرة الذاتية.", filename: "سيرتي.pdf", pdf: new TextEncoder().encode("%PDF-1.7\nexample") };
test("Arabic draft and Gmail payload preserve recipient, subject, body and exact PDF bytes", () => {
  const mime = applicationEmail({ ...example, draft:true });
  assert.match(mime, /^X-Unsent: 1\r\nTo: careers@example.invalid\r\n/);
  const header = mime.slice(mime.indexOf("Subject:"), mime.indexOf("MIME-Version:"));
  const subject = [...header.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)].map(m => Buffer.from(m[1],"base64").toString()).join("");
  assert.equal(subject,example.subject);
  const boundary = mime.match(/boundary="([^"]+)"/)[1];
  const [, body, pdf] = mime.split("--" + boundary);
  assert.equal(Buffer.from(body.split("\r\n\r\n")[1].trim(),"base64").toString(), example.body.replace("\n","\r\n"));
  assert.deepEqual(new Uint8Array(Buffer.from(pdf.split("\r\n\r\n")[1].trim(),"base64")),example.pdf);
  assert.ok(pdf.includes(encodeURIComponent(example.filename)));
  const sent = applicationEmail(example);
  assert.ok(!sent.includes("X-Unsent"));
  assert.equal(Buffer.from(gmailRaw(sent),"base64url").toString(),sent);
});
test("application message rejects header injection, multiple recipients, and invalid PDF", () => {
  for (const overrides of [{recipient:"a@example.invalid,b@example.invalid"}, {recipient:"a@example.invalid\r\nBcc:x@y.co"}, {subject:"subject\r\nBcc:a@example.invalid"}, {pdf:new Uint8Array(3)}])
    assert.throws(() => applicationEmail({...example,...overrides}));
});
