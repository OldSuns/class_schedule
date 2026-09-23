import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/framer-motion|motion-dom|motion-utils/.test(id)) return "motion";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("@capacitor")) return "capacitor";
          return "vendor";
        }
      }
    }
  }
});
