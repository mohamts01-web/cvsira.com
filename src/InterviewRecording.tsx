import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";

const limit = 120_000;

export default function InterviewRecording() {
  const [state, setState] = useState<"idle" | "permission" | "recording" | "stopping">("idle");
  const [clip, setClip] = useState<{ url: string; seconds: number }>();
  const [message, setMessage] = useState("");
  const recording = useRef<MediaRecorder | undefined>(undefined);
  const playback = useRef("");
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    generation.current++;
    clearTimeout(timeout.current);
    const current = recording.current;
    if (current?.state === "recording") current.stop();
    current?.stream.getTracks().forEach(track => track.stop());
    if (playback.current) URL.revokeObjectURL(playback.current);
  }, []);

  function stop() {
    const current = recording.current;
    if (current?.state !== "recording") return;
    setState("stopping");
    current.stop();
  }

  async function start() {
    const request = ++generation.current;
    setState("permission");
    setMessage("");
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation.current !== request) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      const recorder = new MediaRecorder(stream);
      recording.current = recorder;
      const chunks: Blob[] = [];
      const started = performance.now();
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        clearTimeout(timeout.current);
        recorder.stream.getTracks().forEach(track => track.stop());
        if (generation.current !== request) return;
        recording.current = undefined;
        const audio = new Blob(chunks, { type: recorder.mimeType });
        if (audio.size) {
          if (playback.current) URL.revokeObjectURL(playback.current);
          playback.current = URL.createObjectURL(audio);
          setClip({ url: playback.current, seconds: Math.max(1, Math.round((performance.now() - started) / 1000)) });
        } else setMessage("لم يُحفظ صوت. جرّب التسجيل مرة أخرى.");
        setState("idle");
      };
      recorder.onerror = () => {
        if (generation.current !== request) return;
        generation.current++;
        clearTimeout(timeout.current);
        recorder.stream.getTracks().forEach(track => track.stop());
        recording.current = undefined;
        setMessage("تعذّر التسجيل. تأكد من الميكروفون ثم حاول مجددًا.");
        setState("idle");
      };
      recorder.start();
      setState("recording");
      timeout.current = setTimeout(stop, limit);
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop());
      if (generation.current !== request) return;
      recording.current = undefined;
      const denied = error instanceof DOMException && error.name === "NotAllowedError";
      setMessage(denied ? "اسمح باستخدام الميكروفون من إعدادات المتصفح، أو اكتب إجابتك." : "تعذّر تشغيل الميكروفون. بإمكانك كتابة إجابتك.");
      setState("idle");
    }
  }

  const supported = typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
  if (!supported) return <p>التسجيل الصوتي غير متاح في هذا المتصفح. بإمكانك كتابة إجابتك.</p>;
  return <section className="interview-recording" aria-label="تدريب صوتي">
    <p>سجّل إجابتك واستمع إليها. التسجيل يبقى في هذه الجلسة، ومدته القصوى دقيقتان.</p>
    <div className="interview-actions">
      {state === "recording" ?
        <button type="button" className="secondary" onClick={stop}><Square size={16} aria-hidden="true" /> أوقف التسجيل</button> :
        <button type="button" className="secondary" disabled={state !== "idle"} onClick={() => void start()}><Mic size={16} aria-hidden="true" /> {clip ? "سجّل مرة أخرى" : "سجّل إجابة صوتية"}</button>}
      {clip && state === "idle" && <button type="button" className="secondary" onClick={() => {
        URL.revokeObjectURL(clip.url);
        playback.current = "";
        setClip(undefined);
      }}><Trash2 size={16} aria-hidden="true" /> احذف التسجيل</button>}
    </div>
    {clip && state === "idle" && <div>
      <p>مدة الإجابة {clip.seconds} ثانية</p>
      <audio controls src={clip.url} aria-label="استمع إلى إجابتك" />
    </div>}
    <p aria-live="polite">{state === "recording" ? "جارٍ التسجيل…" : state === "permission" ? "بانتظار إذن الميكروفون…" : message}</p>
  </section>;
}
