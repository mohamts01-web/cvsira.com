import test from "node:test";
import assert from "node:assert/strict";
import {readLibrary,libraryParams,libraryHref} from "../shared/job-library.mjs";
test("library filters are bounded, shareable and normalize Arabic job numbers",()=>{
 const params=libraryParams("q=١٧٣١&city=riyadh&category=finance&qualification=bachelor&page=999&origin=https://evil.invalid&employer=unknown");
 assert.equal(params.get("q"),"1731");
 assert.equal(params.get("page"),"100");
 assert.equal(params.has("origin"),false);
 assert.equal(params.has("employer"),false);
 assert.equal(libraryHref(params),"/jobs?q=1731&city=riyadh&category=finance&qualification=bachelor&page=100");
 assert.equal(libraryHref("city=fake&category=fake&page=-1"),"/jobs");
 assert.equal(libraryParams("q="+"x".repeat(200)).get("q").length,100);
});
test("library preserves upstream totals and exposes only public card fields",()=>{
 const value=readLibrary({jobs:[{id:5,title:"محاسب",company:"جهة",location:"الرياض",internal:"secret",path:"javascript:bad()"}],total:845,page:1});
 assert.equal(value.total,845);
 assert.deepEqual(Object.keys(value.jobs[0]),["id","title","company","location"]);
 assert.equal(readLibrary({jobs:[],total:0,page:1}).total,0);
});
test("unavailable or malformed data cannot masquerade as zero jobs",()=>{
 for(const value of [null,{},"<html>error</html>",{jobs:[],page:1},{jobs:[],total:-1,page:1},{jobs:[],total:0,page:0},{jobs:[{id:"5",title:"محاسب"}],total:1,page:1},{jobs:[{id:1,title:""}],total:1,page:1}])
   assert.throws(()=>readLibrary(value));
});
