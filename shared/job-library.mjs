// The website's public projection is the only source; never accept a caller-selected host.
export const jobCities = {riyadh:"الرياض",jeddah:"جدة",eastern:"المنطقة الشرقية",makkah:"مكة المكرمة",madinah:"المدينة المنورة",tabuk:"تبوك",asir:"عسير",qassim:"القصيم",jazan:"جازان",hail:"حائل",taif:"الطائف",yanbu:"ينبع",kharj:"الخرج"};
export const jobCategories = {government:"حكومية",remote:"عن بُعد",training:"تدريب منتهي بالتوظيف",women:"نسائية",office:"إدارية وموارد بشرية وخدمة عملاء",sales:"تسويق ومبيعات",finance:"محاسبة ومالية وقانونية",engineering:"هندسية",health:"صحية وتعليمية"};
export const jobQualifications = {secondary:"الثانوية",diploma:"الدبلوم",bachelor:"البكالوريوس"};
export function libraryParams(input) {
  const raw = input instanceof URLSearchParams ? input : new URLSearchParams(input);
  const result = new URLSearchParams();
  const q=(raw.get("q")??"").normalize("NFKC").replace(/[٠-٩۰-۹]/g,d=>String(d.charCodeAt(0)&15)).trim().slice(0,100);
  if(q)result.set("q",q);
  for(const [name,values] of [["city",jobCities],["category",jobCategories],["qualification",jobQualifications]])
    if(Object.hasOwn(values,raw.get(name)??""))result.set(name,raw.get(name));
  const page=Math.min(100,Math.max(1,Math.trunc(Number(raw.get("page"))||1)));
  if(page>1)result.set("page",String(page));
  return result;
}
export function libraryHref(input) {
  const query=libraryParams(input).toString();
  return "/jobs"+(query?"?"+query:"");
}
export function readLibrary(value) {
  if(!value||!Array.isArray(value.jobs)||!Number.isSafeInteger(value.total)||value.total<0||!Number.isSafeInteger(value.page)||value.page<1||value.page>100)
    throw Error("invalid_job_library");
  const jobs=value.jobs.map(job=>{
    if(!job||!Number.isSafeInteger(job.id)||job.id<1||typeof job.title!=="string"||!job.title.trim())throw Error("invalid_job");
    return {id:job.id,title:job.title.slice(0,1000),company:typeof job.company==="string"?job.company.slice(0,500):null,location:typeof job.location==="string"?job.location.slice(0,500):null};
  });
  return {jobs:[...new Map(jobs.map(job=>[job.id,job])).values()],total:value.total,page:value.page};
}
