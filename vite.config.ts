import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: process.env.BASE_PATH ?? "/clear-cut/",
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@imgly/background-removal", "onnxruntime-web"],
  },
  assetsInclude: ["**/*.wasm"],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/components/ui/**",
        "src/main.tsx",
      ],
    },
  },
});
