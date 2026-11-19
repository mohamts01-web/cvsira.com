"use client"
import { BentoCard } from "./bento-card";

import type React from "react"

import { Zap as Lightning, Globe, ShieldCheck, Cpu, ChartLine as ChartLineUp, GitBranch, Expand as ArrowsOutCardinal } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function AnimatedCard({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "left" | "right"
  className?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setIsVisible(true), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) observer.observe(ref.current)
    return () => {observer.disconnect(); clearTimeout(timer)}
  }, [delay])

  const translateClass = {
    up: "translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
  }[direction]

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${translateClass}`
      }`}
    >
      {children}
    </div>
  )
}

export function BentoGrid() {
  return (
    <section id="product" className="py-24">
      {/* Section header */}
      <div className="mx-auto max-w-[1400px] px-2.5 sm:px-6 lg:px-12">
        <AnimatedCard delay={0} direction="up">
          <div className="mb-16 max-w-2xl">
            <span className="text-sm font-medium text-[var(--color-keppel-400)] uppercase tracking-wider">
              أدوات لمسارك المهني
            </span>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-baltic-sea-100)] md:text-4xl">
              من سيرتك إلى فرصتك القادمة
            </h2>
            <p className="mt-4 text-lg text-[var(--color-baltic-sea-400)]">
              محرر واضح ومساعد ذكي وأدوات استعداد، في مساحة تتكامل معك خطوة بخطوة.
            </p>
          </div>
        </AnimatedCard>

        {/* Staggered bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[180px]">
          {/* Primary feature - tall left card */}
          <AnimatedCard delay={100} direction="left" className="min-h-[280px] md:min-h-0 md:col-span-4 md:row-span-2">
            <BentoCard className="flex flex-col h-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-keppel-900)]">
                <Lightning className="h-6 w-6 text-[var(--color-keppel-400)]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--color-baltic-sea-100)]">سيرة توضّح قيمتك</h3>
              <p className="mt-2 text-sm text-[var(--color-baltic-sea-400)] flex-1">
                أنشئ سيرة من البداية أو استورد نسختك الحالية، ثم عدّل كل قسم وشاهد النتيجة مباشرة.
              </p>
              <div className="mt-auto pt-6 flex items-end gap-1">
                {[47, 52, 43, 48, 51, 45, 49, 44, 50, 46].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-[var(--color-keppel-700)]"
                    style={{ height: `${val}px` }}
                  />
                ))}
              </div>
            </BentoCard>
          </AnimatedCard>

          {/* Top right - vertical wide */}
          <AnimatedCard delay={200} direction="up" className="min-h-[160px] md:min-h-0 md:col-span-5">
            <BentoCard className="flex flex-col h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-baltic-sea-800)]">
                <Globe className="h-5 w-5 text-[var(--color-keppel-400)]" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--color-baltic-sea-100)]">باللغة التي تناسب فرصتك</h3>
              <p className="mt-1 text-sm text-[var(--color-baltic-sea-400)]">
                العربية والإنجليزية، مع اتجاه صحيح وتنسيق واضح في المحرر والتصدير.
              </p>
            </BentoCard>
          </AnimatedCard>

          {/* Top far right - square with accent */}
          <AnimatedCard
            delay={300}
            direction="right"
            className="hidden md:block min-h-[160px] md:min-h-0 md:col-span-3"
          >
            <BentoCard className="flex flex-col items-center justify-center text-center h-full">
              <div className="text-4xl font-bold text-[var(--color-keppel-400)]">PDF + Word</div>
              <div className="mt-1 text-sm text-[var(--color-baltic-sea-500)]">نسخ قابلة للمشاركة</div>
            </BentoCard>
          </AnimatedCard>

          {/* Middle row - medium card */}
          <AnimatedCard delay={400} direction="left" className="min-h-[160px] md:min-h-0 md:col-span-3">
            <BentoCard className="flex flex-col h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-baltic-sea-800)]">
                <ShieldCheck className="h-5 w-5 text-[var(--color-keppel-400)]" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--color-baltic-sea-100)]">بياناتك تحت سيطرتك</h3>
              <p className="mt-1 text-sm text-[var(--color-baltic-sea-400)]">
                اقتراحات للمراجعة قبل التطبيق. لا خبرات مختلقة.
              </p>
            </BentoCard>
          </AnimatedCard>

          {/* Middle - larger with AI badge */}
          <AnimatedCard delay={500} direction="up" className="min-h-[160px] md:min-h-0 md:col-span-5">
            <BentoCard className="flex flex-col h-full">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-baltic-sea-800)]">
                  <Cpu className="h-5 w-5 text-[var(--color-keppel-400)]" />
                </div>
                <span className="text-xs font-medium text-[var(--color-keppel-400)] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-keppel-950)] border border-[var(--color-keppel-800)]">
                  AI
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--color-baltic-sea-100)]">
                مساعد يفهم سياق سيرتك
              </h3>
              <p className="mt-1 text-sm text-[var(--color-baltic-sea-400)]">
                حسّن الملخص، ترجم المحتوى أو خصّص نسخة لوظيفة، مع رصيد واضح لكل عملية ناجحة.
              </p>
            </BentoCard>
          </AnimatedCard>

          {/* Bottom section - spanning full width with 3 equal cards */}
          <AnimatedCard delay={600} direction="up" className="min-h-[160px] md:min-h-0 md:col-span-4">
            <BentoCard className="flex flex-col h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-baltic-sea-800)]">
                <ChartLineUp className="h-5 w-5 text-[var(--color-keppel-400)]" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--color-baltic-sea-100)]">
                تابع تقديماتك
              </h3>
              <p className="mt-1 text-sm text-[var(--color-baltic-sea-400)]">
                اجمع الفرص وحالات التقديم في مساحة واحدة بدل الملاحظات المتفرقة.
              </p>
            </BentoCard>
          </AnimatedCard>

          <AnimatedCard delay={700} direction="up" className="min-h-[160px] md:min-h-0 md:col-span-4">
            <BentoCard className="flex flex-col h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-baltic-sea-800)]">
                <GitBranch className="h-5 w-5 text-[var(--color-keppel-400)]" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--color-baltic-sea-100)]">
                استعد للمقابلة
              </h3>
              <p className="mt-1 text-sm text-[var(--color-baltic-sea-400)]">
                تدرّب على أسئلة مرتبطة بالوظيفة، وراجع إجاباتك للتحسين.
              </p>
            </BentoCard>
          </AnimatedCard>

          <AnimatedCard delay={800} direction="up" className="min-h-[160px] md:min-h-0 md:col-span-4">
            <BentoCard className="flex flex-col h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-baltic-sea-800)]">
                <ArrowsOutCardinal className="h-5 w-5 text-[var(--color-keppel-400)]" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--color-baltic-sea-100)]">حضور مهني متكامل</h3>
              <p className="mt-1 text-sm text-[var(--color-baltic-sea-400)]">
                جهّز ملف LinkedIn، واكتب رسالة تقديم وأرفق السيرة بعد مراجعتها.
              </p>
            </BentoCard>
          </AnimatedCard>
        </div>
      </div>
    </section>
  )
}
