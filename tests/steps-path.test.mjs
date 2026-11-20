import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import Module,{createRequire} from "node:module";
import {resolve} from "node:path";
import ts from "typescript";
import {buildSync} from "esbuild";
const require=createRequire(resolve("package.json")),React=require("react"),{renderToStaticMarkup}=require("react-dom/server");
const geometry={};vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/components/ui/steps-path-geometry.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:geometry});
const code=buildSync({entryPoints:["src/components/ui/cd-steps-path.tsx"],bundle:true,platform:"node",format:"cjs",packages:"external",jsx:"automatic",write:false}).outputFiles[0].text;
const compiled=new Module(resolve("steps-path.render.cjs"));compiled.filename=resolve("steps-path.render.cjs");compiled.paths=Module._nodeModulePaths(process.cwd());compiled._compile(code,compiled.filename);
const {StepsPath}=compiled.exports;
const steps=[{id:"one",title:"ابدأ بسيرتك",body:"بياناتك كما تكتبها."},{id:"two",title:"راجع اقتراحك",body:"القرار لك قبل الاعتماد."},{id:"three",title:"نزّل السيرة",body:"نسختك جاهزة."}];
test("RTL route mirrors its LTR counterpart and pointer coordinates map back to each step after resize",()=>{
 for(const width of [220,320,520,740])for(const rtl of [true,false])for(let i=0;i<5;i++){
  const x=geometry.pathX(i/4,width,rtl);
  assert.ok(Math.abs(geometry.stepAtX(x,width,5,rtl)-i)<.000001);
  assert.ok(Math.abs(geometry.pathX(i/4,width,true)+geometry.pathX(i/4,width,false)-width)<.000001);
 }
 assert.ok(geometry.pathX(0,320,true)>geometry.pathX(1,320,true));
});
test("step range is safe for empty, single, invalid and out-of-bounds values",()=>{
 for(const value of [-20,0,1,9,NaN,Infinity])assert.equal(geometry.clampStep(value,0),0);
 assert.equal(geometry.clampStep(9,1),0);assert.equal(geometry.clampStep(9,3),2);
 assert.equal(geometry.stepAtX(-100,320,3,false),0);assert.equal(geometry.stepAtX(1000,320,3,true),0);
 assert.equal(geometry.stepAtX(100,320,1,true),0);
});
test("component renders Arabic controls, a correctly clamped slider and one exposed active card",()=>{
 const html=renderToStaticMarkup(React.createElement(StepsPath,{steps,defaultStep:99,theme:"light"}));
 assert.ok(html.includes('dir="rtl"'));assert.ok(html.includes('aria-valuenow="3"'));assert.ok(html.includes('aria-valuemax="3"'));
 for(const text of ["الخطوة السابقة","خطوة الرحلة","من البداية"])assert.ok(html.includes(text),text);
 assert.equal((html.match(/aria-roledescription="بطاقة خطوة"/g)||[]).length,3);
 assert.doesNotMatch(html,/data-theme="burgundy"|Step [0-9]|How it works/);
 assert.equal(renderToStaticMarkup(React.createElement(StepsPath,{steps:[]})),"");
});
