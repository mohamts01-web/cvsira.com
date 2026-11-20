import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const jobsPreviewProxy = {
  "^/api/discover-jobs(?:\\?|$)": {
    target: "https://jobs.cvsira.com",
    changeOrigin: true,
    rewrite: (path: string) =>
      path.replace(/^\/api\/discover-jobs/, "/api/jobs"),
  },
  "^/__jobs-preview/api/cv-job/[0-9]{1,12}$": {
    target: "https://jobs.cvsira.com",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/__jobs-preview/, ""),
  },
};

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id))
            return "react-vendor";
          if (
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils")
          )
            return "motion-vendor";
          if (id.includes("@supabase")) return "account-vendor";
        },
      },
    },
  },
  server: { proxy: jobsPreviewProxy },
  preview: { proxy: jobsPreviewProxy },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
