const crlf = "\r\n";
const utf8 = text => new TextEncoder().encode(text);

function base64(bytes) {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 8192)
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  return btoa(chunks.join(""));
}
function body64(bytes) {
  return base64(bytes).match(/.{1,76}/g)?.join(crlf) ?? "";
}
function encodedSubject(value) {
  const words = [];
  let current = "";
  for (const character of value) {
    if (utf8(current + character).length > 42) {
      words.push(current);
      current = "";
    }
    current += character;
  }
  words.push(current);
  return words.map(word => "=?UTF-8?B?" + base64(utf8(word)) + "?=").join(crlf + " ");
}
export function applicationEmail({ recipient, subject, body, pdf, filename, draft = false }) {
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(recipient) || recipient.length > 254)
    throw Error("اكتب عنوان بريد واحدًا لجهة التوظيف.");
  if (!subject.trim() || /[\x00-\x1f\x7f]/.test(subject) || subject.length > 300 || !body.trim())
    throw Error("راجع عنوان الرسالة ونصها.");
  if (pdf.length > 5 * 1024 * 1024 || new TextDecoder().decode(pdf.subarray(0, 5)) !== "%PDF-")
    throw Error("اختر سيرة بصيغة PDF بحجم أقصاه 5 ميغابايت.");
  const boundary = "elmam-" + crypto.randomUUID();
  const attachment = encodeURIComponent(filename.replace(/[\x00-\x1f\x7f/\\]/g, "").slice(0, 100))
    .replace(/['()*]/g, c => "%" + c.charCodeAt(0).toString(16));
  return [
    ...(draft ? ["X-Unsent: 1"] : []), "To: " + recipient, "Subject: " + encodedSubject(subject),
    "MIME-Version: 1.0", 'Content-Type: multipart/mixed; boundary="' + boundary + '"', "",
    "--" + boundary, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "",
    body64(utf8(body.replace(/\r?\n/g, crlf))), "--" + boundary,
    "Content-Type: application/pdf", "Content-Transfer-Encoding: base64",
    "Content-Disposition: attachment; filename=\"CV.pdf\";"," filename*=UTF-8''" + attachment,
    "", body64(pdf), "--" + boundary + "--", "",
  ].join(crlf);
}
export function gmailRaw(mime) {
  return base64(utf8(mime)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
