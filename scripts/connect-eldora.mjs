import fs from "node:fs";
const edit=(path,fn)=>fs.writeFileSync(path,fn(fs.readFileSync(path,"utf8")));
edit("src/main.tsx",s=>s.replace('import "./theme/theme-tokens.css";','import "./theme/theme-tokens.css";\nimport "./components/eldoraui/shiny-button.css";\nimport "./components/eldoraui/product-components.css";'));
edit("src/anchor/anchor-source.css",s=>s.replace('--color-muted: #241c2e;','--color-muted: var(--ui-surface-2);').replace('--color-muted-foreground: #b7a9c6;','--color-muted-foreground: var(--ui-muted);'));
edit("src/anchor/button.tsx",s=>`import type {ButtonHTMLAttributes} from "react";
import {AnimatedShinyButton} from "../components/eldoraui/animated-shiny-button";
export function Button({variant,size,className="",...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:string;size?:string}) {
 if(variant!=="ghost")return <AnimatedShinyButton {...props} className={(size==="lg"?"anchor-button-lg ":"")+className}/>;
 return <button type="button" {...props} className={"anchor-button anchor-ghost "+(size==="lg"?"anchor-button-lg ":"")+className}/>;
}
`);
edit("src/components/ui/fancy-button.tsx",s=>s.replace('cva("primary elmam-fancy-button','cva("eldora-shiny elmam-fancy-button'));
edit("src/anchor/hero-section.tsx",s=>{
 s='import AnimatedBadge from "../components/eldoraui/animated-badge";\nimport {WordPullUpText} from "../components/eldoraui/word-pull-up-text";\nimport {BlurInText} from "../components/eldoraui/blur-in-text";\n'+s;
 const a=s.indexOf('            <div className="inline-flex items-center gap-2 rounded-full'),b=s.indexOf('            <h1',a);
 if(a<0||b<0)throw Error("Hero badge not found");s=s.slice(0,a)+'            <div className="mb-8 w-fit"><AnimatedBadge text="إلمام CV · مساحتك المهنية" /></div>\n\n'+s.slice(b);
 s=s.replace('              مسارك يستحق','              <WordPullUpText text="مسارك يستحق"/>').replace('>بداية أقوى.</span>','><WordPullUpText text="بداية أقوى."/></span>').replace('              ابدأ بسيرتك.','              <WordPullUpText text="ابدأ بسيرتك."/>');
 s=s.replace('              من أول سطر في سيرتك إلى استعدادك للمقابلة. أدوات مترابطة تساعدك تعرض خبرتك بوضوح وتستعد للفرصة القادمة.','              <BlurInText text="من أول سطر في سيرتك إلى استعدادك للمقابلة. أدوات مترابطة تساعدك تعرض خبرتك بوضوح وتستعد للفرصة القادمة."/>');return s;
});
edit("src/anchor/AnchorHome.tsx",s=>{
 s='import {BrowserFrame,CardFlipHover,LiveButton,AnimatedJourney,IntegrationFlow} from "../components/eldoraui/product-components";\nimport {Grid} from "../components/eldoraui/grid";\nimport Terminal from "../components/eldoraui/terminal";\n'+s;
 s=s.replace('<div className="anchor-template-stage">','<BrowserFrame><div className="anchor-template-stage">').replace('معاينة قبل التنزيل</span></div></div></section>','معاينة قبل التنزيل</span></div></div></BrowserFrame></section>');
 s=s.replace(' <BentoGrid/><HowItWorks/>',` <BentoGrid/>
 <section className="anchor-section"><div className="anchor-section-heading"><div><span className="anchor-eyebrow">من السيرة إلى الاستعداد</span><h2>أدوات تتكامل مع خطوتك.</h2></div><p>استعرض البطاقة لتعرف كيف تساعدك الأداة، أو افتحها مباشرة.</p></div><div className="eldora-feature-scene"><div className="eldora-flip-grid"><CardFlipHover href="/tools/jobs" front={<><FileText size={32}/><h3>نسخة لكل فرصة</h3><p>سيرتك في سياق الوظيفة.</p></>} details="اختر وظيفة ثم راجع اقتراحات مرتبطة بمتطلباتها وخبراتك الفعلية قبل حفظ النسخة."/><CardFlipHover href="/tools/interviews" front={<><MessageCircle size={32}/><h3>قبل المقابلة</h3><p>حوّل خبرتك إلى إجابات واضحة.</p></>} details="تدرّب كتابةً أو صوتيًا، وراجع أمثلتك العملية. احفظ جلسة التدريب لتكملها لاحقًا."/></div><AnimatedJourney/></div><IntegrationFlow/></section>
 <HowItWorks/>`);
 s=s.replace('<div className="anchor-demo-output" key={demo}>','<div className="anchor-demo-output" key={demo}>');
 // A real Eldora Terminal displays the selected phase, while the existing tabs stay usable.
 const start=s.indexOf('<div className="anchor-demo-output" key={demo}>'),end=s.indexOf('<a href="/tools/jobs">ابدأ من وظيفة',start);
 if(start<0||end<0)throw Error("Application demo not found");
 s=s.slice(0,start)+`<div className="anchor-demo-output"><Terminal key={demo} command={steps[demo]} steps={[{text:demo===0?"راجع متطلبات الوظيفة واختر سيرتك.":demo===1?"اقتراحات مبنية على خبرتك الفعلية.":"راجع المستلم والرسالة والمرفق قبل الإرسال."},{text:"مثال توضيحي · القرار لك.",bold:true}]} showLocalhost={false}/></div>`+s.slice(end);
 s=s.replace('<div className="anchor-final-grid" aria-hidden="true"/>','<div className="anchor-final-grid" aria-hidden="true"><Grid rows={5} columns={12} height="h-full" showPlusIcons={true}/></div>');
 s=s.replace('<a href="https://t.me/etmam_cv_bot" target="_blank" rel="noreferrer"><MessageCircle size={17}/>أو أكمل عبر تيليجرام</a>','<LiveButton href="https://t.me/etmam_cv_bot"><MessageCircle size={17}/>أكمل عبر تيليجرام</LiveButton>');
 return s;
});
edit("src/App.tsx",s=>s.replace('import {ThemeToggle} from "./theme/ThemeProvider";','import {ThemeToggle} from "./theme/ThemeProvider";\nimport {OTPField} from "./components/eldoraui/product-components";').replace(/<Field\s+label="رمز الدخول من البريد"\s+value=\{otp\}\s+onChange=\{setOtp\}\s+placeholder="رمز التحقق"\s*\/>/,'<OTPField value={otp} onChange={setOtp} disabled={busy}/>'));
for(const file of ["word-pull-up-text","blur-in-text"])edit("src/components/eldoraui/"+file+".tsx",s=>s.replace('initial={false}','initial={reduced?false:"hidden"}'));
console.log("Eldora components connected to product actions.");
