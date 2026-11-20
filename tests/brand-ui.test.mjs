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


test("Anchor homepage exposes the real entry points and keeps one primary heading", () => {
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
 for(const value of ["أنشئ سيرتك الآن","جرّب المحرر","id=\"templates\"","href=\"/tools/jobs\"","t.me/etmam_cv_bot","/privacy","/terms"]) assert.ok(html.includes(value),value);
 assert.ok(html.includes('aria-pressed="true"'));
 assert.ok(html.includes('aria-expanded="true"'));
 assert.doesNotMatch(html,/Deploy AI|anchor deploy|cold starts|99.99%|gpt-5/);
});
test("navigation keeps the original logo and all account service destinations", () => {
 assert.ok(source("src/App.tsx").includes('src="/elmam-brand.svg"'));
 const services=source("src/anchor/WorkspaceNav.tsx");
 for(const path of ["/documents","/assistant","/tools/jobs","/tools/interviews","/tools/applications","/tools/linkedin","/plans"]) assert.ok(services.includes(path),path);
});
test("Anchor foreground pairs remain readable on dark surfaces", () => {
 for(const [fg,bg] of [["#eeedf1","#111014"],["#aaa5b3","#111014"],["#10211e","#72d5bc"],["#d0ead5","#213d2b"]]) assert.ok(contrast(fg,bg)>=4.5,fg+" on "+bg);
});
test("app routes load the product system and AI keeps review before application", () => {
 const main=source("src/main.tsx"); assert.ok(main.includes("design-system/system.css"));
 assert.doesNotMatch(main,/identity.css|home.css|visual-refresh.css|BrandMotion/);
 const css=source("src/anchor/anchor-theme.css");assert.ok(css.includes("prefers-reduced-motion:reduce"));assert.ok(css.includes("focus-visible"));
 const ai=source("src/ai/AIWorkspace.tsx"); for(const text of ["اختر مسودة","راجع التغييرات","عملية واحدة عند نجاح الطلب","onRun","onReview","CareerFlow"])assert.ok(ai.includes(text));
 assert.ok(source("src/design-system/Experience.tsx").includes("useReducedMotion"));
});
