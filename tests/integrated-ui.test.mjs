import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Module, { createRequire } from "node:module";
import { buildSync } from "esbuild";

const require = createRequire(resolve("package.json"));
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const source = (path) => readFileSync(resolve(path), "utf8");
function load(path) {
  const result = buildSync({ entryPoints: [path], bundle: true, platform: "node", format: "cjs", packages: "external", jsx: "automatic", write: false });
  const compiled = new Module(resolve("integrated-ui.render.cjs"));
  compiled.filename = resolve("integrated-ui.render.cjs");
  compiled.paths = Module._nodeModulePaths(process.cwd());
  compiled._compile(result.outputFiles[0].text, compiled.filename);
  return compiled.exports;
}
const { Pricing } = load("src/components/ui/pricing-1.tsx");
const { NeuralAccessLogin } = load("src/components/ui/neural-access-login.tsx");
const { FancyButton } = load("src/components/ui/fancy-button.tsx");

test("pricing renders supplied real offer values and a working action slot", () => {
  const html = renderToStaticMarkup(React.createElement(Pricing, { plan: { label: "باقة إلمام CV", description: "سيرتك المهنية", price: "١٠", currency: "ريالات", period: "٣٠ يومًا", features: ["٣ عمليات", "تنزيل PDF"] } }, React.createElement(FancyButton, { onClick() {} }, "سجّل الدخول للشراء")));
  for (const text of ["١٠", "ريالات", "٣٠ يومًا", "٣ عمليات", "تنزيل PDF", "سجّل الدخول للشراء", 'dir="rtl"', 'aria-expanded="true"', "بدون تجديد تلقائي"]) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /\$149|Unlimited team|Contact us/);
  assert.equal((html.match(/aria-expanded=/g) || []).length, 6);
});

test("liquid login preserves the existing form as content and uses deterministic decoration", () => {
  const render = () => renderToStaticMarkup(React.createElement(NeuralAccessLogin, null, React.createElement("form", null, React.createElement("input", { type: "email", name: "email", autoComplete: "email" }), React.createElement(FancyButton, { type: "submit" }, "أرسل رمز الدخول"))));
  const html = render();
  assert.equal(html, render());
  assert.ok(html.includes('src="/assets/logo-symbol.svg"'));
  assert.ok(html.includes('type="email"'));
  assert.ok(html.includes('type="submit"'));
  assert.ok(html.includes('aria-label="إيقاف حركة الخلفية"'));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.doesNotMatch(html, /Math.random|NEURAL|User Identity|Sequence Key/);
  assert.equal((html.match(/class="liquid-blob"/g) || []).length, 4);
});

test("UI adaptation retains authentication and checkout boundaries", () => {
  const app = source("src/App.tsx");
  for (const text of ["auth.auth.signInWithOtp", "auth.auth.verifyOtp", "<NeuralAccessLogin>", 'type="submit"', 'className="liquid-login-modal"']) assert.ok(app.includes(text));
  const whop = source("src/WhopPlan.tsx");
  for (const text of ["api.whopCheckout(id, referralJobId, sandbox ? undefined : cvJourneyId())", "api.whopConfirm", "api.whopStatus", "url.origin !== expectedOrigin", "advertisedOffer.amountMinor / 100", "advertisedOffer.aiOperations"]) assert.ok(whop.includes(text));
});

test("Tailwind and shadcn configuration preserve existing styles and scope liquid effects", () => {
  const css = source("src/ui.css");
  assert.ok(css.includes('tailwindcss/utilities.css'));
  assert.doesNotMatch(css, /preflight.css|fonts.googleapis|width:\s*100vw|height:\s*100vh|^:root/m);
  assert.ok(css.includes("prefers-reduced-motion: reduce"));
  assert.ok(css.includes('data-paused="true"'));
  const settings = JSON.parse(source("components.json"));
  assert.equal(settings.aliases.ui, "@/components/ui");
  assert.equal(settings.rsc, false);
});

