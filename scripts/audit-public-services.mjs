import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { services } from "../shared/services.mjs";

const folder=process.env.ELMAM_BUILD_DIR || "dist";
const origin="https://cv.cvsira.com";
const read=path=>readFile(new URL(`../${folder}/${path}`,import.meta.url),"utf8");
const sitemap=await read("sitemap.xml");
const paths=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]).pathname);
assert.equal(new Set(paths).size,paths.length,"Duplicate sitemap entries");
const titles=new Set();
let structured=0,links=0;
for(const path of paths){
  const html=await read(path==="/"?"_home.html":path.slice(1)+"index.html");
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title&&!titles.has(title),"Missing or duplicate title: "+path);titles.add(title);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length,1,"One heading: "+path);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length,1,"One canonical: "+path);
  assert.ok(html.includes(`href="${origin}${path}"`),"Canonical mismatch: "+path);
  for(const name of ["og:title","og:description","og:image","og:url"])
    assert.equal([...html.matchAll(new RegExp(`property="${name}"`,"g"))].length,1,name+": "+path);
  assert.equal([...html.matchAll(/name="description"/g)].length,1,"Description: "+path);
  assert.ok(html.includes('lang="ar" dir="rtl"'),"Arabic document: "+path);
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    JSON.parse(match[1]);structured++;
  }
  for(const match of html.matchAll(/href="(\/(?:about|services|ats-resume|graduate-resume|english-resume|tailor-resume-to-job|job-interview-preparation)[^"#?]*)"/g)){
    assert.ok(paths.includes(match[1]),"Broken public link: "+match[1]);links++;
  }
  assert.ok(!/<(?:input|textarea)[^>]*(?:email|name="name")/.test(html),"No private form data in public pages");
}
const index=await read("index.html");
assert.match(index,/<meta name="robots" content="noindex,follow">/);
assert.equal(paths.filter(path=>path.startsWith("/services/")).length,services.length+1);
assert.ok(!paths.some(path=>/^\/(documents|profile|editor|tools|assistant|for-job|plans)/.test(path)),"Private/transaction routes excluded");
console.log(JSON.stringify({publicPages:paths.length,uniqueTitles:titles.size,validStructuredData:structured,verifiedPublicLinks:links,privateAppNoindex:true}));
