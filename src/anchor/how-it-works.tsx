import {FileText,LayoutTemplate,Sparkles,Target,Download,ArrowLeft} from "lucide-react";
import {useEffect} from "react";
import {StepsPath,type PathStep} from "../components/ui/cd-steps-path";
import {useAppTheme} from "../theme/ThemeProvider";
const STEPS:PathStep[]=[
 {id:"start",title:"ابدأ بما لديك",body:"اكتب بياناتك أو استورد سيرتك الحالية، واختر العربية أو الإنجليزية.",icon:<FileText size={21} aria-hidden="true"/>},
 {id:"design",title:"رتّب سيرتك بطريقتك",body:"اختر القالب وعدّل الخبرات والتعليم والمهارات مباشرة على الورقة.",icon:<LayoutTemplate size={21} aria-hidden="true"/>},
 {id:"improve",title:"راجع اقتراحات المساعد",body:"حسّن الصياغة أو ترجم المحتوى، ثم راجع الفرق قبل اعتماد التغييرات.",icon:<Sparkles size={21} aria-hidden="true"/>},
 {id:"tailor",title:"خصّصها للفرصة",body:"اختر وظيفة وراجع اقتراحات تخصيص تعتمد على خبراتك ومتطلبات الإعلان.",icon:<Target size={21} aria-hidden="true"/>},
 {id:"ready",title:"نزّل واستعد للتقديم",body:"نزّل نسختك، وجهّز رسالة التقديم وتدرّب على المقابلة من مساحتك.",icon:<Download size={21} aria-hidden="true"/>},
];
export function HowItWorks(){
 const {theme,toggle}=useAppTheme();
 useEffect(()=>{if(location.hash==="#how-it-works")document.getElementById("how-it-works")?.scrollIntoView({block:"start"})},[]);
 return <section className="anchor-section how-explainer" id="how-it-works" aria-labelledby="how-title">
  <div className="how-explainer-copy"><span className="anchor-eyebrow">كل خطوة تقرّبك</span><h2 id="how-title">من أول معلومة،<br/><em>إلى استعداد أوضح.</em></h2><p>ابدأ بالسيرة، راجع اقتراحات المساعد وخصّصها للفرصة. بعدها جهّز رسالتك وتدرّب للمقابلة من مساحتك المهنية.</p><a className="secondary" href="/start">ابدأ سيرتك<ArrowLeft size={18} aria-hidden="true"/></a></div>
  <StepsPath steps={STEPS} title="رحلتك في إلمام CV" theme={theme} onThemeChange={toggle} accentColor="var(--ui-accent)" dir="rtl" autoPlay autoPlayInterval={4800}/>
 </section>;
}
