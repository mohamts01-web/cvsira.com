"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown as CaretDown } from "lucide-react"

const FAQS = [{"question":"هل أستطيع التجربة قبل الشراء؟","answer":"نعم. أدخل بياناتك وشاهد معاينة السيرة دون تسجيل. الحفظ الدائم وأدوات الذكاء الاصطناعي والتنزيل حسب صلاحيات الباقة."},{"question":"هل تدعم السيرة العربية والإنجليزية؟","answer":"نعم. القوالب تدعم اللغتين واتجاه النص المناسب. راجع الترجمة قبل اعتمادها."},{"question":"هل أحتاج سيرة مختلفة لكل وظيفة؟","answer":"تقدر تخصّص نسخة بناءً على متطلبات الوظيفة وخبراتك الفعلية. لا نضيف مهارات أو إنجازات غير موجودة لديك."},{"question":"هل المساعد يغيّر سيرتي تلقائيًا؟","answer":"تظهر الاقتراحات للمراجعة أولًا. تختار تطبيقها أو الاحتفاظ بمحتواك، وتظهر تكلفة العملية قبل التنفيذ."},{"question":"هل أقدر أكمل من تيليجرام؟","answer":"نعم، بعد ربط حسابك من مساحتك. الموقع والبوت يشتركان في المسودات والباقة ورصيد الذكاء الاصطناعي."},{"question":"هل تضمنون قبول السيرة أو التوظيف؟","answer":"نساعدك في الوضوح والتنظيم والاستعداد، دون ضمان اجتياز كل أنظمة الفرز أو الحصول على وظيفة."}]

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
  delay,
  isVisible,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
  delay: number
  isVisible: boolean
}) {
  return (
    <div
      className={`border-b border-[var(--color-baltic-sea-800)] transition-all duration-500 ${
        isVisible ? "opacity-100 translate-x-0" : `opacity-0 ${delay % 2 === 0 ? "-translate-x-8" : "translate-x-8"}`
      }`}
      style={{ transitionDelay: `${delay * 75 + 200}ms` }}
    >
      <button aria-expanded={isOpen} onClick={onClick} className="w-full flex items-center justify-between py-5 text-start group">
        <span className="font-medium text-[var(--color-baltic-sea-200)] group-hover:text-[var(--color-keppel-400)] transition-colors">
          {question}
        </span>
        <CaretDown
         
          className={`h-5 w-5 text-[var(--color-baltic-sea-500)] group-hover:text-[var(--color-keppel-400)] transition-all duration-300 ${isOpen ? "rotate-180 text-[var(--color-keppel-400)]" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[var(--color-baltic-sea-400)] leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-24 border-t border-[var(--color-baltic-sea-900)] overflow-hidden">
      <div className="mx-auto max-w-[800px] px-2.5 sm:px-6 lg:px-12">
        <div
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"}`}
        >
          <span className="text-sm font-medium text-[var(--color-keppel-400)] uppercase tracking-wider">قبل البداية</span>
          <h2 className="mt-3 text-3xl font-bold text-[var(--color-baltic-sea-100)] md:text-4xl">
            أسئلة تساعدك تبدأ
          </h2>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              delay={i}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
