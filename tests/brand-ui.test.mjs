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
const output = buildSync({ entryPoints: ["src/Home.tsx"], bundle: true, platform: "node", format: "cjs", packages: "external", jsx: "automatic", write: false }).outputFiles[0].text;
const compiled = new Module(resolve("brand-ui.render.cjs"));
compiled.filename = resolve("brand-ui.render.cjs");
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(output, compiled.filename);
const html = renderToStaticMarkup(React.createElement(compiled.exports.default, { onStart() {}, onTry() {}, onPlans() {} }));

function contrast(first, second) {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("official palette is centralized and loaded by the website and public guides", () => {
  const tokens = source("public/brand-tokens.css");
  for (const color of ["#0B1F4B", "#1F5BFF", "#7A5CFF", "#00C2A8", "#E6F7F4", "#F4F8FC"]) assert.ok(tokens.includes(color));
  assert.ok(source("index.html").includes('href="/brand-tokens.css"'));
  assert.ok(source("public/search-guide.css").includes('@import url("/brand-tokens.css")'));
  for (const path of ["src/home.css", "src/identity.css"]) assert.doesNotMatch(source(path), /#163b30|#d8f5a2|#f3f2e9/i);
});

test("homepage and navigation use the original logo rather than a replacement wordmark", () => {
  assert.equal((html.match(/src="\/elmam-brand.svg"/g) || []).length, 2);
  assert.ok(source("src/App.tsx").includes('className="elmam-brand-image" src="/elmam-brand.svg"'));
  assert.doesNotMatch(source("src/App.tsx"), /brand-wordmark/);
  assert.ok(source("public/elmam-brand.svg").includes('fill="#002754"'));
});

test("homepage renders its real actions, selected template control, guides, and motion toggle", () => {
  for (const value of ["hero-orb-scene", "journey-navigation", "studio-preview", "حرّر بهذا القالب", "/ats-resume/", "/graduate-resume/", "/english-resume/", "motion-toggle", "new-footer"]) assert.ok(html.includes(value), value);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.ok(html.includes('data-motion="playing"'));
  assert.ok(html.includes('aria-pressed="true"'));
});

test("selected preview animates only its section boundary and preserves its controls", () => {
  const preview = source("src/ClarityPreview.tsx");
  assert.equal((preview.match(/<m\./g) || []).length, 1);
  assert.ok(preview.includes("<m.section"));
  assert.ok(preview.includes("viewport={{ once: true, amount: 0.2 }}"));
  assert.ok(preview.includes("initial={reduced ? false"));
  assert.ok(preview.includes('className="clarity-preview"'));
  assert.ok(html.includes('aria-label="معاينة قوالب السيرة الذاتية"'));
  assert.ok(html.includes('role="group" aria-label="اختر قالب المعاينة"'));
  assert.ok(html.includes("حرّر بهذا القالب"));
  const css = source("src/home.css");
  assert.ok(css.includes(".clarity-preview::before,.clarity-preview::after"));
  assert.ok(css.includes(".clarity-preview { transform: none !important; }"));
  assert.ok(css.includes("clarity-organic-float 4s"));
});

test("body text and button color pairs meet normal-text contrast", () => {
  for (const [text, background] of [["#FFFFFF", "#1F5BFF"], ["#FFFFFF", "#0B1F4B"], ["#00C2A8", "#0B1F4B"], ["#52627B", "#E6F7F4"], ["#52627B", "#F4F8FC"]]) assert.ok(contrast(text, background) >= 4.5, `${text} on ${background}`);
  const gradient = source("public/brand-tokens.css").match(/--brand-gradient: (.*);/)[1];
  assert.doesNotMatch(gradient, /purple/);
});

test("motion and lighting include reduced-motion, coarse-pointer, pause, and cleanup safeguards", () => {
  assert.ok(source("src/home.css").includes('data-motion="paused"'));
  for (const path of ["src/home.css", "src/identity.css"]) assert.ok(source(path).includes("prefers-reduced-motion: reduce"));
  const motion = source("src/BrandMotion.tsx");
  for (const value of ["useReducedMotion", "(pointer: fine)", "cancelAnimationFrame", 'removeEventListener("pointermove"', 'removeProperty("--magnet-x")']) assert.ok(motion.includes(value));
  assert.doesNotMatch(source("src/Home.tsx"), /SplitText|split\(["']{2}\)|letter-spacing.*arabic/);
});
