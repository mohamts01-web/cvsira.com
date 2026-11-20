import {LayoutDashboard,FileText,Sparkles,BriefcaseBusiness,MessagesSquare,Send,Linkedin,CreditCard,ArrowUpLeft,Layers,ChevronLeft,UserRound} from "lucide-react";
const resumeServices=[
 {path:"/documents#resume-drafts",title:"سيرتي الذاتية",description:"ابنِ سيرتك بالعربية أو الإنجليزية واحتفظ بنسخك المرتبطة بالفرص.",icon:FileText,label:"محرر السيرة"},
 {path:"/assistant",title:"مساعد إلمام",description:"حسّن صياغتك وترجم سيرتك، وراجع الاقتراحات قبل اعتمادها.",icon:Sparkles,label:"الذكاء الاصطناعي"},
];
export const careerTools=[
 {legacy:"#discover-jobs",path:"/tools/jobs",title:"الوظائف المناسبة",description:"ابحث عن فرصة وخصّص سيرتك لها.",icon:BriefcaseBusiness,label:"استكشف الفرص"},
 {legacy:"#interview-library",path:"/tools/interviews",title:"تحضير المقابلة",description:"تدرّب على شرح خبرتك واحصل على ملاحظات لإجاباتك المكتوبة.",icon:MessagesSquare,label:"تدرّب بثقة"},
 {legacy:"#application-library",path:"/tools/applications",title:"متابعة التقديمات",description:"جهّز رسالتك واجمع الفرص وحالات التقديم في سجل ترجع إليه.",icon:Send,label:"نظّم خطواتك"},
 {legacy:"#linkedin-library-title",path:"/tools/linkedin",title:"ملف LinkedIn",description:"جهّز عنوانك ونبذتك وخبراتك من سيرتك، ثم عدّل المحتوى وانسخه لملفك.",icon:Linkedin,label:"حضورك المهني"}
];
export const workspaceServices=[...resumeServices,...careerTools];
export function WorkspaceNav({path}:{path:string}){
 return <aside className="anchor-sidebar"><span className="anchor-eyebrow">مساحتك المهنية</span><nav aria-label="خدمات إلمام">
 <a href="/documents" aria-current={path==="/documents"&&!location.hash?"page":undefined}><LayoutDashboard size={19}/>نظرة عامة</a>
 {resumeServices.map(s=><a key={s.path} href={s.path} aria-current={(s.path.split("#")[0]===path&&(s.path.includes("#")?!!location.hash:true))?"page":undefined}><s.icon size={19}/>{s.title}</a>)}
 <span className="anchor-nav-divider"/><a href="/tools" aria-current={path==="/tools"?"page":undefined}><Layers size={19}/>أدوات التوظيف</a>
 {careerTools.map(s=><a key={s.path} href={s.path} className="tool-subroute" aria-current={s.path===path?"page":undefined}><s.icon size={18}/>{s.title}</a>)}
 <span className="anchor-nav-divider"/><a href="/profile" aria-current={path==="/profile"?"page":undefined}><UserRound size={19}/>الملف الشخصي</a><a href="/plans" aria-current={path==="/plans"?"page":undefined}><CreditCard size={19}/>الباقة والرصيد</a></nav>
 <div className="anchor-sidebar-note"><span className="anchor-status-dot"/><a href="https://jobs.cvsira.com/" target="_blank" rel="noreferrer">إلمام وظائف<ArrowUpLeft size={16}/></a></div></aside>
}
export function WorkspaceHeading({path}:{path:string}) {
 const tool = careerTools.find(item => item.path === path);
 const Icon = tool?.icon ?? Layers;
 return <header className="service-mast">
   <nav aria-label="مسار التنقل"><a href="/documents">مساحتي</a><ChevronLeft size={14}/>{tool ? <><a href="/tools">أدوات التوظيف</a><ChevronLeft size={14}/><span aria-current="page">{tool.title}</span></> : <span aria-current="page">أدوات التوظيف</span>}</nav>
   <h1>{tool?.title ?? "أدوات التوظيف"}</h1><p>{tool?.description ?? "من البحث عن فرصة إلى الاستعداد للمقابلة، اختر ما تحتاجه الآن."}</p>
   <div className="service-emblem" aria-hidden="true"><Icon/></div>
 </header>
}
export function ServiceGrid({toolsOnly=false}:{toolsOnly?:boolean}){
 const services=toolsOnly?careerTools:workspaceServices;
 return <section className="anchor-services" aria-label="دليل الخدمات">
 {!toolsOnly && <div className="anchor-section-heading"><h2>انتقل إلى خدمة</h2></div>}
 <div className="service-directory">{services.map(s=><a key={s.path} href={s.path}>
 <span className="directory-icon"><s.icon size={23} aria-hidden="true"/></span><div><h3>{s.title}</h3><p>{s.description}</p></div><ArrowUpLeft size={18} aria-hidden="true"/></a>)}</div></section>
}
