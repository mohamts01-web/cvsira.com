import { mkdir, readFile, writeFile } from "node:fs/promises";
import { services, homeTitle, homeDescription, aboutElmam } from "../shared/services.mjs";

const origin = "https://cv.cvsira.com";
const outputFolder=process.env.ELMAM_BUILD_DIR||"dist";
if(!/^[a-z0-9-]+$/.test(outputFolder))throw Error("Invalid build output");
const output=(path)=>new URL("../"+outputFolder+"/"+path,import.meta.url);
const site = "إلمام";
const pages = [
  {
    slug: "ats-resume",
    title: "إنشاء سيرة ذاتية متوافقة مع ATS",
    description: "تعرّف على طريقة ترتيب السيرة الذاتية لأنظمة تتبع المتقدمين وابدأ بناءها بالعربية أو الإنجليزية.",
    sections: [
      ["ابدأ بالمسمى المطلوب", "اذكر المسمى الذي تستهدفه في الملخص بصياغة تعكس مستواك، ثم اربط المهارات المذكورة في الإعلان بخبرتك الفعلية."],
      ["اجعل الأقسام سهلة القراءة", "رتّب بيانات التواصل، والملخص، والخبرات، والتعليم، والمهارات تحت عناوين واضحة. استخدم نصًا قابلًا للتحديد عند تنزيل الملف."],
      ["مثال على وصف مسؤولية", "أعددت تقارير المخزون الأسبوعية باستخدام Excel، وتابعت الفروقات مع فريق المستودع. غيّر المثال حتى يعكس الأدوات والمهام التي مارستها فعليًا."],
    ],
  },
  {
    slug: "graduate-resume",
    title: "نموذج سيرة ذاتية لحديثي التخرج",
    description: "رتّب مؤهلك ومشاريعك وتدريبك في سيرة ذاتية تناسب أول وظيفة في السعودية.",
    sections: [
      ["ابدأ بالمؤهل والتخصص", "اعرض الدرجة العلمية والتخصص والجهة وسنة التخرج. أضف التدريب التعاوني أو تمهير تحت عنوان يوضح نوع التجربة إذا سبق أن شاركت فيه."],
      ["صف دورك في مشروع", "اذكر المشكلة التي عالجها المشروع، ودورك فيه، والأدوات التي استخدمتها والنتيجة التي تستطيع شرحها في المقابلة."],
      ["مثال لملخص مهني", "حديث تخرج في المحاسبة. أعددت ضمن مشروع التخرج نموذجًا لمتابعة المصروفات باستخدام Excel، وأبحث عن فرصة أولى في المحاسبة المالية."],
    ],
  },
  {
    slug: "english-resume",
    title: "نموذج سيرة ذاتية بالإنجليزية",
    description: "أمثلة عملية لكتابة سيرة إنجليزية بمصطلحات مهنية واضحة تناسب التقديم على الوظائف.",
    sections: [
      ["استخدم عناوين واضحة", "ابدأ ببيانات التواصل ثم Professional Summary وExperience وEducation وSkills. استخدم التهجئة التي تعتمدها لاسمك، وراجع الأسماء الإنجليزية للجهات والشهادات."],
      ["ابدأ نقاط الخبرة بفعل", "يفيد استخدام أفعال مثل Prepared وCoordinated وAnalyzed عندما تعبّر عن عملك. اذكر الأداة والسياق عندما يساعدان على فهم مسؤوليتك."],
      ["مثال لصياغة خبرة", "Prepared weekly inventory reports in Excel and coordinated with the warehouse team to investigate discrepancies."],
    ],
  },
  {
    slug: "tailor-resume-to-job",
    title: "كيف تخصّص سيرتك الذاتية لإعلان وظيفة؟",
    description: "حوّل إعلان الوظيفة إلى قائمة مراجعة لسيرتك، مع مثال عملي من دور محاسبي ونصائح لتجهيز النسخة النهائية.",
    action: ["/tools/jobs", "خصّص سيرتك لرقم إعلان من إلمام وظائف"],
    sections: [
      ["استخرج المتطلبات قبل التحرير", "ابدأ بالمسمّى ثم دوّن المهام والمهارات والشروط كما وردت في الإعلان. في إعلان لمحاسب مبتدئ مثلًا، قد تكون مطابقة الفواتير مهمة يومية، وإتقان Excel مهارة مطلوبة، والبكالوريوس في المحاسبة شرطًا للمؤهل. في الإعلان المجمّع، خذ متطلبات المسمّى الذي اخترته."],
      ["ضع دليلًا أمام كل متطلب", "ابحث في سيرتك عن الخبرة أو التدريب أو المشروع الذي يثبت كل نقطة. إذا ذكرت السيرة «ساعدت في الأعمال المالية» وكنت قد طابقت الفواتير أثناء التدريب فعلًا، يمكن صياغتها «طابقت فواتير المشتريات مع سجل المصروفات في Excel، ورفعت الفروقات للمشرف». استخدم تفاصيل تستطيع شرحها عند سؤالك عنها."],
      ["راجع الفجوات قبل إضافة الكلمات", "إذا طلب الإعلان خبرة في نظام محاسبي معيّن وسبق لك استخدام نظام مختلف، اذكر النظام الذي استخدمته والمهام التي نفذتها فيه. إذا كان الشرط جوهريًا ولا يغطيه ملفك، راجع شروط الجهة قبل أن تقرر التقديم."],
      ["احفظ نسخة لكل وظيفة وراجع ملفها", "احتفظ بالسيرة العامة، وسمِّ النسخة الجديدة بالمسمّى أو برقم الإعلان لتجدها لاحقًا. راجع التواريخ والأسماء والمهارات التي تغيرت، وتأكد من أن ملف PDF قابل للقراءة وتحديد النص، وأنه يطابق الصيغة المطلوبة في الإعلان."],
    ],
  },
  {
    slug: "job-interview-preparation",
    title: "كيف تستعد لمقابلة عمل من وصف الوظيفة؟",
    description: "جهّز أمثلة من خبرتك وأسئلة للمقابلة بالاستناد إلى مسؤوليات الإعلان، سواء كنت حديث تخرج أو صاحب خبرة.",
    action: ["/tools/interviews", "افتح تدريب المقابلات"],
    sections: [
      ["اختر ثلاث مسؤوليات من الإعلان", "ضع لكل مسؤولية سؤالًا يمكن أن يطرحه المحاور. لو كان الدور يشمل متابعة شكاوى العملاء، جرّب الإجابة عن سؤال: كيف تتعامل مع شكوى عاجلة عندما تحتاج إلى معلومة من قسم آخر؟ حدّد ما ستفعله أولًا وكيف ستتابع وصول الحل للعميل."],
      ["جهّز مثالًا يتضح فيه دورك", "صف الموقف والمهمة، ثم اذكر ما نفذته أنت وما حدث بعد ذلك. يمكنك استخدام مشروع جامعي أو تدريب أو تجربة تطوعية. حضّر مثالًا على موقف لم يسر كما توقعت واذكر ما غيّرته بعده."],
      ["تدرّب مع النسخة التي قدّمتها", "افتح سيرتك المخصصة وتدرّب على شرح نقاطها بصوتك. راجع المصطلحات الإنجليزية إذا قد تكون المقابلة ثنائية اللغة. جهّز سؤالًا عن أولويات الدور، مثل ما الذي يتوقعه الفريق من الموظف في الشهر الأول."],
    ],
  },
];

const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const serviceUrl = (service) => `/services/${service.slug}/`;
const links = services.map(service => `<a href="${serviceUrl(service)}">${escape(service.title)}</a>`).join("");
const social = (title, description, path) => `<meta property="og:type" content="website"><meta property="og:site_name" content="${site}"><meta property="og:locale" content="ar_SA"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}/og-image.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${origin}/og-image.png">`;
const jsonld = (data) => `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
const shell = ({title, description, path, body, graph=[]}) => `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/theme-init.js"></script><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin}${path}">${social(title,description,path)}<link rel="stylesheet" href="/search-guide.css"><link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/fonts/brand/fonts.css"><link rel="stylesheet" href="/brand-global.css"><link rel="stylesheet" href="/service-pages.css"><link rel="icon" href="/favicon.svg">${jsonld({"@context":"https://schema.org","@graph":graph})}</head><body class="public-services"><header><a href="/" aria-label="إلمام"><img class="brand-footer-light" src="/elmam-brand.svg" alt="إلمام" width="104" height="50"><img class="brand-footer-dark" src="/assets/logo-dark-bg.svg" alt="إلمام" width="104" height="50"></a><nav aria-label="التنقل الرئيسي"><a href="/profile">الملف الشخصي</a><a href="/start">ابدأ سيرتك</a><a href="/documents">مساحتي</a><button type="button" data-theme-toggle aria-label="تفعيل الوضع الداكن">الوضع الداكن</button></nav></header><main>${body}</main><footer><p>إلمام — مساحتك المهنية.</p><nav aria-label="روابط الخدمة"><a href="/privacy">الخصوصية</a><a href="/terms">الشروط</a><a href="/contact">التواصل والدعم</a><a href="/services/">جميع الخدمات</a></nav></footer></body></html>`;
const emit = async(path, html) => {
  const directory=output(path.slice(1));
  await mkdir(directory,{recursive:true});
  await writeFile(new URL("index.html",directory),html);
};
const cards = services.map(service => `<article class="public-service-card"><span class="service-tag">${escape(service.tag)}</span><h2><a href="${serviceUrl(service)}">${escape(service.title)}</a></h2><p>${escape(service.description)}</p><a class="service-more" href="${serviceUrl(service)}">تعرّف على الخدمة ←</a></article>`).join("");
await emit("/about/",shell({
  title:"عن إلمام — مساحتك المهنية",description:aboutElmam,path:"/about/",
  graph:[{"@type":"AboutPage",name:"عن إلمام",url:origin+"/about/",description:aboutElmam,mainEntity:{"@type":"Organization",name:site,alternateName:"Elmam",url:origin+"/"}}],
  body:`<nav aria-label="مسار التنقل"><a href="/">الرئيسية</a><span aria-current="page">عن إلمام</span></nav><p class="service-tag">مساحتك المهنية</p><h1>حنا إلمام، مساحتك لخطوتك المهنية الجاية.</h1><p class="service-lead">${escape(aboutElmam)}</p><a class="action" href="/start">ابدأ خطوتك الجاية ←</a><section><h2>من الفرصة إلى الاستعداد</h2><p>ابدأ من إعلان وظيفة أو من سيرتك الحالية. رتّب خبراتك، خصّص النسخة التي تناسب الفرصة، وجهّز رسالة التقديم وتدرّب للمقابلة. تراجع اقتراحات المساعد وتختار ما تعتمد منها.</p></section><section><h2>أدواتك معك، والقرار لك</h2><p>تجهيز السيرة، المساعد، محتوى LinkedIn، التدريب وسجل التقديمات أدوات تساعدك تنظم خطواتك. نوضح حدود كل خدمة وطريقة استخدامها داخل صفحتها، دون ضمان توظيف أو اختلاق خبرات لم تذكرها.</p><nav aria-label="خدمات إلمام">${links}</nav></section><section><h2>إلمام وظائف وإلمام</h2><p>تكتشف الإعلانات في إلمام وظائف، وتكمل تجهيز سيرتك واستعدادك في مساحتك المهنية بإلمام. استخدم رقم الإعلان للوصول إلى الفرصة المقصودة وتخصيص سيرتك لها.</p><a href="https://jobs.cvsira.com/">استكشف إلمام وظائف</a></section>`,
}));
await emit("/services/",shell({
  title:"خدمات إلمام | السيرة والتقديم والمقابلات",description:homeDescription,path:"/services/",
  graph:[{"@type":"CollectionPage",name:"خدمات إلمام",url:origin+"/services/",mainEntity:{"@type":"ItemList",itemListElement:services.map((service,index)=>({"@type":"ListItem",position:index+1,name:service.title,url:origin+serviceUrl(service)}))}}],
  body:`<nav aria-label="مسار التنقل"><a href="/">الرئيسية</a><span aria-current="page">الخدمات</span></nav><p class="service-tag">ابدأ من الخطوة التي تحتاجها</p><h1>سيرتك واستعدادك للوظيفة، في مكان واحد.</h1><p class="service-lead">جهّز سيرتك، خصّصها لفرصة، نظّم تقديماتك وتدرّب للمقابلة. اختر خدمة لتعرف خطواتها ومخرجاتها قبل البدء.</p><a class="action" href="/start">ابدأ سيرتك ←</a><div class="public-service-grid">${cards}</div><section><h2>ما الذي تحتاجه الآن؟</h2><ul><li>تبدأ مسارك؟ أنشئ السيرة من تعليمك ومشاريعك وتدريبك.</li><li>وجدت وظيفة؟ خصّص نسخة من خبرتك الفعلية لمتطلبات الإعلان.</li><li>عندك مقابلة؟ تدرّب على شرح دورك والأمثلة التي تثبته.</li></ul><p>تخضع أدوات الحفظ والتوليد والتنزيل لصلاحيات حسابك الحالية. تظهر تكلفة أي طلب ذكي قبل تشغيله.</p></section>`,
}));
for(const service of services){
  const path=serviceUrl(service);
  await emit(path,shell({title:service.title+" | إلمام",description:service.description,path,
    graph:[{"@type":"Service",name:service.title,description:service.description,url:origin+path,provider:{"@type":"Organization",name:site,url:origin+"/"}},{"@type":"BreadcrumbList",itemListElement:[{name:"الرئيسية",item:origin+"/"},{name:"الخدمات",item:origin+"/services/"},{name:service.title,item:origin+path}].map((item,index)=>({"@type":"ListItem",position:index+1,...item}))}],
    body:`<nav aria-label="مسار التنقل"><a href="/">الرئيسية</a><a href="/services/">الخدمات</a><span aria-current="page">${escape(service.title)}</span></nav><p class="service-tag">${escape(service.tag)}</p><h1>${escape(service.title)}</h1><p class="service-lead">${escape(service.description)}</p><a class="action" href="${service.action}">${escape(service.cta)} ←</a><div class="service-result"><h2>ماذا تحصل عليه؟</h2><p>${escape(service.output)}</p></div><section><h2>هل تناسبك هذه الخدمة؟</h2><p>${escape(service.audience)}</p></section><section><h2>كيف تستخدمها؟</h2><ol class="service-steps">${service.steps.map(step=>`<li>${escape(step)}</li>`).join("")}</ol></section><section><h2>مثال يساعدك تبدأ</h2><p>${escape(service.example)}</p><p class="service-note">${escape(service.limit)}</p></section><section><h2>أسئلة عن الخدمة</h2>${service.faq.map(([q,a])=>`<details><summary>${escape(q)}</summary><p>${escape(a)}</p></details>`).join("")}<p>تخضع المزايا لصلاحيات حسابك الحالية، وتظهر تكلفة الطلب قبل تشغيله.</p></section><a class="action" href="${service.action}">${escape(service.cta)} ←</a><a href="${service.guide}">اقرأ الدليل المرتبط بالخدمة</a><section><h2>أكمل رحلتك</h2><nav aria-label="خدمات أخرى">${services.filter(item=>item!==service).map(item=>`<a href="${serviceUrl(item)}">${escape(item.title)}</a>`).join("")}</nav></section>`,
  }));
}

for (const page of pages) {
  const directory = output(`${page.slug}/`);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.html", directory), `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="/theme-init.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title} | ${site}</title><meta name="description" content="${page.description}">
<link rel="canonical" href="${origin}/${page.slug}/"><link rel="stylesheet" href="/search-guide.css"><link rel="stylesheet" href="/theme.css">
<link rel="stylesheet" href="/design-guide.css"><link rel="stylesheet" href="/fonts/brand/fonts.css"><link rel="stylesheet" href="/brand-global.css"><link rel="stylesheet" href="/service-pages.css"><link rel="icon" href="/favicon.svg">
${social(page.title+" | "+site,page.description,"/"+page.slug+"/")}
${jsonld({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{name:"الرئيسية",item:origin+"/"},{name:page.title,item:origin+"/"+page.slug+"/"}].map((item,index)=>({"@type":"ListItem",position:index+1,...item}))})}</head>
<body class="public-services public-guide"><header><a href="/" aria-label="إلمام"><img class="brand-footer-light" src="/elmam-brand.svg" alt="إلمام" width="210" height="101"><img class="brand-footer-dark" src="/assets/logo-dark-bg.svg" alt="إلمام" width="210" height="101"></a><a href="/profile">الملف الشخصي</a><a href="/documents">مساحتي</a><button type="button" data-theme-toggle aria-label="تفعيل الوضع الفاتح">الوضع الفاتح</button></header>
<main><p>أدلة السيرة الذاتية</p><h1>${page.title}</h1><p>${page.description}</p>
${page.sections.map(([heading, copy]) => `<section><h2>${heading}</h2><p>${copy}</p></section>`).join("\n")}
<a class="action" href="${page.action?.[0] ?? "/start"}">${page.action?.[1] ?? "أنشئ سيرتك الذاتية"} ←</a>
<nav aria-label="أدلة أخرى">${pages.filter(other => other !== page).map(other => `<a href="/${other.slug}/">${other.title}</a>`).join("")}</nav><section><h2>خدمات تساعدك تطبق</h2><nav aria-label="خدمات إلمام">${links}</nav></section>
</main></body></html>`);
}

const index = output("index.html");
const app = await readFile(index, "utf8");
const noindex = '<meta name="robots" content="noindex,follow">';
const appWithoutNoindex = app.replace(noindex, "");
await writeFile(index, appWithoutNoindex.replace("</head>", noindex + "</head>"));
const homeMetadata = `<style>.public-home-fallback{max-width:72rem;margin:auto;padding:clamp(24px,5vw,64px);font-family:"IBM Plex Sans Arabic",sans-serif;line-height:1.9;color:var(--brand-navy-fixed,#0B1F4B)}.public-home-fallback h1{font-size:clamp(28px,5vw,52px);line-height:1.5;text-wrap:balance}.public-home-fallback nav{display:flex;flex-wrap:wrap;gap:16px 24px;margin-block:24px}.public-home-fallback a{color:var(--brand-blue-fixed,#1F5BFF);min-height:44px;display:inline-flex;align-items:center}</style><link rel="canonical" href="${origin}/">
${social(homeTitle,homeDescription,"/")}
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: site, alternateName: "Elmam", url: origin + "/" })}</script>`;
const home = appWithoutNoindex.replace(/<meta (?:property="og:image"|name="twitter:(?:card|image)")[^>]*>/g, "").replace("</head>", homeMetadata + "</head>").replace('<div id="root"></div>', `<div id="root">
<main class="public-home-fallback"><h1>فرصتك الجاية، خلّك جاهز لها.</h1>
<p>${homeDescription}</p>
<a href="/start">ابدأ خطوتك الجاية</a>
<p>${escape(aboutElmam)}</p><a href="/about/">عن إلمام</a>
<h2>أدواتك من السيرة إلى المقابلة</h2><nav aria-label="خدمات إلمام">${links}</nav>
<nav aria-label="أدلة السيرة الذاتية">${pages.map(page => `<a href="/${page.slug}/">${page.title}</a>`).join("")}</nav>
</main></div>`);
await writeFile(output("_home.html"), home);
await writeFile(output("sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", "about/", "services/", ...services.map(service=>"services/"+service.slug+"/"), ...pages.map(page => page.slug + "/")].map(path => `<url><loc>${origin}/${path}</loc></url>`).join("\n")}
</urlset>`);
