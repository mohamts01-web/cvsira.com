const projectToken = "phc_n2Y5DSoHZSUjZHGvUGczSmyyphtYcysWwrruTvSrzfJS";
const sessionKey = "elmam.cv.analytics";
const ref = /^#elmam_ref=([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/i;
let journey: string | undefined;
const emitted = new Set<string>();
type CvEvent = "cv job viewed" | "cv started" | "cv tailored previewed" |
  "cv tailored saved" | "cv checkout opened" | "cv pdf downloaded";

export function cvAnalyticsAllowed() {
  const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
  return location.origin === "https://cv.cvsira.com" && !privacy.globalPrivacyControl &&
    navigator.doNotTrack !== "1";
}

export function captureCvVisit() {
  if (!cvAnalyticsAllowed()) return;
  const key = "elmam.cv.visitor";
  let visitor: string | null = null;
  try { visitor = localStorage.getItem(key); } catch { /* Storage is optional. */ }
  if (!/^[0-9a-f-]{36}$/i.test(visitor ?? "")) visitor = crypto.randomUUID();
  try { localStorage.setItem(key, visitor!); } catch { /* Storage is optional. */ }
  capture("cv site visited", visitor!);
}

export function cvJourneyId() {
  if (!cvAnalyticsAllowed()) return;

  const inbound = ref.exec(location.hash)?.[1];
  try {
    if (inbound) history.replaceState(history.state, "", location.pathname + location.search);
    journey = inbound ?? sessionStorage.getItem(sessionKey) ?? journey ?? crypto.randomUUID();
    sessionStorage.setItem(sessionKey, journey);
  } catch { journey = inbound ?? journey ?? crypto.randomUUID(); }

  return journey;
}

export function captureCvEvent(event: CvEvent, jobId?: number, once = false) {
  const journey = cvJourneyId();
  if (!journey) return;
  const validJobId = Number.isSafeInteger(jobId) && jobId! > 0 ? jobId : undefined;
  if (once) {
    const key = [journey, event, validJobId].join(":");
    if (emitted.has(key)) return;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* The current page still deduplicates events. */ }
    emitted.add(key);
  }
  capture(event, journey, validJobId);
}

function capture(event: string, distinctId: string, jobId?: number) {
  void fetch("https://us.i.posthog.com/i/v0/e/", {
    method: "POST", credentials: "omit", referrerPolicy: "no-referrer", keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: projectToken, event, distinct_id: distinctId,
      properties: { job_id: jobId, site: "elmam_cv", $process_person_profile: false, $geoip_disable: true },
    }),
  }).catch(() => {});
}
