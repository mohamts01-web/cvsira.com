import { mkdir, readFile, writeFile } from "node:fs/promises";

const origin = "https://cv.cvsira.com";
const outputFolder=process.env.ELMAM_BUILD_DIR||"dist";
if(!/^[a-z0-9-]+$/.test(outputFolder))throw Error("Invalid build output");
const output=(path)=>new URL("../"+outputFolder+"/"+path,import.meta.url);
const site = "إلمام CV";
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
    action: ["/#tailoring-demo", "خصّص سيرتك لرقم إعلان من إلمام وظائف"],
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
    action: ["/documents#interview-library", "افتح تدريب المقابلات"],
    sections: [
      ["اختر ثلاث مسؤوليات من الإعلان", "ضع لكل مسؤولية سؤالًا يمكن أن يطرحه المحاور. لو كان الدور يشمل متابعة شكاوى العملاء، جرّب الإجابة عن سؤال: كيف تتعامل مع شكوى عاجلة عندما تحتاج إلى معلومة من قسم آخر؟ حدّد ما ستفعله أولًا وكيف ستتابع وصول الحل للعميل."],
      ["جهّز مثالًا يتضح فيه دورك", "صف الموقف والمهمة، ثم اذكر ما نفذته أنت وما حدث بعد ذلك. يمكنك استخدام مشروع جامعي أو تدريب أو تجربة تطوعية. حضّر مثالًا على موقف لم يسر كما توقعت واذكر ما غيّرته بعده."],
      ["تدرّب مع النسخة التي قدّمتها", "افتح سيرتك المخصصة وتدرّب على شرح نقاطها بصوتك. راجع المصطلحات الإنجليزية إذا قد تكون المقابلة ثنائية اللغة. جهّز سؤالًا عن أولويات الدور، مثل ما الذي يتوقعه الفريق من الموظف في الشهر الأول."],
    ],
  },
];

for (const page of pages) {
  const directory = output(`${page.slug}/`);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.html", directory), `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="/theme-init.js"></script>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title} | ${site}</title><meta name="description" content="${page.description}">
<link rel="canonical" href="${origin}/${page.slug}/"><link rel="stylesheet" href="/search-guide.css"><link rel="stylesheet" href="/theme.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;900&amp;display=swap">
<meta property="og:title" content="${page.title} | ${site}"><meta property="og:description" content="${page.description}">
<meta property="og:url" content="${origin}/${page.slug}/"></head>
<body><header><a href="/" aria-label="إلمام CV"><img src="/elmam-brand.svg" alt="إلمام" width="210" height="101"></a><a href="/plans">الباقة</a><button type="button" data-theme-toggle aria-label="تفعيل الوضع الفاتح">الوضع الفاتح</button></header>
<main><p>أدلة السيرة الذاتية</p><h1>${page.title}</h1><p>${page.description}</p>
${page.sections.map(([heading, copy]) => `<section><h2>${heading}</h2><p>${copy}</p></section>`).join("\n")}
<a class="action" href="${page.action?.[0] ?? "/start"}">${page.action?.[1] ?? "أنشئ سيرتك الذاتية"} ←</a>
<nav aria-label="أدلة أخرى">${pages.filter(other => other !== page).map(other => `<a href="/${other.slug}/">${other.title}</a>`).join("")}</nav>
</main></body></html>`);
}

const index = output("index.html");
const app = await readFile(index, "utf8");
const noindex = '<meta name="robots" content="noindex,follow">';
const appWithoutNoindex = app.replace(noindex, "");
await writeFile(index, appWithoutNoindex.replace("</head>", noindex + "</head>"));
const homeMetadata = `<link rel="canonical" href="${origin}/">
<meta property="og:type" content="website"><meta property="og:site_name" content="${site}">
<meta property="og:title" content="إنشاء سيرة ذاتية ATS بالعربية والإنجليزية | ${site}">
<meta property="og:url" content="${origin}/">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: site, alternateName: "Elmam CV", url: origin + "/" })}</script>`;
const home = appWithoutNoindex.replace("</head>", homeMetadata + "</head>").replace('<div id="root"></div>', `<div id="root">
<main><h1>أنشئ سيرتك الذاتية بالعربية أو الإنجليزية</h1>
<p>خصّص سيرتك للوظيفة التي تستهدفها، ونظّم خبراتك في قالب واضح لأنظمة ATS. ابدأ وعاين سيرتك مجانًا.</p>
<a href="/start">ابدأ سيرتك</a>
<nav aria-label="أدلة السيرة الذاتية">${pages.map(page => `<a href="/${page.slug}/">${page.title}</a>`).join("")}</nav>
</main></div>`);
await writeFile(output("_home.html"), home);
await writeFile(output("sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", ...pages.map(page => page.slug + "/")].map(path => `<url><loc>${origin}/${path}</loc></url>`).join("\n")}
</urlset>`);
