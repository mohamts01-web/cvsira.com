import { NumberTicker } from "../components/magicui/number-ticker";
import { AnimatedCircularProgressBar } from "../components/magicui/animated-circular-progress-bar";
import { ProductCard } from "../design-system/Experience";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpLeft,
  FileText,
  Sparkles,
  BriefcaseBusiness,
  Search,
  Plus,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import type { Account, Draft } from "../types";
import WorkspaceActivity from "../WorkspaceActivity";
import { workspaceServices } from "./WorkspaceNav";
import "./financial-dashboard.css";

type Props = {
  drafts: Draft[];
  account: Account | null;
  paid: boolean;
  onOpen: (id: string) => void;
  onStart: () => void;
  onImport: () => void;
  onAccount: () => void;
};
const number = (n: number) => n.toLocaleString("ar-SA");
const date = (s: string) =>
  new Date(s).toLocaleDateString("ar-SA", { dateStyle: "medium" });
export default function FinancialDashboard({
  drafts,
  account,
  paid,
  onOpen,
  onStart,
  onImport,
  onAccount,
}: Props) {
  const [query, setQuery] = useState("");
  const reduced = useReducedMotion();
  const membership = account?.membership;
  const remaining = membership?.aiRemaining ?? 0;
  const limit = membership?.aiLimit ?? 0;
  const used = membership?.aiUsed ?? 0;
  const sorted = [...drafts].sort(
    (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at),
  );
  const recent = sorted[0];
  const tailored = drafts.filter((d) => d.design.targetVacancy).length;
  const stats = [
    {
      label: "السير المحفوظة",
      value: drafts.length,
      detail: "من " + number(membership?.maxDrafts ?? 2) + " مسودات متاحة",
      icon: FileText,
    },
    {
      label: "رصيد المساعد",
      value: remaining,
      detail: "عملية متبقية في باقتك",
      icon: Sparkles,
    },
    {
      label: "سير مخصصة للوظائف",
      value: tailored,
      detail: "نسخ مرتبطة بفرص محددة",
      icon: BriefcaseBusiness,
    },
    {
      label: "نسخ معتمدة",
      value: drafts.filter((d) => d.approved_revision != null).length,
      detail: "مسودات لها إصدار معتمد",
      icon: CheckCircle2,
    },
  ];
  return (
    <section className="fin-dashboard" aria-label="لوحة إلمام المهنية">
      <header className="fin-heading">
        <div>
          <span className="fin-kicker">
            <span /> مساحتك المهنية
          </span>
          <h1>كل خطوة، أقرب لفرصتك.</h1>
          <p>سيرتك وأدواتك ورصيدك في نظرة واحدة.</p>
        </div>
        <div className="fin-actions">
          <button className="secondary" onClick={onImport}>
            <Upload size={16} />
            استيراد سيرة
          </button>
          <button className="primary" onClick={onStart}>
            <Plus size={17} />
            سيرة جديدة
          </button>
        </div>
      </header>
      <div className="fin-stats">
        {stats.map((item, index) => (
          <motion.article
            key={item.label}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div>
              <span>{item.label}</span>
              <item.icon size={19} />
            </div>
            <strong>
              <NumberTicker value={item.value} />
            </strong>
            <small>{item.detail}</small>
          </motion.article>
        ))}
      </div>
      <div className="fin-main-grid">
        <article className="fin-card fin-resume">
          <header>
            <h2>
              <FileText size={18} />
              مسارك يبدأ من سيرتك
            </h2>
            <a href="/documents#resume-drafts">
              المكتبة
              <ArrowUpLeft size={16} />
            </a>
          </header>
          {recent ? (
            <>
              <div className="fin-resume-body">
                <div className="fin-paper" aria-hidden="true">
                  <FileText size={27} />
                  <i />
                  <i />
                  <i />
                  <b />
                  <i />
                  <i />
                  <b />
                  <i />
                </div>
                <div>
                  <span className="fin-kicker">آخر مسودة عملت عليها</span>
                  <h3>{recent.title}</h3>
                  <p>
                    <Clock3 size={14} />
                    آخر تعديل {date(recent.updated_at)}
                  </p>
                  <span className="fin-tag">
                    {recent.content.language === "ar"
                      ? "العربية"
                      : "الإنجليزية"}
                  </span>
                  <span className="fin-tag">
                    {recent.design.targetVacancy ? "مخصصة لوظيفة" : "سيرة عامة"}
                  </span>
                </div>
              </div>
              <footer>
                <span>تابع العمل من آخر نقطة حفظتها.</span>
                <button className="primary" onClick={() => onOpen(recent.id)}>
                  {paid ? "أكمل التحرير" : "افتح السيرة"}
                  <ArrowLeft size={16} />
                </button>
              </footer>
            </>
          ) : (
            <div className="fin-blank">
              <FileText />
              <h3>ابدأ سيرتك الأولى</h3>
              <p>أضف بياناتك أو استورد سيرتك الموجودة.</p>
              <button className="primary" onClick={onStart}>
                إنشاء سيرة
              </button>
            </div>
          )}
        </article>
        <article className="fin-card fin-credit">
          <header>
            <h2>
              <Sparkles size={18} />
              استخدام المساعد
            </h2>
            <button className="text-btn" onClick={onAccount}>
              باقتي
              <ArrowUpLeft size={16} />
            </button>
          </header>
          <div
            className="ds-credit-gauge"
            role="img"
            aria-label={number(remaining) + " عملية متبقية من " + number(limit)}
          >
            <AnimatedCircularProgressBar
              value={remaining}
              max={limit}
              gaugePrimaryColor="var(--ui-accent)"
              gaugeSecondaryColor="var(--ui-surface-3)"
            />
            <div>
              <strong>
                <NumberTicker value={remaining} />
              </strong>
              <span>عملية متبقية</span>
            </div>
          </div>
          <div className="fin-credit-legend">
            <span>
              <i />
              متبقي <b>{number(remaining)}</b>
            </span>
            <span>
              مستخدم <b>{number(used)}</b>
            </span>
          </div>
          <p>
            {membership
              ? paid
                ? "الباقة فعّالة حتى " + date(membership.expires)
                : "انتهت مدة الباقة. يمكنك عرض سيرك المحفوظة."
              : "فعّل باقتك للاستفادة من المساعد."}
          </p>
          <a href="/assistant">
            افتح المساعد
            <ArrowLeft size={16} />
          </a>
        </article>
      </div>
      <section className="fin-card fin-tools">
        <header>
          <h2>أدواتك المهنية</h2>
          <a href="/tools">
            كل الأدوات
            <ArrowUpLeft size={16} />
          </a>
        </header>
        <div>
          {workspaceServices.slice(1).map((s) => (
            <ProductCard key={s.path}>
              <a href={s.path}>
                <span>
                  <s.icon size={21} />
                </span>
                <strong>{s.title}</strong>
                <p>{s.description}</p>
                <small>
                  افتح الخدمة
                  <ArrowLeft size={14} />
                </small>
                <ArrowUpLeft size={15} />
              </a>
            </ProductCard>
          ))}
        </div>
      </section>
      <section className="fin-card fin-library">
        <header>
          <h2>مكتبة السير</h2>
          <label>
            <Search size={17} />
            <input
              aria-label="البحث في السير"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم السيرة…"
            />
          </label>
        </header>
        <div className="fin-table">
          <table>
            <thead>
              <tr>
                <th>السيرة الذاتية</th>
                <th>اللغة</th>
                <th>آخر تعديل</th>
                <th>فتح</th>
              </tr>
            </thead>
            <tbody>
              {sorted
                .filter((d) =>
                  d.title.toLowerCase().includes(query.toLowerCase()),
                )
                .map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="fin-file-icon">
                        <FileText size={18} />
                      </span>
                      <button onClick={() => onOpen(d.id)}>{d.title}</button>
                    </td>
                    <td>
                      {d.content.language === "ar" ? "العربية" : "الإنجليزية"}
                    </td>
                    <td>{date(d.updated_at)}</td>
                    <td>
                      <button
                        className="icon-btn"
                        aria-label={"فتح " + d.title}
                        onClick={() => onOpen(d.id)}
                      >
                        <ArrowUpLeft size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!sorted.some((d) =>
          d.title.toLowerCase().includes(query.toLowerCase()),
        ) && <p className="fin-blank">لا توجد سير تطابق البحث.</p>}
        <footer>
          <span>{number(drafts.length)} مسودة محفوظة</span>
          <a href="/documents#resume-drafts">
            إدارة المسودات
            <ArrowLeft size={15} />
          </a>
        </footer>
      </section>
      <WorkspaceActivity />
    </section>
  );
}
