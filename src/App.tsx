import React, { useEffect, Suspense } from "react";
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
  LayoutDashboard,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { accessControlProvider } from "./providers/accessControlProvider";
import { notificationProvider } from "./providers/notificationProvider";
import { LayoutProvider } from "./components/layout/LayoutContext";
import { AppLayout } from "./components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";

// Lazy-loaded routes for code splitting and instant initial page load
const LoginPage = React.lazy(() =>
  import("./pages/login").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = React.lazy(() =>
  import("./pages/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const TenantList = React.lazy(() =>
  import("./pages/tenants/list").then((m) => ({ default: m.TenantList })),
);
const TenantShow = React.lazy(() =>
  import("./pages/tenants/show").then((m) => ({ default: m.TenantShow })),
);

const LoadingFallback: React.FC = () => (
  <div className="min-h-[360px] flex items-center justify-center">
    <Loader2 className="h-8 w-8 text-primary animate-spin" />
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    // Enforce pure light theme
    document.documentElement.classList.remove("dark");
    localStorage.setItem("storix_theme", "light");
    localStorage.setItem("filestore_theme", "light");
  }, []);

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
              name: "dashboard",
              list: "/dashboard",
              meta: {
                label: "Dashboard",
                icon: <LayoutDashboard className="h-4 w-4" />,
              },
            },
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
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </Authenticated>
                }
              >
                {/* Default route for SuperAdmin is Dashboard */}
                <Route index element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tenants" element={<TenantList />} />
                <Route path="/tenants/:id" element={<TenantShow />} />
                <Route path="/tenants/show/:id" element={<TenantShow />} />
                {/* Redirects */}
                <Route path="/audit-logs" element={<Navigate to="/dashboard" replace />} />
                <Route path="/telemetry" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
          <UnsavedChangesNotifier />
        </Refine>
        <Toaster richColors position="top-right" />
      </LayoutProvider>
    </BrowserRouter>
  );
};

export default App;
