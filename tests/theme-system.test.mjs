import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const init=fs.readFileSync("public/theme-init.js","utf8");
function boot(saved,storageFails=false){
 const listeners={},dataset={},classes=new Set(),meta={},values=new Map(saved?[["elmam.theme",saved]]:[]);
 const button={textContent:"",setAttribute(k,v){this[k]=v}};
 const root={dataset,classList:{toggle(name,value){value?classes.add(name):classes.delete(name)}},style:{}};
 vm.runInNewContext(init,{document:{documentElement:root,querySelector:()=>meta,querySelectorAll:()=>[button],addEventListener:(n,fn)=>listeners[n]=fn},localStorage:{getItem:k=>{if(storageFails)throw Error("denied");return values.get(k)},setItem:(k,v)=>{if(storageFails)throw Error("denied");values.set(k,v)}},addEventListener:(n,fn)=>listeners[n]=fn});
 return {root,classes,meta,button,values,listeners};
}
test("brand theme boots light and respects a persisted navy dark theme",()=>{
 const light=boot();assert.equal(light.root.dataset.theme,"light");assert.equal(light.meta.content,"#F6F9FC");assert.ok(!light.classes.has("dark"));
 const dark=boot("dark");assert.equal(dark.root.dataset.theme,"dark");assert.ok(dark.classes.has("dark"));assert.equal(dark.meta.content,"#0B1F4B");
});
test("guide-page switching persists across reload, and storage denial does not prevent switching",()=>{
 for(const denied of [false,true]){const first=boot(undefined,denied);first.listeners.click({target:{closest:()=>true}});assert.equal(first.root.dataset.theme,"dark");assert.equal(first.button["aria-label"],"تفعيل الوضع الفاتح");if(!denied)assert.equal(boot(first.values.get("elmam.theme")).root.dataset.theme,"dark")}
});
test("theme surfaces meet normal text contrast in both themes",()=>{
 const css=fs.readFileSync("src/theme/theme-tokens.css","utf8");
 function lum(hex){return hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0)}
 function ratio(a,b){const l=[lum(a),lum(b)].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05)}
 for(const theme of ["dark","light"]){const block=css.match(new RegExp(':root\\[data-theme="'+theme+'"\\]\\{([\\s\\S]*?)\\}'))[1],tokens=Object.fromEntries([...block.matchAll(/--ui-([\w-]+):\s*(#[a-fA-F0-9]{6})/g)].map(x=>[x[1],x[2]]));
 for(const [fg,bg]of [["text","page"],["muted","surface"],["muted","surface-2"],["on-accent","accent"],["accent-text","page"]])assert.ok(ratio(tokens[fg],tokens[bg])>=4.5,theme+" "+fg+"/"+bg)}
});
test("the shared provider, both headers, public guides and real OTP are wired to the same theme system",()=>{
 const source=path=>fs.readFileSync(path,"utf8");
 assert.ok(source("src/main.tsx").includes("<ThemeProvider><App /></ThemeProvider>"));assert.equal((source("src/App.tsx").match(/<ThemeToggle\s*\/>/g)||[]).length,2);
 assert.ok(source("scripts/build-search-pages.mjs").includes('data-theme-toggle'));assert.ok(source("index.html").includes('src="/theme-init.js"'));
 const otp=source("src/components/eldoraui/product-components.tsx");assert.ok(otp.includes('autoComplete="one-time-code"'));assert.ok(otp.includes('value={value}'));assert.ok(!otp.includes("generateRandomDigits"));
});
