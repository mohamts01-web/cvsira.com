import policies from "./public-policies.json";
export function PolicyLinks() {
  return (
    <nav className="policy-links" aria-label="سياسات إلمام">
      {[["/terms","شروط الاستخدام"],["/privacy","الخصوصية"],["/refunds","الإلغاء والاسترداد"],["/contact","تواصل معنا"]].map(([href,label]) =>
        <a key={href} href={href} aria-current={typeof location !== "undefined" && location.pathname === href ? "page" : undefined}>{label}</a>)}
    </nav>
  );
}
function LinkedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(https:\/\/[^\s]+)/g).map((part, i) =>
        part.startsWith("https://") ? (
          <a key={i} href={part} target="_blank" rel="noreferrer">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
export default function LegalPage({ slug }: { slug: string }) {
  const page = policies.find((p) => p.slug === slug);
  return (
    <main className="container policy-page">
      <header className="policy-heading">
        <a href="/">إلمام / العودة للرئيسية ←</a>
        <span className="eyebrow">بوضوح وشفافية</span>
        <h1>{page?.title || "تواصل مع إلمام"}</h1>
        <p className="muted">آخر تحديث: 1 نوفمبر 2026</p>
      </header>
      <article className="policy-content">
      {page ? (
        page.paragraphs.map((p, i) => (
          <p key={i}>
            <LinkedText text={p} />
          </p>
        ))
      ) : (
        <>
          <p>
            للمساعدة في الاشتراك أو تفعيل الشراء أو المسودات، تواصل مع فريق
            إلمام عبر البريد:
          </p>
          <a className="primary" href="mailto:cvsira.sa@gmail.com">
            cvsira.sa@gmail.com
          </a>
          <p>
            يمكنك أيضًا التواصل مع الدعم عبر{" "}
            <a href="https://t.me/mohamdto21" target="_blank" rel="noreferrer">
              تيليجرام
            </a>
            . للاستفسار عن شراء باقة زد أو طلب استرداد، أرسل رقم طلبك في المتجر إلى الدعم.
          </p>
        </>
      )}
      <p>
        بريد الدعم: <a href="mailto:cvsira.sa@gmail.com">cvsira.sa@gmail.com</a>
      </p>
      {slug === "privacy" && <section id="gmail-data" aria-labelledby="gmail-privacy-heading">
        <h2 id="gmail-privacy-heading">إرسال طلب التوظيف عبر Gmail</h2>
        <p>عند توفر الربط واختيارك استخدامه، يطلب إلمام إذن إرسال البريد من حساب Google الذي تختاره. عند تأكيد الإرسال، يرسل متصفحك عنوان المستلم وعنوان الرسالة ونصها ومرفق السيرة إلى Gmail لتسليمها.</p>
        <p>يبقى رمز الإرسال في ذاكرة الصفحة. يسجّل إلمام حالة التقديم بعد تأكيد Gmail، وتبقى الرسالة ضمن حساب بريدك وفق إعداداته. يمكنك إزالة إذن التطبيق من <a href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">إعدادات حساب Google</a>.</p>
        <p>يخضع استخدام إلمام للمعلومات الواردة من Google لسياسة بيانات المستخدم لخدمات Google API، بما في ذلك متطلبات الاستخدام المحدود. <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">سياسة Google</a></p>
      </section>}
      </article>
      <PolicyLinks />
    </main>
  );
}
