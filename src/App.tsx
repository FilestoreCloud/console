import React from "react";
import { Refine, Authenticated } from "@refinedev/core";
import { ThemedLayoutV2, notificationProvider, ThemedSiderV2 } from "@refinedev/antd";
import { ConfigProvider, App as AntdApp } from "antd";
import routerBindings, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
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
import { LoginPage } from "./pages/login";
import { TenantList } from "./pages/tenants/list";
import { TenantShow } from "./pages/tenants/show";
import { AuditLogList } from "./pages/audit-logs/list";
import { TelemetryDashboard } from "./pages/telemetry";
import { WebhooksSettings } from "./pages/settings/webhooks";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#ec7211",
            colorInfo: "#0284c7",
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
            <Routes>
              {/* Authenticated Layout */}
              <Route
                element={
                  <Authenticated key="authenticated-routes" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2
                      Header={() => <CustomHeader />}
                      Sider={(props) => (
                        <ThemedSiderV2
                          {...props}
                          Title={({ collapsed }) => (
                            <div style={{ padding: "12px", display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 20 }}>☁️</span>
                              {!collapsed && (
                                <strong style={{ color: "#ffffff", fontSize: 14 }}>Nextcloud SaaS</strong>
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
                <Route path="/audit-logs" element={<AuditLogList />} />
                <Route path="/telemetry" element={<TelemetryDashboard />} />
                <Route path="/settings/webhooks" element={<WebhooksSettings />} />
              </Route>

              {/* Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/tenants" replace />} />
            </Routes>
            <UnsavedChangesNotifier />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
