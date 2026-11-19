export const PATH_PADDING=26;
export const pathWave=(t:number)=>46+21*Math.sin(t*Math.PI*2.3+.55);
export function clampStep(index:number,count:number){
 return Math.max(0,Math.min(Math.max(0,count-1),Math.round(Number.isFinite(index)?index:0)));
}
export function pathX(progress:number,width:number,rtl:boolean){
 const t=Math.max(0,Math.min(1,progress));
 return PATH_PADDING+(rtl?1-t:t)*Math.max(1,width-PATH_PADDING*2);
}
export function stepAtX(x:number,width:number,count:number,rtl:boolean){
 const t=Math.max(0,Math.min(1,(x-PATH_PADDING)/Math.max(1,width-PATH_PADDING*2)));
 return (rtl?1-t:t)*Math.max(0,count-1);
}
