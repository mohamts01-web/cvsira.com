import test from "node:test";
import assert from "node:assert/strict";
import { parseJobEntry } from "../shared/job-entry.mjs";

test("accepts local numerals and supported Elmam job URLs", () => {
  assert.equal(parseJobEntry(" ١٤٥٦ "), "1456");
  assert.equal(parseJobEntry("۱۴۵۶"), "1456");
  assert.equal(parseJobEntry("https://jobs.cvsira.com/j/1456"), "1456");
  assert.equal(parseJobEntry("https://jobs.cvsira.com/jobs/1456/retail?source=sample"), "1456");
});

test("rejects outside URLs, malformed paths and invalid identifiers", () => {
  for (const input of ["", "0", "0001", "1234567890123", "https://other.example/j/1456", "https://jobs.cvsira.com@other.example/j/1456", "http://jobs.cvsira.com/j/1456", "https://jobs.cvsira.com/jobs?q=1456"]) {
    assert.equal(parseJobEntry(input), null);
  }
});
