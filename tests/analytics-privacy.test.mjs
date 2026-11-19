import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/analytics.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture(origin, privacy = {}) {
  const calls = [];
  const values = new Map();
  const exports = {};
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  runInNewContext(js, {
    exports,
    navigator: privacy,
    location: { origin, hash: "", pathname: "/for-job/1454", search: "?hidden=test" },
    localStorage: storage,
    sessionStorage: storage,
    crypto: { randomUUID: () => "11111111-1111-4111-8111-111111111111" },
    fetch: async (url, request) => { calls.push({ url, ...request, body: JSON.parse(request.body) }); },
  });
  return { ...exports, calls, values };
}

test("CV telemetry is disabled in previews and when the browser requests privacy", () => {
  for (const [origin, privacy] of [
    ["http://127.0.0.1:4190", {}],
    ["https://etmam-cv.netlify.app", {}],
    ["https://cv.cvsira.com", { globalPrivacyControl: true }],
    ["https://cv.cvsira.com", { doNotTrack: "1" }],
  ]) {
    const f = fixture(origin, privacy);
    assert.equal(f.cvAnalyticsAllowed(), false);
    f.captureCvVisit();
    f.captureCvEvent("cv tailored saved", 1454, true);
    assert.equal(f.calls.length, 0);
    assert.equal(f.values.size, 0);
  }
});

test("only allowlisted fields are sent and one-time steps are deduplicated", () => {
  const f = fixture("https://cv.cvsira.com");
  f.captureCvEvent("cv tailored saved", 1454, true, { resume: "not sent" });
  f.captureCvEvent("cv tailored saved", 1454, true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].credentials, "omit");
  assert.equal(f.calls[0].referrerPolicy, "no-referrer");
  assert.deepEqual(Object.keys(f.calls[0].body).sort(), ["api_key", "distinct_id", "event", "properties"]);
  assert.deepEqual(f.calls[0].body.properties, { job_id: 1454, site: "elmam_cv", $process_person_profile: false, $geoip_disable: true });
});
