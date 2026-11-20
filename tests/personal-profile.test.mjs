import test from "node:test";
import assert from "node:assert/strict";
import {cleanPersonalProfile,savePersonalProfile} from "../shared/personal-profile.mjs";

test("profile saves only display data and cannot write account permissions or sign-in email",async()=>{
  let payload;
  const client={auth:{getUser:async()=>({data:{user:{id:"owner"}}}),updateUser:async(input)=>{payload=input;return {data:{user:{id:"owner"}}};}}};
  await savePersonalProfile(client,"owner",{name:" اسم تجريبي ",role:"admin",email:"other@example.com",credits:10000});
  assert.equal(payload.data.elmam_profile.name,"اسم تجريبي");
  assert.equal(payload.data.elmam_profile.role,undefined);
  assert.equal(payload.email,undefined);
  assert.deepEqual(Object.keys(payload.data),["elmam_profile"]);
});
test("changed or expired identities cannot update a profile",async()=>{
  let writes=0;
  const client={auth:{getUser:async()=>({data:{user:{id:"other"}}}),updateUser:async()=>writes++}};
  await assert.rejects(savePersonalProfile(client,"owner",{}));
  assert.equal(writes,0);
});
test("profile rejects unsafe links and malformed contact data and surfaces failed saves",async()=>{
  for(const input of [{linkedin:"javascript:alert(1)"},{linkedin:"https://linkedin.com.attacker.test"},{contactEmail:"not-email"},{name:"a".repeat(121)}])assert.throws(()=>cleanPersonalProfile(input));
  const client={auth:{getUser:async()=>({data:{user:{id:"owner"}}}),updateUser:async()=>({error:Error("failed")})}};
  await assert.rejects(savePersonalProfile(client,"owner",{}),/failed/);
});
