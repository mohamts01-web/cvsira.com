import {
  BrowserFrame,
  LiveButton,
} from "../components/eldoraui/product-components";
import { Grid } from "../components/eldoraui/grid";
import Terminal from "../components/eldoraui/terminal";
import { useState } from "react";
import { ArrowLeft, Check, MessageCircle, Layers } from "lucide-react";
import { MagicHero, ProductCard, Reveal } from "../design-system/Experience";
import { workspaceServices } from "./WorkspaceNav";
import { HowItWorks } from "./how-it-works";
import { FAQ } from "./faq";
import { PolicyLinks } from "../LegalPage";
const templates = [
  { id: "classic", name: "الأساسي", desc: "ترتيب واضح يضع خبرتك أولًا." },
  { id: "modern", name: "الحديث", desc: "مساحة متوازنة وشخصية مهنية." },
  { id: "compact", name: "المدمج", desc: "معلومات أكثر في مساحة مرتبة." },
];
export default function AnchorHome({
  onStart,
  onTry,
  onPlans,
}: {
  onStart: () => void;
  onTry: (template?: string) => void;
  onPlans: () => void;
}) {
  const [template, setTemplate] = useState(0),
    [demo, setDemo] = useState(0);
  const steps = ["اختر الوظيفة", "خصّص سيرتك", "راجع الرسالة"];
  return (
    <main className="anchor-home">
      <MagicHero onStart={onStart} onTry={() => onTry()} />
      <section className="anchor-output-strip" aria-label="مساحتك مترابطة">
        {[
          ["سيرة ذاتية", "PDF / Word"],
          ["لغتان", "العربية / English"],
          ["اقتراحات ذكية", "بقرارك أنت"],
          ["الموقع والبوت", "حساب واحد"],
        ].map(([a, b]) => (
          <div key={a}>
            <span className="anchor-status-dot" />
            <strong>{a}</strong>
            <small>{b}</small>
          </div>
        ))}
      </section>
      <section className="ds-home-services anchor-section">
        <div className="anchor-section-heading">
          <div>
            <span className="ds-eyebrow">من السيرة إلى الفرصة</span>
            <h2>كل أدوات مسارك، معك.</h2>
          </div>
          <p>اختر خطوتك، وأكمل من مساحتك المهنية.</p>
        </div>
        <div className="ds-service-grid">
          {workspaceServices.map((s) => (
            <Reveal key={s.path}>
              <ProductCard>
                <a className="ds-service-content" href={s.path}>
                  <span className="ds-icon">
                    <s.icon size={25} />
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <span className="ds-service-link">
                    استكشف الخدمة
                    <ArrowLeft size={16} />
                  </span>
                </a>
              </ProductCard>
            </Reveal>
          ))}
        </div>
      </section>
      <HowItWorks />
      <section className="anchor-section" id="templates">
        <div className="anchor-section-heading">
          <div>
            <span className="anchor-eyebrow">تصميم يساعد قصتك تظهر</span>
            <h2>نفس الخبرة. حضور يليق بك.</h2>
          </div>
          <p>
            ثلاثة قوالب تدعم العربية والإنجليزية.
            <br />
            عدّل التفاصيل وشاهد النتيجة قبل التنزيل.
          </p>
        </div>
        <BrowserFrame>
          <div className="anchor-template-stage">
            <div className="anchor-template-controls">
              <span className="anchor-eyebrow">اختر طريقتك</span>
              {templates.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(i)}
                  aria-pressed={template === i}
                >
                  <Layers size={20} />
                  <span>
                    <strong>{t.name}</strong>
                    <small>{t.desc}</small>
                  </span>
                  <span className="anchor-template-number">0{i + 1}</span>
                </button>
              ))}
              <button
                className="primary"
                onClick={() => onTry(templates[template].id)}
              >
                جرّب هذا القالب
                <ArrowLeft size={17} />
              </button>
            </div>
            <div className={"anchor-paper-stage variant-" + template}>
              <div className="anchor-paper-glow" />
              <article
                className="anchor-demo-paper"
                key={template}
                aria-label={"نموذج توضيحي للقالب " + templates[template].name}
              >
                <div className="anchor-demo-paper-heading">
                  <span>
                    إلمام <small>CV</small>
                  </span>
                  <small>نموذج توضيحي</small>
                </div>
                <h3>اسمك الكامل</h3>
                <p>أخصائي عمليات · الرياض</p>
                <div className="anchor-paper-contact">
                  name@example.com · 05XXXXXXXX
                </div>
                {[
                  "الملخص المهني",
                  "الخبرات العملية",
                  "التعليم",
                  "المهارات",
                ].map((name, i) => (
                  <section key={name}>
                    <h4>{name}</h4>
                    {i === 3 ? (
                      <div className="anchor-paper-skills">
                        <span>التواصل</span>
                        <span>إدارة الوقت</span>
                        <span>حل المشكلات</span>
                      </div>
                    ) : (
                      <>
                        <i />
                        <i />
                        <i />
                      </>
                    )}
                  </section>
                ))}
              </article>
              <span className="anchor-floating-note">
                <Check size={16} />
                معاينة قبل التنزيل
              </span>
            </div>
          </div>
        </BrowserFrame>
      </section>
      <section className="anchor-section anchor-application">
        <div>
          <span className="anchor-eyebrow">من الفرصة إلى التقديم</span>
          <h2>
            كل خطوة تكمل
            <br />
            <em>اللي قبلها.</em>
          </h2>
          <p>
            اختر فرصة من إلمام وظائف، راجع نسخة مخصصة، وجهّز رسالة التقديم
            ومرفقها. أنت تؤكد قبل الإرسال.
          </p>
          <a className="secondary" href="/tools/jobs">
            استكشف الوظائف
            <ArrowLeft size={18} />
          </a>
        </div>
        <div className="anchor-demo-terminal">
          <div className="anchor-terminal-top">
            <span />
            <span />
            <span />
            <small>رحلة تقديمك · مثال توضيحي</small>
          </div>
          <nav aria-label="معاينة خطوات التقديم">
            {steps.map((s, i) => (
              <button
                key={s}
                onClick={() => setDemo(i)}
                aria-pressed={demo === i}
              >
                0{i + 1} {s}
              </button>
            ))}
          </nav>
          <div className="anchor-demo-output">
            <Terminal
              key={demo}
              command={steps[demo]}
              steps={[
                {
                  text:
                    demo === 0
                      ? "راجع متطلبات الوظيفة واختر سيرتك."
                      : demo === 1
                        ? "اقتراحات مبنية على خبرتك الفعلية."
                        : "راجع المستلم والرسالة والمرفق قبل الإرسال.",
                },
                { text: "مثال توضيحي · القرار لك.", bold: true },
              ]}
              showLocalhost={false}
            />
          </div>
          <a href="/tools/jobs">
            ابدأ من وظيفة
            <ArrowLeft size={16} />
          </a>
        </div>
      </section>
      <section className="anchor-section anchor-facts">
        <div>
          <span className="anchor-eyebrow">مساحة واحدة بدل التشتت</span>
          <h2>
            أدوات تخدم مسارك.
            <br />
            وتبقى بيدك.
          </h2>
        </div>
        <div>
          {[
            ["تعديل مباشر", "اكتب وعدّل داخل سيرتك، مع حفظ النسخة لحسابك."],
            ["ذكاء بمراجعتك", "تعرف ماذا تغيّر وتقرر ما تريد تطبيقه."],
            [
              "تنقّل بين الموقع والبوت",
              "اربط تيليجرام وأكمل باستخدام نفس المسودات والرصيد.",
            ],
          ].map(([a, b]) => (
            <article key={a}>
              <Check size={20} />
              <div>
                <h3>{a}</h3>
                <p>{b}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="anchor-section anchor-plan-teaser">
        <div>
          <span className="anchor-eyebrow">ابدأ باللي تحتاجه</span>
          <h2>جرّب أولًا. طوّر بثقة.</h2>
          <p>أنشئ سيرتك وعاينها، واطّلع على الباقة وصلاحياتها قبل الشراء.</p>
        </div>
        <button className="primary large" onClick={onPlans}>
          استعرض الباقات
          <ArrowLeft size={18} />
        </button>
      </section>
      <FAQ />
      <section className="anchor-final">
        <div className="anchor-final-grid" aria-hidden="true">
          <Grid rows={5} columns={12} height="h-full" showPlusIcons={true} />
        </div>
        <span className="anchor-eyebrow">خطوتك القادمة تستاهل</span>
        <h2>
          خل خبرتك
          <br />
          <em>تحكي عنك.</em>
        </h2>
        <p>ابدأ من سيرتك، وكمل مسارك من مكان واحد.</p>
        <button className="primary large" onClick={onStart}>
          أنشئ سيرتك الآن
          <ArrowLeft size={18} />
        </button>
        <LiveButton href="https://t.me/etmam_cv_bot">
          <MessageCircle size={17} />
          أكمل عبر تيليجرام
        </LiveButton>
      </section>
      <footer className="anchor-footer">
        <a href="/" className="anchor-wordmark">
          إلمام <span>CV</span>
        </a>
        <p>مساحتك المهنية. من السيرة إلى الفرصة.</p>
        <PolicyLinks />
        <span>© {new Date().getFullYear()} إلمام CV</span>
      </footer>
    </main>
  );
}
