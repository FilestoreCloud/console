import React, { useState, Suspense } from "react";
import { Refine, Authenticated } from "@refinedev/core";
import {
  ThemedLayoutV2,
  notificationProvider,
  ThemedSiderV2,
} from "@refinedev/antd";
import { ConfigProvider, App as AntdApp, theme, Spin } from "antd";
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
  ClusterOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  BellOutlined,
} from "@ant-design/icons";

import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { accessControlProvider } from "./providers/accessControlProvider";

import { CustomHeader } from "./components/Header";

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
  <div
    style={{
      minHeight: 360,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Spin size="large" />
  </div>
);

const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (localStorage.getItem("storix_theme") || localStorage.getItem("filestore_theme")) === "dark";
  });

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
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: "#1652f0",
            colorInfo: "#0091ff",
            borderRadius: 6,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
        }}
      >
        <AntdApp>
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
                  icon: <ClusterOutlined />,
                },
              },
              {
                name: "audit-logs",
                list: "/audit-logs",
                meta: {
                  label: "Cloud Audit Trail",
                  icon: <SafetyCertificateOutlined />,
                },
              },
              {
                name: "telemetry",
                list: "/telemetry",
                meta: {
                  label: "Telemetry & Metrics",
                  icon: <LineChartOutlined />,
                },
              },
              {
                name: "webhooks",
                list: "/settings/webhooks",
                meta: {
                  label: "Alerts & Webhooks",
                  icon: <BellOutlined />,
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
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
                      <ThemedLayoutV2
                        Header={() => (
                          <CustomHeader
                            isDark={isDark}
                            onToggleTheme={handleToggleTheme}
                          />
                        )}
                        Sider={(props) => (
                          <ThemedSiderV2
                            {...props}
                            Title={({ collapsed }) => (
                              <div
                                style={{
                                  padding: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                {collapsed ? (
                                  <img
                                    src="/storix-icon.png"
                                    alt="Storix"
                                    style={{
                                      width: 28,
                                      height: 28,
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : (
                                  <img
                                    src="/storix-logo-white.png"
                                    alt="Storix"
                                    style={{
                                      height: 32,
                                      maxWidth: 140,
                                      objectFit: "contain",
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          />
                        )}
                      >
                        <Outlet />
                      </ThemedLayoutV2>
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
            <UnsavedChangesNotifier />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
