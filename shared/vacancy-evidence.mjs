function normalize(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي").replace(/[^\p{L}\p{N}+#.]+/gu, " ").trim();
}

function includesPhrase(text, phrase) {
  const needle = normalize(phrase);
  return needle.length >= 2 && (" " + normalize(text) + " ").includes(" " + needle + " ");
}

export function vacancyEvidence(resume, vacancy) {
  const evidence = [];
  if (vacancy.aggregate) return evidence;
  const roles = [resume.headline, ...resume.experience.map(entry => entry.title)];
  const role = roles.find(value => includesPhrase(vacancy.title, value));
  if (role) evidence.push({ kind: "role", label: "مسمّى مرتبط", value: role, weight: 4 });
  const degrees = resume.education.flatMap(entry => [entry.major, entry.title]);
  const qualification = degrees.find(value => includesPhrase(vacancy.qualification, value));
  if (qualification) evidence.push({ kind: "education", label: "مؤهل أو تخصص مذكور", value: qualification, weight: 3 });
  const experience = resume.experience.map(entry => entry.title).find(value => includesPhrase(vacancy.experience, value));
  if (experience) evidence.push({ kind: "experience", label: "مجال خبرة مذكور", value: experience, weight: 3 });
  const skillKeys = new Set();
  const requirements = [vacancy.description, vacancy.experience].filter(Boolean).join(" ");
  const skills = resume.skills.filter(skill => {
    const key = normalize(skill);
    if (skillKeys.has(key) || !includesPhrase(requirements, skill)) return false;
    skillKeys.add(key);
    return true;
  }).slice(0, 4);
  if (skills.length) evidence.push({ kind: "skills", label: "مهارات وردت في الإعلان", value: skills.join("، "), weight: skills.length * 2 });
  if (includesPhrase(vacancy.location, resume.city)) evidence.push({ kind: "city", label: "مدينة مذكورة في السيرة", value: resume.city, weight: 1 });
  return evidence;
}
