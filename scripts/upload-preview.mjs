import fs from "node:fs";
const token=fs.readFileSync("E:/pas/NETLIFY-PREVIEW.txt","utf8").trim();
const headers={Authorization:"Bearer "+token};
const root="https://api.netlify.com/api/v1";
async function json(url,options={}){
 const response=await fetch(url,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error("Netlify status "+response.status);
 return response.json();
}
const site=await json(root+"/sites/deft-meerkat-d21476.netlify.app");
if(site.name!=="deft-meerkat-d21476"||site.custom_domain)throw Error("Preview identity mismatch");
let deploy=await json(root+"/sites/"+site.id+"/deploys",{method:"POST",headers:{"Content-Type":"application/zip"},body:fs.readFileSync("anchor-preview.zip")});
for(let i=0;i<12&&deploy.state!=="ready";i++){
 await new Promise(r=>setTimeout(r,1500));
 deploy=await json(root+"/deploys/"+deploy.id);
}
console.log(JSON.stringify({id:deploy.id,state:deploy.state}));
