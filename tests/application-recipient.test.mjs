import test from "node:test";
import assert from "node:assert/strict";
import {confirmedApplicationEmail} from "../shared/application-recipient.mjs";
test("only a verified email application destination enables a letter",()=>{
 assert.equal(confirmedApplicationEmail({applicationMethod:"email",applicationEmailConfirmed:true,applicationEmail:"jobs@example.org"}),"jobs@example.org");
 for(const job of [{},{description:"Send your CV to jobs@example.org"},{applicationEmail:"jobs@example.org"},{applicationMethod:"website",applicationEmailConfirmed:true,applicationEmail:"jobs@example.org"},{applicationMethod:"email",applicationEmailConfirmed:false,applicationEmail:"jobs@example.org"},{applicationMethod:"email",applicationEmailConfirmed:true,applicationEmail:"jobs@example.org\r\nBcc:evil@example.org"}])assert.equal(confirmedApplicationEmail(job),null);
});
