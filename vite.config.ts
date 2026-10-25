/// <reference types="vitest" />
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function devMockPlugin(): Plugin {
  return {
    name: "dev-mock-api",
    configureServer(server) {
      const seedPath = path.resolve(__dirname, "./src/mock/seedData.json");
      let seedData: any = {};
      try {
        seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      } catch {
        seedData = { tenants: [], audit_logs: [] };
      }

      server.middlewares.use((req, res, next) => {
        if (req.url === "/api" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            let payload: any = {};
            try {
              payload = JSON.parse(body || "{}");
            } catch {
              payload = {};
            }

            const action = payload.action;
            res.setHeader("Content-Type", "application/json");

            if (
              action === "LOGIN" ||
              action === "WEBAUTHN_LOGIN" ||
              action === "VERIFY_MFA"
            ) {
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  token: "dev-superadmin-token-12345",
                  user: payload.username || "admin@storix.io",
                  role: "SuperAdmin",
                })
              );
            }

            if (action === "LIST") {
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  tenants: seedData.tenants || [],
                  total: (seedData.tenants || []).length,
                })
              );
            }

            if (action === "AUDIT_LOGS") {
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  audit_logs: seedData.audit_logs || [],
                })
              );
            }

            if (action === "GET_TENANT_DETAIL") {
              const tid = payload.tenant_id;
              const tenant =
                (seedData.tenants || []).find(
                  (t: any) => t.tenant_id === tid || t.id === tid
                ) || seedData.tenants?.[0];

              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  tenant,
                  aws_topology: tenant?.aws_topology,
                  agent: tenant?.agent,
                  accounts: (tenant?.accounts || []).map((acc: any) => ({
                    ...acc,
                    password:
                      acc.password ||
                      acc.temporary_password ||
                      `${acc.username.charAt(0).toUpperCase() + acc.username.slice(1)}@Storix2026!`,
                  })),
                  audit_logs: (seedData.audit_logs || []).filter(
                    (a: any) => a.target === tid
                  ),
                  metrics: tenant?.metrics,
                  finops: tenant?.finops,
                  health: tenant?.health,
                })
              );
            }

            if (action === "METRICS") {
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  metrics: {
                    current_cpu_percent: 18.4,
                    current_memory_mb: 512,
                    memory_limit_mb: 2048,
                    active_connections: 124,
                    requests_per_minute: 142,
                    storage_used_gb: 142.5,
                    quota_gb: 500,
                  },
                })
              );
            }

            if (action === "GET_SFN_OBSERVABILITY") {
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  state_machines: [],
                  executions: [
                    {
                      executionArn:
                        "arn:aws:states:ap-southeast-1:123456789012:execution:prod-provision:exec-1",
                      name: "exec-provision-tenant",
                      stateMachineName: "prod-tenant-provisioning",
                      workflowType: "PROVISION",
                      status: "SUCCEEDED",
                      durationSeconds: 42,
                      startDate: new Date().toISOString(),
                    },
                  ],
                  logs: [
                    {
                      timestamp: new Date().toISOString(),
                      level: "INFO",
                      message:
                        "Step Functions execution completed successfully.",
                    },
                  ],
                  traces: [],
                  console_links: {},
                })
              );
            }

            if (action === "STREAM_SFN_PROGRESS") {
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  progress: 100,
                  status: "SUCCEEDED",
                  currentStep: "Operational & Ready",
                })
              );
            }

            // Default fallback
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true }));
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devMockPlugin()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: "esbuild",
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
            if (id.includes("/@radix-ui/")) {
              return "vendor-radix";
            }
            if (id.includes("/lucide-react/")) {
              return "vendor-lucide";
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    testTimeout: 15000,
    setupFiles: "./src/setupTests.ts",
    css: false,
    exclude: ["node_modules", "dist", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/providers/**", "src/types/**"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 65,
        statements: 85,
      },
    },
  },
});
