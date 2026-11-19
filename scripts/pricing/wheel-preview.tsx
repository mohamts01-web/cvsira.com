import React from "react";
import {createRoot} from "react-dom/client";
import ToolWheel from "./components/ui/tool-wheel";

const glyphs = [
  "M5 2h9l5 5v15H5V2Zm8 2v5h4M8 12h8v2H8zm0 4h6v2H8z",
  "M3 5h18v14H3V5Zm2 2 7 6 7-6H5Z",
  "M12 1 15 9l8 3-8 3-3 8-3-8-8-3 8-3Z",
  "M4 3h16v18H4V3Zm3 4v2h10V7zm0 4v2h10v-2zm0 4v2h6v-2Z",
  "M2 20V9h5v11zm7 0V4h5v16zm7 0V1h5v19z",
  "M3 5h18v15H3V5Zm2 4v2h14V9z",
  "M4 12l5 5L20 6l2 2L9 21 2 14z",
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 4v6l4 3-1 2-5-4V6z",
  "M3 4h18v13H8l-5 4V4Zm4 4v2h10V8zm0 4v2h7v-2Z",
];
const names = [
  ["بيانات التواصل","الاسم والمسمّى","المدينة","التعليم","الخبرات","المهارات","اختر القالب","راجع السيرة","تنزيل PDF"],
  ["إتقان Excel","جداول العمل","تقارير Excel","مطابقة الفواتير","مراجعة المصروفات","دليل المطابقة","إعداد التقارير","تحليل الفروقات","أبرز النتيجة"],
  ["جهّز السيرة","راجع الملف","اختر النسخة","حالة التقديم","راجع الرسالة","تابع الطلب","موعد المقابلة","تدرّب على الأسئلة","راجع إجاباتك"],
];
const items = names.map(set=>set.map((label,index)=>({label,path:glyphs[index]})));
const colors = ["#8eafff","#76f5db","#a5ffb5"];
const host = document.getElementById("cin-wheel-root")!;
const label = document.getElementById("cin-wheel-label")!;
const root = createRoot(host);
window.renderElmamWheel = (plan,active)=>{
  const palette=colors[plan];
  label.textContent=items[plan][active].label;
  root.render(<ToolWheel key={plan} items={items[plan]} active={active} onActiveChange={window.chooseElmamWheelItem}
    autoplay={false} eyebrow="" title="عجلة أدوات إلمام" subtitle="اختر أداة من العجلة أو استخدم مفاتيح الأسهم"
    background="#091b37" surface="#17385e" color="#e8f7ff" mutedColor="#aec9ea"
    accent={palette} signal={palette} lineColor="#446589" frame={false}
    markPath={glyphs[0]} markViewBox="0 0 24 24" font="inherit" uiFont="inherit" style={{minHeight:0}}/>);
};
window.hideElmamWheel = ()=>root.render(null);
