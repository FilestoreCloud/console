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
            if (id.includes("/@ant-design/icons/")) {
              return "vendor-antd-icons";
            }
            if (id.includes("/@ant-design/pro-")) {
              return "vendor-antd-pro";
            }
            if (id.includes("/rc-")) {
              return "vendor-rc";
            }
            if (
              id.includes("/antd/es/table") ||
              id.includes("/antd/es/date-picker") ||
              id.includes("/antd/es/calendar") ||
              id.includes("/antd/es/time-picker") ||
              id.includes("/antd/es/locale") ||
              id.includes("/antd/locale") ||
              id.includes("/antd/es/theme") ||
              id.includes("/antd/es/tabs") ||
              id.includes("/antd/es/menu") ||
              id.includes("/antd/es/descriptions") ||
              id.includes("/antd/es/card") ||
              id.includes("/antd/es/badge") ||
              id.includes("/antd/es/tag")
            ) {
              return "vendor-antd-ui";
            }
            if (
              id.includes("/antd/es/form") ||
              id.includes("/antd/es/input") ||
              id.includes("/antd/es/select") ||
              id.includes("/antd/es/modal") ||
              id.includes("/antd/es/drawer") ||
              id.includes("/antd/es/alert") ||
              id.includes("/antd/es/progress") ||
              id.includes("/antd/es/spin") ||
              id.includes("/antd/es/skeleton") ||
              id.includes("/antd/es/result") ||
              id.includes("/antd/es/empty") ||
              id.includes("/antd/es/breadcrumb") ||
              id.includes("/antd/es/avatar") ||
              id.includes("/antd/es/pagination") ||
              id.includes("/antd/es/dropdown") ||
              id.includes("/antd/es/popover") ||
              id.includes("/antd/es/tooltip") ||
              id.includes("/antd/es/notification") ||
              id.includes("/antd/es/message") ||
              id.includes("/antd/es/radio") ||
              id.includes("/antd/es/checkbox") ||
              id.includes("/antd/es/switch") ||
              id.includes("/antd/es/slider") ||
              id.includes("/antd/es/list") ||
              id.includes("/antd/es/collapse") ||
              id.includes("/antd/es/tree") ||
              id.includes("/antd/es/tree-select") ||
              id.includes("/antd/es/upload") ||
              id.includes("/antd/es/input-number")
            ) {
              return "vendor-antd-components";
            }
            if (id.includes("/antd/")) {
              return "vendor-antd-core";
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
