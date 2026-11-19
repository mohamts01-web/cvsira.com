import { build } from "esbuild";

await build({
  entryPoints: ["scripts/pricing/wheel-preview.tsx"],
  outfile: "public/pricing-experience/tool-wheel.js",
  bundle: true,
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
});
console.log("Built pricing wheel from project sources.");

