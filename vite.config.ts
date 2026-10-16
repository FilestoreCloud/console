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
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "CIRCULAR_CHUNK") return;
        defaultHandler(warning);
      },
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("/@babel/runtime/")) {
              return "vendor-babel";
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
            if (id.includes("/rc-") || id.includes("/@rc-component/")) {
              return "vendor-rc";
            }
            if (id.includes("/@ant-design/pro-")) {
              return "vendor-pro";
            }
            if (
              id.includes("/@ant-design/icons") ||
              id.includes("/@ant-design/colors") ||
              id.includes("/@ant-design/fast-color")
            ) {
              return "vendor-icons";
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
              id.includes("/antd/es/color-picker") ||
              id.includes("/@ant-design/cssinjs")
            ) {
              return "vendor-antd-pickers";
            }
            if (id.includes("/@ant-design/cssinjs/")) {
              return "vendor-cssinjs";
            }
            if (id.includes("/antd/")) {
              if (id.includes("/table/") || id.includes("/table.")) {
                return "vendor-antd-table";
              }
              if (id.includes("/form/") || id.includes("/form.")) {
                return "vendor-antd-form";
              }
              if (id.includes("/theme/")) {
                return "vendor-antd-theme";
              }
              return "vendor-antd";
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
