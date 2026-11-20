export async function downloadResumeFile(blob:Blob,filename:string,format:"pdf"|"docx") {
  const bytes=new Uint8Array(await blob.slice(0,5).arrayBuffer());
  const valid=format==="pdf"?new TextDecoder().decode(bytes)==="%PDF-":bytes[0]===80&&bytes[1]===75;
  if(!valid)throw Error("لم يصل ملف صالح للتنزيل. حاول مرة أخرى؛ لم ننزّل صفحة خطأ باسم سيرتك.");
  const typed=new Blob([blob],{type:format==="pdf"?"application/pdf":"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
  const url=URL.createObjectURL(typed);
  const link=document.createElement("a");
  link.href=url;link.download=filename;link.rel="noopener";document.body.append(link);
  link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
