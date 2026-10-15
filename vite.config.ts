/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("/zrender/") || id.includes("/echarts/")) {
              return "vendor-echarts";
            }
            if (
              id.includes("/antd/") ||
              id.includes("/@ant-design/") ||
              id.includes("/rc-")
            ) {
              return "vendor-antd";
            }
            if (id.includes("/@refinedev/")) {
              return "vendor-refine";
            }
            if (id.includes("/@tanstack/")) {
              return "vendor-tanstack";
            }
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/react-router-dom/") ||
              id.includes("/@remix-run/")
            ) {
              return "vendor-react";
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: false,
    exclude: ["node_modules", "dist", "e2e/**"],
  },
});
