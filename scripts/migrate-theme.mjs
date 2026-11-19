import fs from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const postcss=createRequire(require.resolve("vite"))("postcss");
const paths=["src/style.css","src/refinements.css","src/inline.css","src/billing.css","src/anchor/anchor-theme.css","src/anchor/anchor-surfaces.css"];
fs.mkdirSync("reference/before-theme",{recursive:true});let count=0;
function token(hex,prop,selector){
 let s=hex.slice(1);if(![3,4,6,8].includes(s.length))return hex;if(s.length<5)s=[...s].map(c=>c+c).join("");
 const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16),alpha=s.length===8?parseInt(s.slice(6,8),16)/255:1;
 const max=Math.max(r,g,b),min=Math.min(r,g,b),light=(max+min)/510,green=g>r*1.13&&g>b*.85&&max-min>20,red=r>g*1.4&&r>b*1.25;
 let name;const text=prop==="color"||prop==="fill"||prop==="stroke";
 if(text){name=green?"accent-text":red?"danger":(light>.22&&light<.79?"muted":"text");if(/\.primary|\.anchor-button|\.ai-send/.test(selector)&&light<.3)name="on-accent"}
 else if(/border|outline/.test(prop))name=green?"strong-border":"border";
 else if(/shadow/.test(prop))name="shadow";
 else {name=green?(light>.46?"accent":"accent-soft"):red?"danger-soft":light>.6?"surface":light<.075?"page":light<.13?"surface":light<.22?"surface-2":"surface-3";if(/^(html|body|:root)([\s,:]|$)/.test(selector)&&!green)name="page"}
 count++;const v="var(--ui-"+name+")";return alpha===1?v:"color-mix(in srgb,"+v+",transparent "+Math.round((1-alpha)*100)+"%)";
}
for(const path of paths){
 const css=fs.readFileSync(path,"utf8"),backup="reference/before-theme/"+path.replaceAll("/","__");if(!fs.existsSync(backup))fs.writeFileSync(backup,css);
 const tree=postcss.parse(css);tree.walkDecls(d=>{
 if(d.prop.startsWith("--")||["src","unicode-range"].includes(d.prop))return;const selector=d.parent.selector??"";
 if(/\.anchor-demo-paper|\.anchor-paper-contact|\.anchor-paper-skills|\.mini-template/.test(selector))return;
 d.value=d.value.replace(/#[\da-fA-F]{3,8}\b/g,h=>token(h,d.prop,selector)).replace(/\b(white|black)\b/g,h=>token(h==="white"?"#ffffff":"#000000",d.prop,selector));
 d.value=d.value.replace(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)/g,(_,r,g,b,a)=>token("#"+[r,g,b].map(x=>Number(x).toString(16).padStart(2,"0")).join("")+(a===undefined?"":Math.round(Number(a)*255).toString(16).padStart(2,"0")),d.prop,selector));
 if(d.prop==="color-scheme")d.value="var(--ui-color-scheme)"});fs.writeFileSync(path,tree.toString());
}
let main=fs.readFileSync("src/main.tsx","utf8").replace('import App from "./App";','import App from "./App";\nimport {ThemeProvider} from "./theme/ThemeProvider";').replace('createRoot(', 'import "./theme/theme-tokens.css";\ncreateRoot(').replace('<App />','<ThemeProvider><App /></ThemeProvider>');fs.writeFileSync("src/main.tsx",main);
let app=fs.readFileSync("src/App.tsx","utf8").replace('import Home from "./anchor/AnchorHome";','import Home from "./anchor/AnchorHome";\nimport {ThemeToggle} from "./theme/ThemeProvider";').replace('<div className="nav-actions">','<div className="nav-actions"><ThemeToggle/>').replace('<div className="editor-actions">','<div className="editor-actions"><ThemeToggle/>');fs.writeFileSync("src/App.tsx",app);
let html=fs.readFileSync("index.html","utf8").replace('<head>','<head>\n<script>try{var t=localStorage.getItem("elmam.theme")==="light"?"light":"dark";document.documentElement.dataset.theme=t;document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.classList.add("dark")}</script>').replace('content="#111014"','content="#000000"');fs.writeFileSync("index.html",html);
console.log("Migrated color declarations:",count);
