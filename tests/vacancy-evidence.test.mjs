import { test } from "node:test";
import assert from "node:assert/strict";
import { vacancyEvidence } from "../shared/vacancy-evidence.mjs";

const resume = {
  headline: "محاسب", city: "الرياض", education: [{ title: "بكالوريوس", major: "محاسبة" }],
  experience: [{ title: "محاسب مالي" }], skills: ["Excel", "excel", "SQL", "C++"],
};

test("explains independently supported signals and deduplicates skills", () => {
  const evidence = vacancyEvidence(resume, { title: "محاسب مبتدئ", qualification: "بكالوريوس محاسبة", experience: "محاسب مالي مع سنتين", description: "Excel و C++", location: "الرياض، السعودية" });
  assert.deepEqual(evidence.map(({ kind, value }) => [kind, value]), [
    ["role", "محاسب"], ["education", "محاسبة"], ["experience", "محاسب مالي"],
    ["skills", "Excel، C++"], ["city", "الرياض"],
  ]);
});

test("avoids partial skill matches, job-group assumptions, and fabricated experience duration", () => {
  assert.deepEqual(vacancyEvidence(resume, { title: "فرص متنوعة", aggregate: true, description: "Excel" }), []);
  assert.deepEqual(vacancyEvidence(resume, { title: "أخصائي", description: "NoSQL", experience: "خبرة خمس سنوات" }), []);
});
