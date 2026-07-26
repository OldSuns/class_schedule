import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dependencyChunks = [
  {
    name: "react-vendor",
    pattern: /[/\\]node_modules[/\\](react|react-dom|scheduler)[/\\]/
  },
  {
    name: "motion",
    pattern: /[/\\]node_modules[/\\](framer-motion|motion-dom|motion-utils)[/\\]/
  },
  {
    name: "icons",
    pattern: /[/\\]node_modules[/\\]lucide-react[/\\]/
  },
  {
    name: "capacitor",
    pattern: /[/\\]node_modules[/\\]@capacitor[/\\]/
  }
];

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          const chunk = dependencyChunks.find(({ pattern }) => pattern.test(id));
          return chunk?.name ?? "vendor";
        }
      }
    }
  }
});
