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
            if (id.includes("/zrender/")) {
              return "vendor-zrender";
            }
            if (id.includes("/echarts/")) {
              return "vendor-echarts";
            }
            if (id.includes("/@refinedev/")) {
              return "vendor-refine";
            }
            if (id.includes("/@tanstack/")) {
              return "vendor-tanstack";
            }
            if (
              id.includes("/@ant-design/icons") ||
              id.includes("/@ant-design/icons-svg")
            ) {
              return "vendor-icons";
            }
            if (id.includes("/@ant-design/pro-")) {
              return "vendor-pro";
            }
            if (id.includes("/@ant-design/cssinjs")) {
              return "vendor-cssinjs";
            }
            if (id.includes("/dayjs/")) {
              return "vendor-dayjs";
            }
            if (id.includes("/rc-")) {
              return "vendor-rc";
            }
            if (
              id.includes("/antd/es/table") ||
              id.includes("/antd/es/form") ||
              id.includes("/antd/es/select") ||
              id.includes("/antd/es/input") ||
              id.includes("/antd/es/modal")
            ) {
              return "vendor-antd-data";
            }
            if (
              id.includes("/antd/es/date-picker") ||
              id.includes("/antd/es/time-picker") ||
              id.includes("/antd/es/calendar") ||
              id.includes("/antd/es/color-picker")
            ) {
              return "vendor-antd-pickers";
            }
            if (id.includes("/antd/")) {
              return "vendor-antd";
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
