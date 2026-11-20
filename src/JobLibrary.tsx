import { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, MapPin, Search, SlidersHorizontal, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { jobCategories,jobCities,jobQualifications,libraryHref,libraryParams } from "../shared/job-library.mjs";
import { useJobLibrary, type LibraryJob } from "./job-library";

export function JobLibraryCard({job}:{job:LibraryJob}) {
 return <article className="jl-card">
   <span className="jl-company-icon" aria-hidden="true"><Building2 size={26}/></span>
   <div className="jl-card-body"><span className="jl-id">إعلان #{job.id.toLocaleString("ar-SA",{useGrouping:false})}</span>
     <h2><a href={`/for-job/${job.id}`}>{job.title}</a></h2>
     {job.company&&<p className="jl-company">{job.company}</p>}
     {job.location&&<p className="jl-location"><MapPin size={15} aria-hidden="true"/>{job.location}</p>}
   </div>
   <div className="jl-card-actions"><a className="primary" href={`/for-job/${job.id}`}>جهّز سيرتك لهالفرصة<ArrowLeft size={16} aria-hidden="true"/></a><a className="jl-source-link" href={`https://jobs.cvsira.com/j/${job.id}`} target="_blank" rel="noreferrer">تفاصيل الإعلان في إلمام وظائف ↗</a></div>
 </article>;
}
export function HomeJobs() {
 const {data,loading,error,retry}=useJobLibrary();
 return <section className="anchor-section jl-home" aria-labelledby="home-jobs-title">
  <div className="jl-home-copy"><span className="ds-eyebrow">الفرصة هنا. استعدادك يبدأ معك.</span><h2 id="home-jobs-title">دَوّر فرصتك،<br/>وجهّز خطوتك الجاية.</h2><p>مكتبة إلمام وظائف معك هنا، تتحدث تلقائيًا. استكشف الفرص، ثم جهّز سيرة تناسب متطلبات الإعلان.</p><a className="primary" href="/jobs">تصفّح الوظائف<ArrowLeft size={18} aria-hidden="true"/></a></div>
  <div className="jl-count"><BriefcaseBusiness size={30} aria-hidden="true"/><div role="status">{loading?<p>جارٍ تحديث الفرص…</p>:error?<><p>تعذّر تحديث العدد حاليًا</p><button className="text-btn" onClick={retry}>أعد المحاولة</button></>:<><strong>{data!.total.toLocaleString("ar-SA")}</strong><span>إعلان وظيفي نشط</span></>}</div><small>من مكتبة إلمام وظائف · يتحدث تلقائيًا</small><p className="jl-count-note">قد يتضمن الإعلان أكثر من مسمّى وظيفي.</p></div>
 </section>;
}
export default function JobLibrary() {
 const [query,setQuery]=useState(()=>libraryParams(location.search).toString());
 const [filtersOpen,setFiltersOpen]=useState(false);
 const params=new URLSearchParams(query);
 const {data,loading,error,retry}=useJobLibrary(query);
 useEffect(()=>{const back=()=>setQuery(libraryParams(location.search).toString());window.addEventListener("popstate",back);return ()=>window.removeEventListener("popstate",back)},[]);
 function navigate(next:URLSearchParams){const clean=libraryParams(next);history.pushState({},"",libraryHref(clean));setQuery(clean.toString())}
 const chips=[params.get("q")?["q",`البحث: ${params.get("q")}`]:null,...Object.entries({city:jobCities,category:jobCategories,qualification:jobQualifications}).map(([key,values])=>params.get(key)?[key,(values as Record<string,string>)[params.get(key)!]]:null)].filter(Boolean) as string[][];
 const page=Number(params.get("page")||1);
 const pageHref=(n:number)=>{const next=new URLSearchParams(params);next.set("page",String(n));return libraryHref(next)};
 return <main className="container jl-page">
  <nav className="jl-breadcrumb" aria-label="مسار التنقل"><a href="/">إلمام</a><ChevronLeft size={14} aria-hidden="true"/><span aria-current="page">تصفّح الوظائف</span></nav>
  <header className="jl-heading"><div><span className="ds-eyebrow">مكتبة إلمام وظائف، في مساحتك</span><h1>فرصتك الجاية تبدأ من هنا.</h1><p>استكشف الإعلانات النشطة، وافتح الفرصة لتراجع متطلباتها وتجهّز سيرتك لها.</p></div><span className="jl-heading-icon" aria-hidden="true"><BriefcaseBusiness size={36}/></span></header>
  <form className="jl-search" key={query} onSubmit={event=>{event.preventDefault();const form=new FormData(event.currentTarget);const next=new URLSearchParams();for(const [key,value] of form)if(typeof value==="string"&&value)next.set(key,value);navigate(next);setFiltersOpen(false)}}>
   <label htmlFor="library-query">المسمّى، الجهة أو رقم الإعلان</label><div className="jl-search-row"><div className="jl-search-input"><Search size={20} aria-hidden="true"/><input id="library-query" name="q" defaultValue={params.get("q")??""} maxLength={100} placeholder="مثل: محاسب، أو رقم الإعلان" dir="auto"/></div><button type="button" className="secondary jl-filter-button" aria-expanded={filtersOpen} aria-controls="library-filters" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} aria-hidden="true"/>التصفية</button><button className="primary" type="submit">ابحث<ArrowLeft size={17} aria-hidden="true"/></button></div>
   <div className={`jl-filters${filtersOpen?" is-open":""}`} id="library-filters">{([["city","المدينة",jobCities],["category","التخصص",jobCategories],["qualification","المؤهل",jobQualifications]] as const).map(([name,label,options])=><label key={name}>{label}<select name={name} defaultValue={params.get(name)??""}><option value="">الكل</option>{Object.entries(options).map(([value,title])=><option key={value} value={value}>{title}</option>)}</select></label>)}</div>
  </form>
  {chips.length>0&&<div className="jl-chips" aria-label="الفلاتر المحددة">{chips.map(([key,label])=><button key={key} onClick={()=>{const next=new URLSearchParams(params);next.delete(key);next.delete("page");navigate(next)}} aria-label={`إزالة ${label}`}>{label}<span aria-hidden="true">×</span></button>)}<a href="/jobs">مسح الكل</a></div>}
  <div className="jl-results-heading"><h2>الفرص المتاحة</h2><span role="status">{loading?"جارٍ جلب الإعلانات…":error?"تعذّر تحديث النتائج":`${data!.total.toLocaleString("ar-SA")} إعلان · الأحدث أولًا`}</span></div>
  {loading?<div className="jl-loading" aria-hidden="true">{[1,2,3].map(n=><div key={n}/>)}</div>:error?<section className="jl-empty" role="alert"><h2>ما قدرنا نحمّل الفرص الآن</h2><p>جرّب مرة ثانية. ما تغيّر بحثك ولا اختياراتك.</p><button className="primary" onClick={retry}>إعادة المحاولة</button><a href="https://jobs.cvsira.com/jobs" target="_blank" rel="noreferrer">افتح مكتبة إلمام وظائف ↗</a></section>:data?.jobs.length?<><div className="jl-list">{data.jobs.map(job=><JobLibraryCard key={job.id} job={job}/>)}</div><nav className="jl-pagination" aria-label="صفحات الوظائف">{page>1&&<a className="secondary" href={pageHref(page-1)}><ChevronRight size={16}/>السابق</a>}<span>الصفحة {page.toLocaleString("ar-SA")}</span>{page*18<data.total&&page<100&&<a className="secondary" href={pageHref(page+1)}>التالي<ChevronLeft size={16}/></a>}</nav></>:<section className="jl-empty"><Search size={30} aria-hidden="true"/><h2>ما لقينا فرصًا بهالاختيارات</h2><p>جرّب كلمة أقصر، أو وسّع المدينة والتخصص.</p><a className="primary" href="/jobs">عرض كل الوظائف</a></section>}
  <aside className="jl-help"><BriefcaseBusiness size={22} aria-hidden="true"/><p>تصفّح الوظائف مجاني. تخصيص السيرة يساعدك تبرز خبرتك الفعلية؛ ما يضمن قبولك أو حصولك على وظيفة.</p></aside>
 </main>;
}
