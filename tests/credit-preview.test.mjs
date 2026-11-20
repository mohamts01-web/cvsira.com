import test from "node:test";
import assert from "node:assert/strict";
import {creditPacks,customCreditQuote} from "../shared/credit-preview.mjs";

test("custom quantities match every advertised pack, before and after the proposed discount",()=>{
  for(const pack of creditPacks){
    assert.equal(customCreditQuote(pack.points).amountMinor,pack.amountMinor);
    assert.equal(customCreditQuote(pack.points,true).amountMinor,Math.round(pack.amountMinor*.8));
  }
});
test("custom credit totals are integer minor units, monotonic and cheaper per point at volume anchors",()=>{
  let previous=0;
  for(let points=15;points<=1000;points++){
    const quote=customCreditQuote(points);
    assert.ok(Number.isSafeInteger(quote.amountMinor));
    assert.ok(quote.amountMinor>=previous);
    assert.ok(customCreditQuote(points,true).amountMinor<=quote.amountMinor);
    previous=quote.amountMinor;
  }
  const anchors=[15,50,120,500,1000];
  for(let i=1;i<anchors.length;i++)assert.ok(customCreditQuote(anchors[i]).amountMinor/anchors[i]<customCreditQuote(anchors[i-1]).amountMinor/anchors[i-1]);
  assert.equal(customCreditQuote(500).amountMinor,34900);
});
test("unsupported custom quantities cannot produce a quote",()=>{
  for(const quantity of [0,14,1001,-1,15.5,NaN,Infinity,"500",null,undefined])assert.throws(()=>customCreditQuote(quantity));
});
