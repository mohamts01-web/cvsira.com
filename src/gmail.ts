type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken(): void };
type GoogleIdentity = { accounts: { oauth2: { initTokenClient(options: {
  client_id: string; scope: string; include_granted_scopes: boolean; callback: (result: TokenResponse) => void; error_callback: () => void;
}): TokenClient } } };
const identity = () => (window as Window & { google?: GoogleIdentity }).google?.accounts?.oauth2;
let loading: Promise<void> | undefined;
export function loadGoogleIdentity() {
  if (identity()) return Promise.resolve();
  return loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const failed = () => { script.remove(); loading = undefined; reject(Error("تعذّر تحميل اتصال Gmail.")); };
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => identity() ? resolve() : failed();
    script.onerror = failed;
    document.head.appendChild(script);
  });
}
export function authorizeGmail(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const provider = identity();
    if (!provider) return reject(Error("أعد تحميل اتصال Gmail."));
    provider.initTokenClient({
      client_id: clientId, scope: "https://www.googleapis.com/auth/gmail.send",
      include_granted_scopes: false,
      callback: response => response.access_token ? resolve(response.access_token) : reject(Error("لم يُمنح إذن إرسال البريد.")),
      error_callback: () => reject(Error("لم يكتمل ربط Gmail. يمكنك تنزيل مسودة البريد.")),
    }).requestAccessToken();
  });
}
