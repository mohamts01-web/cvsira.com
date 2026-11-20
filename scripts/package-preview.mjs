import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from "node:fs";
import {emptyResume,defaultDesign} from "../shared/model.mjs";
const folder="dist-netlify-review/";
const original=readFileSync("scripts/preview/fixtures.txt","utf8");
const data=original.slice(original.indexOf("const id ="),original.indexOf("const server ="));
const fixtures=data.replace("let copy,","const createdId = \"44444444-4444-4444-8444-444444444444\"; let copy,").replace("const serve = process.argv.includes('--serve');","const serve = true;").replaceAll(/process\.argv\.includes\('[^']+'\)/g,"false").replace('expires_in:3600','expires_in:86400').replace('+3600','+86400');
const handler=original.slice(original.indexOf("  const path = new URL"),original.indexOf("  if(path.startsWith('/mock/')) return json"));
const core=handler.replace("res.end(JSON.stringify(value));","return res.end(JSON.stringify(value));").replace('const pdf=serve?await readFile(\'private/pdf-local-check/ar-classic-short.pdf\'):\'%PDF-fixture\';','const pdf=await (await fetch("/sample-cv.pdf")).arrayBuffer();').replace('assert.equal(input.draftId,copyId);','if(![copyId,id].includes(input.draftId)) return json({error:"السيرة غير موجودة"},404);');
const instructions=core
 .replace("maxDrafts:fullDrafts?1:2","maxDrafts:demoDraftLimit")
 .replace("if(![copyId,id].includes(input.draftId))","if(!(await serveDraftRequest(new Request(self.location.origin), \"/mock/drafts/\"+input.draftId)).ok)");
const names=["emptyResume","defaultDesign"];
const bases=[emptyResume(),defaultDesign()];
const declarations=names.map((n,i)=>"const "+n+" = ()=>structuredClone("+JSON.stringify(bases[i])+");").join("\n");
const worker=declarations+"\n"+fixtures+`
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(url.origin!==location.origin || !/^\\/(?:mock\\/|__jobs-preview\\/|api\\/discover-jobs|fixture\\.pdf)/.test(url.pathname))return;
 event.respondWith(serveRequest(event.request).catch(()=>Response.json({error:"تعذّر إكمال العملية في المعاينة."},{status:500})));
});
const demoDraftLimit=5;
const draftCacheName="elmam-review-drafts-v1";
const draftCacheKey=new URL("/preview-draft-state",self.location.origin).href;
let draftQueue=Promise.resolve();
function serveDraftRequest(request,path){
  const result=draftQueue.then(async()=>{
    const cache=await caches.open(draftCacheName);
    const stored=await cache.match(draftCacheKey);
    const drafts=stored ? await stored.json() : structuredClone([copy,source].filter(Boolean));
    const prefix="/mock/drafts/";
    const draftId=path.startsWith(prefix)?path.slice(prefix.length).split("/")[0]:"";
    const draft=drafts.find(item=>item.id===draftId);
    const save=async(value)=>{
      await cache.put(draftCacheKey,Response.json(drafts));
      return Response.json(value);
    };
    const error=(message,status)=>Response.json({error:message},{status});
    if(path==="/mock/drafts"){
      if(request.method==="GET")return Response.json(drafts);
      if(request.method!=="POST")return error("العملية غير متاحة.",405);
      if(drafts.length>=demoDraftLimit)return error("وصلت إلى الحد المتاح من المسودات.",409);
      const input=await request.json();
      const used=new Set(drafts.map(item=>item.id));
      const nextId=used.has(createdId) ? crypto.randomUUID() : createdId;
      const next={id:nextId,title:input.title,content:input.content,design:input.design,
        revision:1,approved_revision:null,updated_at:new Date().toISOString()};
      drafts.unshift(next);
      return save(next);
    }
    if(!draft)return error("السيرة غير موجودة.",404);
    if(path===prefix+draftId && request.method==="GET")return Response.json(draft);
    if(path===prefix+draftId && request.method==="DELETE"){
      drafts.splice(drafts.indexOf(draft),1);
      return save({deleted:true});
    }
    if(path===prefix+draftId+"/approve" && request.method==="POST"){
      const input=await request.json();
      if(input.revision!==draft.revision)return error("تغيّرت المسودة. أعد تحميلها.",409);
      draft.approved_revision=draft.revision;
      return save(draft);
    }
    if(path===prefix+draftId && request.method==="PUT"){
      const input=await request.json();
      if(input.revision!==draft.revision)return error("تغيّرت المسودة. أعد تحميلها.",409);
      Object.assign(draft,{title:input.title,content:input.content,design:input.design,
        revision:draft.revision+1,updated_at:new Date().toISOString()});
      return save(draft);
    }
    return error("العملية غير متاحة في المعاينة.",405);
  });
  draftQueue=result.catch(()=>{});
  return result;
}
function serveInterviewRequest(request,path){
  const result=interviewQueue.then(async()=>{
    const cache=await caches.open("elmam-review-interviews-v1");
    const stored=await cache.match(interviewCacheKey);
    const entries=stored ? await stored.json() : [...interviews.values()];
    if(path==="/mock/interviews") return Response.json(entries);
    const vacancyId=Number(path.split("/").at(-1));
    const index=entries.findIndex(entry=>entry.vacancy.id===vacancyId);
    const previous=entries[index];
    if(request.method==="GET")return Response.json(previous??null);
    if(request.method!=="PUT")return Response.json({error:"العملية غير متاحة."},{status:405});
    const input=await request.json();
    if(input.vacancy.id!==vacancyId)return Response.json({error:"الجلسة غير صالحة."},{status:400});
    if(input.revision!==(previous?.revision??0))return Response.json({error:"تغيّرت الجلسة. أعد تحميلها."},{status:409});
    const entry={...input,revision:input.revision+1,updated:new Date().toISOString()};
    if(index<0)entries.push(entry);else entries[index]=entry;
    await cache.put(interviewCacheKey,Response.json(entries));
    return Response.json(entry);
  });
  interviewQueue=result.catch(()=>{});
  return result;
}
const interviewCacheKey=new URL("/preview-interview-state",self.location.origin).href;
let interviewQueue=Promise.resolve();
const reviewJobs=new Map();
async function previewReviewRequest(request,path){
  if(path==="/mock/jobs" && request.method==="POST"){
    const input=await request.clone().json();
    if(!["import","improve"].includes(input.kind))return null;
    const draftPath="/mock/drafts/"+input.draftId;
    const response=await serveDraftRequest(new Request(self.location.origin),draftPath);
    if(!response.ok)return response;
    const draft=await response.json();
    if(input.revision!==draft.revision)return Response.json({error:"تغيّرت المسودة."},{status:409});
    const imported=input.kind==="import";
    const example=(input.text??"").split(/\\r?\\n/).map(row=>row.trim()).filter(Boolean);
    const content=imported ? {...draft.content,name:example[0]??"اسم تجريبي",
      summary:"لدي خبرة في إعداد تقارير المصروفات ومراجعة الفواتير.",
      skills:["Excel","إعداد التقارير"]}
      : {...draft.content,summary:after};
    const review=imported ? {message:"هذا مثال لنتيجة الاستخراج في المعاينة. راجع الحقول قبل اعتمادها.",suggestions:[]} : undefined;
    const job={id:crypto.randomUUID(),state:"completed",kind:input.kind,base_revision:draft.revision,result:{content,review,appliedKeys:[]}};
    reviewJobs.set(job.id,{job,draftPath,currentRevision:draft.revision});
    return Response.json(job);
  }
  const match=path.match(/^\\/mock\\/jobs\\/([a-f0-9-]+)(\\/apply)?$/i);
  const entry=match && reviewJobs.get(match[1]);
  if(!entry)return null;
  if(!match[2] && request.method==="GET")return Response.json(entry.job);
  if(!match[2] || request.method!=="POST")return null;
  const input=await request.json();
  const response=await serveDraftRequest(new Request(self.location.origin),entry.draftPath);
  if(!response.ok)return response;
  const draft=await response.json();
  if(entry.currentRevision!==draft.revision || input.revision!==entry.job.base_revision)
    return Response.json({error:"تغيّرت المسودة."},{status:409});
  const keys=(input.keys??[]).filter(key=>Object.hasOwn(entry.job.result.content,key));
  const content={...draft.content};
  for(const key of keys)content[key]=entry.job.result.content[key];
  const saved=await serveDraftRequest(new Request(self.location.origin,{method:"PUT",body:JSON.stringify({...draft,content})}),entry.draftPath);
  if(saved.ok){
    const updated=await saved.clone().json();
    entry.currentRevision=updated.revision;
    entry.job.result.appliedKeys=[...new Set([...entry.job.result.appliedKeys,...keys])];
  }
  return saved;
}
async function serveRequest(request) {
  const requestPath=new URL(request.url).pathname;
  if(requestPath.startsWith("/mock/jobs")){
    const review=await previewReviewRequest(request,requestPath);
    if(review)return review;
  }
  if(requestPath==="/mock/interviews" || requestPath.startsWith("/mock/interviews/"))
    return serveInterviewRequest(request,requestPath);
  if(requestPath==="/mock/drafts" || requestPath.startsWith("/mock/drafts/"))
    return serveDraftRequest(request,requestPath);
  const req={url:request.url,method:request.method,
    async *[Symbol.asyncIterator](){if(request.body)yield await request.text();}};
  let status=200,headers={},response;
  const res={writeHead(code,values){status=code;headers=values;},end(value){response=new Response(value,{status,headers});return response;}};
`+instructions+'\n  return response ?? Response.json({error:"هذه العملية غير متاحة في المعاينة."},{status:404});\n}\n';
writeFileSync(folder+"preview-worker.js",worker);
let html=readFileSync(folder+"index.html","utf8");
const script=html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if(!script || !script[1].startsWith("/assets/"))throw Error("Run a clean Vite build before packaging");
const seed=JSON.stringify({user:{id:"33333333-3333-4333-8333-333333333333",email:"tester@example.invalid"},access_token:"fixture-access-token",refresh_token:"fixture-refresh-token",token_type:"bearer",expires_in:86400,expires_at:Math.floor(Date.now()/1000)+86400});
const bootstrap=`
localStorage.setItem("sb-elmam-preview-auth-token",JSON.stringify({...${seed},expires_at:Math.floor(Date.now()/1000)+86400}));
await navigator.serviceWorker.register("/preview-worker.js");
await navigator.serviceWorker.ready;
if(!navigator.serviceWorker.controller) await new Promise(resolve=>navigator.serviceWorker.addEventListener("controllerchange",resolve,{once:true}));
await import("${script[1]}");
`;
html=html.replace(script[0],'<script type="module" src="/preview-bootstrap.js"></script>').replace("<head>",'<head><meta name="robots" content="noindex,nofollow">');
writeFileSync(folder+"preview-bootstrap.js",bootstrap);
writeFileSync(folder+"index.html",html);
const home=readFileSync(folder+"_home.html","utf8").replace(script[0],'<script type="module" src="/preview-bootstrap.js"></script>').replace("<head>",'<head><meta name="robots" content="noindex,nofollow">');
writeFileSync(folder+"_home.html",home);
writeFileSync(folder+"_redirects","/ /_home.html 200!\n/api/job-library https://elmam-jobs-site.mohamts01.workers.dev/__netlify/api/jobs 200!\n/api/job-vacancy/:id https://elmam-jobs-site.mohamts01.workers.dev/__netlify/api/cv-job/:id 200!\n/* /index.html 200\n");
writeFileSync(folder+"_headers","/*\n  X-Robots-Tag: noindex, nofollow\n  Content-Security-Policy: connect-src 'self' https://accounts.google.com https://gmail.googleapis.com; object-src 'none'\n  X-Content-Type-Options: nosniff\n");
writeFileSync(folder+"robots.txt","User-agent: *\nDisallow: /\n");
copyFileSync("scripts/preview/sample-cv.pdf",folder+"sample-cv.pdf");

