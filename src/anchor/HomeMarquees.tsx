import {Sparkles} from "lucide-react";
import logos from "./saudi-employers.json";

const benefits=["ابنِ سيرتك","خصّصها للوظيفة","استعد للمقابلة","نظّم تقديماتك","جهّز ملف LinkedIn","عربي وإنجليزي","اقتراحات تراجعها","أكمل عبر تيليجرام"];

export default function HomeMarquees(){
  return <section className="home-marquees" aria-label="جهات من سوق العمل السعودي ومزايا إلمام">
    <div className="employer-marquee marquee-window" aria-label="شعارات جهات حكومية ومحلية"><div className="marquee-track logo-track">{[0,1].map(copy=><div className="marquee-group" key={copy} aria-hidden={copy===1?true:undefined}>{logos.map(logo=><div className="employer-logo" key={logo.src} title={logo.name}><img src={logo.src} alt={copy===0?logo.name:""} width={104} height={46} decoding="async"/></div>)}</div>)}</div></div>
    <div className="benefit-marquee marquee-window" aria-label="مزايا إلمام CV"><div className="marquee-track benefit-track">{[0,1].map(copy=><div className="marquee-group" key={copy} aria-hidden={copy===1?true:undefined}>{benefits.map(benefit=><span className="marquee-benefit" key={benefit}><Sparkles size={15} aria-hidden="true"/><span dir="rtl">{benefit}</span></span>)}</div>)}</div></div>
  </section>;
}
