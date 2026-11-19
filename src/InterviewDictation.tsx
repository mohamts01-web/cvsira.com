import { useEffect, useRef, useState } from "react";

type SpeechSession = {
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechSession;
  webkitSpeechRecognition?: new () => SpeechSession;
};

export default function InterviewDictation({ append }: { append: (words: string) => void }) {
  const browser = window as SpeechWindow;
  const Engine = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  const current = useRef<SpeechSession | null>(null);
  const [language, setLanguage] = useState("ar-SA");
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => () => {
    const session = current.current;
    current.current = null;
    session?.abort();
  }, []);
  if (!Engine) return null;

  function dictate() {
    if (!Engine || current.current) return;
    const session = new Engine();
    current.current = session;
    session.lang = language;
    session.onresult = event => {
      if (current.current !== session) return;
      const words = event.results[0]?.[0]?.transcript.trim();
      if (words) {
        append(words);
        setNotice("راجع الكلمات المضافة إلى إجابتك قبل التقييم.");
      }
    };
    session.onerror = event => {
      if (current.current === session) setNotice(event.error === "not-allowed"
        ? "اسمح للمتصفح باستخدام الميكروفون لتبدأ الإملاء."
        : "تعذّر فهم الصوت. حاول الإملاء مجددًا أو اكتب إجابتك.");
    };
    session.onend = () => {
      if (current.current !== session) return;
      current.current = null;
      setListening(false);
    };
    try {
      setNotice("");
      session.start();
      setListening(true);
    } catch {
      current.current = null;
      setNotice("تعذّر بدء الإملاء. يمكنك كتابة إجابتك.");
    }
  }

  return <details><summary>أملِ إجابتك صوتيًا</summary>
    <p>يحوّل المتصفح كلامك إلى نص داخل خانة الإجابة، وقد يرسل الصوت إلى مزوّد الإملاء. يمكنك مراجعة النص وتعديله.</p>
    <label>لغة الإملاء <select value={language} disabled={listening} onChange={e => setLanguage(e.target.value)}>
      <option value="ar-SA">العربية</option><option value="en-US">English</option>
    </select></label>
    <button className="secondary" type="button" onClick={() => listening ? current.current?.stop() : dictate()}>
      {listening ? "إنهاء الإملاء" : "ابدأ الإملاء"}
    </button>
    <p aria-live="polite">{listening ? "تحدث الآن…" : notice}</p>
  </details>;
}
