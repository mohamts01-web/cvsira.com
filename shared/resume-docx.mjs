import JSZip from "jszip";
import { resumeBody, escape } from "./render.mjs";
import { validateDesign } from "./model.mjs";

const word = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const office = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const packaging = "http://schemas.openxmlformats.org/package/2006/relationships";
const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const blocks = new Set(["HEADER", "SECTION", "ARTICLE", "DIV", "H1", "H2", "P", "UL", "LI"]);
const arabic = /[\u0600-\u06FF]/;
const clean = value => escape(value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, ""));

export async function resumeDocx(resume, design) {
  const preferences = validateDesign(design);
  const rtl = resume.language === "ar";
  const document = new DOMParser().parseFromString(resumeBody(resume, design), "text/html");
  const links = new Map();
  const paragraphs = [];
  const accent = preferences.accent.slice(1).toUpperCase();

  function run(value, format) {
    const properties = [
      format.bold && "<w:b/><w:bCs/>",
      format.italic && "<w:i/><w:iCs/>",
      format.underline && '<w:u w:val="single"/>',
      format.color && '<w:color w:val="' + format.color + '"/>',
      '<w:sz w:val="' + format.size + '"/><w:szCs w:val="' + format.size + '"/>',
      rtl && arabic.test(value) && "<w:rtl/>",
    ].filter(Boolean).join("");
    const text = value.split(/\r?\n/).map(part => '<w:t xml:space="preserve">' + clean(part) + "</w:t>").join("<w:br/>");
    return "<w:r><w:rPr>" + properties + "</w:rPr>" + text + "</w:r>";
  }

  function inline(node, format) {
    if (node.nodeType === 3) return run(node.nodeValue || "", format);
    if (node.nodeType !== 1 || blocks.has(node.tagName)) return "";
    const tag = node.tagName;
    const href = tag === "A" ? node.getAttribute("href") : null;
    const link = href && /^(?:https?:\/\/|mailto:)/i.test(href) ? href : null;
    const next = {
      ...format,
      bold: format.bold || tag === "STRONG" || tag === "B",
      italic: format.italic || tag === "EM" || tag === "I",
      underline: format.underline || tag === "U" || Boolean(link),
      color: link ? accent : format.color,
    };
    const text = Array.from(node.childNodes, child => inline(child, next)).join("");
    if (!link) return text;
    if (!links.has(link)) links.set(link, "rId" + (links.size + 1));
    return '<w:hyperlink r:id="' + links.get(link) + '">' + text + "</w:hyperlink>";
  }

  function visit(element, options) {
    const tag = element.tagName;
    const heading = tag === "H1" || tag === "H2";
    const size = tag === "H1" ? 34 : tag === "H2" ? 26 : options.size;
    const format = { size, bold: heading, color: heading ? accent : undefined };
    const children = Array.from(element.childNodes);
    const text = children.filter(node => node.nodeType !== 1 || !blocks.has(node.tagName));
    if (text.some(node => node.textContent?.trim())) {
      const alignment = tag === "H1" ? "center" : rtl ? "right" : "left";
      const bullet = tag === "LI" && options.bullets ? run("• ", format) : "";
      const spacing = '<w:spacing w:after="' + (Math.round(preferences.spacing * 56)) + '"/>';
      paragraphs.push("<w:p><w:pPr>" + (heading ? "<w:keepNext/>" : "") +
        (rtl ? "<w:bidi/>" : "") + spacing + '<w:jc w:val="' + alignment + '"/></w:pPr>' +
        bullet + text.map(node => inline(node, format)).join("") + "</w:p>");
    }
    const nested = tag === "SECTION"
      ? { bullets: !element.classList.contains("no-bullets"), size: (preferences.sections[element.dataset.section]?.fontSize || preferences.fontSize) * 2 }
      : options;
    for (const node of children) if (node.nodeType === 1 && blocks.has(node.tagName)) visit(node, nested);
  }

  for (const element of document.body.children) visit(element, { size: preferences.fontSize * 2, bullets: true });
  const zip = new JSZip();
  zip.file("[Content_Types].xml", xml + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("_rels/.rels", xml + '<Relationships xmlns="' + packaging + '"><Relationship Id="rId1" Type="' + office + '/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file("word/document.xml", xml + '<w:document xmlns:w="' + word + '" xmlns:r="' + office + '"><w:body>' + paragraphs.join("") + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="425" w:footer="425" w:gutter="0"/></w:sectPr></w:body></w:document>');
  if (links.size) zip.file("word/_rels/document.xml.rels", xml + '<Relationships xmlns="' + packaging + '">' +
    Array.from(links, ([url, id]) => '<Relationship Id="' + id + '" Type="' + office + '/hyperlink" Target="' + clean(url) + '" TargetMode="External"/>').join("") + "</Relationships>");
  return zip.generateAsync({ type: "blob", mimeType: contentType, compression: "DEFLATE" });
}
