import React, { useState, useEffect, Suspense } from "react";
import { Refine, Authenticated } from "@refinedev/core";
import routerBindings, {
  CatchAllNavigate,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import {
  Boxes,
  ShieldCheck,
  Activity,
  Bell,
  Loader2,
} from "lucide-react";

import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { accessControlProvider } from "./providers/accessControlProvider";
import { notificationProvider } from "./providers/notificationProvider";
import { LayoutProvider } from "./components/layout/LayoutContext";
import { AppLayout } from "./components/layout/AppLayout";
import { CommandPalette } from "./components/CommandPalette";
import { Toaster } from "@/components/ui/sonner";

// Lazy-loaded routes for code splitting and instant initial page load
const LoginPage = React.lazy(() =>
  import("./pages/login").then((m) => ({ default: m.LoginPage })),
);
const TenantList = React.lazy(() =>
  import("./pages/tenants/list").then((m) => ({ default: m.TenantList })),
);
const TenantShow = React.lazy(() =>
  import("./pages/tenants/show").then((m) => ({ default: m.TenantShow })),
);
const AuditLogList = React.lazy(() =>
  import("./pages/audit-logs/list").then((m) => ({ default: m.AuditLogList })),
);
const TelemetryDashboard = React.lazy(() =>
  import("./pages/telemetry").then((m) => ({ default: m.TelemetryDashboard })),
);
const WebhooksSettings = React.lazy(() =>
  import("./pages/settings/webhooks").then((m) => ({
    default: m.WebhooksSettings,
  })),
);

const LoadingFallback: React.FC = () => (
  <div className="min-h-[360px] flex items-center justify-center">
    <Loader2 className="h-8 w-8 text-primary animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("storix_theme") || localStorage.getItem("filestore_theme");
    if (saved) return saved === "dark";
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("storix_theme", next ? "dark" : "light");
      localStorage.setItem("filestore_theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <BrowserRouter>
      <LayoutProvider>
        <Refine
          authProvider={authProvider}
          dataProvider={dataProvider}
          accessControlProvider={accessControlProvider}
          routerProvider={routerBindings}
          notificationProvider={notificationProvider}
          resources={[
            {
              name: "tenants",
              list: "/tenants",
              show: "/tenants/:id",
              meta: {
                label: "Tenant Operations",
                icon: <Boxes className="h-4 w-4" />,
              },
            },
            {
              name: "audit-logs",
              list: "/audit-logs",
              meta: {
                label: "Cloud Audit Trail",
                icon: <ShieldCheck className="h-4 w-4" />,
              },
            },
            {
              name: "telemetry",
              list: "/telemetry",
              meta: {
                label: "Telemetry & Metrics",
                icon: <Activity className="h-4 w-4" />,
              },
            },
            {
              name: "webhooks",
              list: "/settings/webhooks",
              meta: {
                label: "Alerts & Webhooks",
                icon: <Bell className="h-4 w-4" />,
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            reactQuery: {
              clientConfig: {
                defaultOptions: {
                  queries: {
                    staleTime: 30000,
                    cacheTime: 300000,
                    refetchOnWindowFocus: false,
                  },
                },
              },
            },
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Authenticated Layout */}
              <Route
                element={
                  <Authenticated
                    key="authenticated-routes"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <AppLayout isDark={isDark} onToggleTheme={handleToggleTheme}>
                      <Outlet />
                    </AppLayout>
                  </Authenticated>
                }
              >
                <Route index element={<Navigate to="/tenants" replace />} />
                <Route path="/tenants" element={<TenantList />} />
                <Route path="/tenants/:id" element={<TenantShow />} />
                <Route path="/tenants/show/:id" element={<TenantShow />} />
                <Route path="/audit-logs" element={<AuditLogList />} />
                <Route path="/telemetry" element={<TelemetryDashboard />} />
                <Route
                  path="/settings/webhooks"
                  element={<WebhooksSettings />}
                />
              </Route>

              {/* Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/tenants" replace />} />
            </Routes>
          </Suspense>
          <CommandPalette isDark={isDark} onToggleTheme={handleToggleTheme} />
          <UnsavedChangesNotifier />
        </Refine>
        <Toaster richColors position="top-right" />
      </LayoutProvider>
    </BrowserRouter>
  );
};

export default App;
