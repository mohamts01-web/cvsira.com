// Design quotations only. Never use these client-side values to settle a payment.
export const creditPacks = [
  {id:"start",name:"بداية",points:15,amountMinor:1900,description:"جرّب أدواتك وجهّز أول فرصك."},
  {id:"advance",name:"تقدّم",points:50,amountMinor:4900,description:"مساحة لتخصيص سيرك والتحضير لعدة فرص.",popular:true},
  {id:"launch",name:"انطلق",points:120,amountMinor:9900,description:"رصيد أكبر لرحلة بحث نشطة ومتواصلة."},
];
const anchors=[...creditPacks.map(pack=>[pack.points,pack.amountMinor]),[500,34900],[1000,64900]];
export function customCreditQuote(points,discount=false){
  if(!Number.isInteger(points)||points<15||points>1000)throw Error("اختر عددًا صحيحًا من 15 إلى 1000 نقطة.");
  const upper=anchors.findIndex(([quantity])=>quantity>=points);
  const [endPoints,endPrice]=anchors[upper];
  const [startPoints,startPrice]=anchors[Math.max(0,upper-1)];
  const base=points===endPoints?endPrice:Math.round(startPrice+(endPrice-startPrice)*(points-startPoints)/(endPoints-startPoints));
  return {points,baseMinor:base,amountMinor:discount?Math.round(base*.8):base};
}
