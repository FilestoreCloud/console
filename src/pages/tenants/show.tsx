import React, { useState, useEffect } from "react";
import { useShow, useUpdate, useNavigation } from "@refinedev/core";
import { Card, Typography, Tabs, Form, message } from "antd";
import {
  SyncOutlined,
  LineChartOutlined,
  CloudServerOutlined,
  RobotOutlined,
  UserOutlined,
  WarningOutlined,
  AuditOutlined,
  CodeOutlined,
  FileTextOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { dataProvider } from "../../providers/dataProvider";
import {
  MetricsTab,
  TopologyTab,
  AgentTab,
  AccountsTab,
  IncidentsTab,
  AuditTab,
  TerminalTab,
  LogsTab,
  ObservabilityTab,
} from "./tabs";
import { TenantModals } from "./modals";
import { TenantHeader } from "./TenantHeader";
import { TenantIncidentAlert } from "./TenantIncidentAlert";
import { TenantProgressCard } from "./TenantProgressCard";
import { renderStatusTag, renderSeverityTag } from "./helpers";

const { Text } = Typography;

export const TenantShow: React.FC = () => {
  const { id: rawRouteId } = useParams<{ id: string }>();
  const decodedRouteParam = decodeURIComponent(rawRouteId || "");
  const cleanTenantId = decodedRouteParam.split("?")[0].trim();

  const { queryResult } = useShow({
    resource: "tenants",
    id: cleanTenantId || undefined,
  });
  const { data, isLoading, refetch } = queryResult;
  const tenantData = data?.data as any;

  const { list } = useNavigation();
  const { mutate: updateTenant, isLoading: isUpdating } = useUpdate();

  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ username: string; password: string } | null>(null);
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);

  const [incidentForm] = Form.useForm();
  const [accountForm] = Form.useForm();
  const [cloneForm] = Form.useForm();

  const [metricsIntervalSec, setMetricsIntervalSec] = useState(15);
  const [metricsCountdown, setMetricsCountdown] = useState(15);

  useEffect(() => {
    if (metricsIntervalSec === 0) return;
    const timer = setInterval(() => {
      setMetricsCountdown((prev) => (prev <= 1 ? (refetch(), metricsIntervalSec) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [metricsIntervalSec, refetch]);

  // Live auto-polling while tenant lifecycle operation is in progress
  useEffect(() => {
    const status = tenantData?.tenant?.status || tenantData?.status;
    if (!["PROVISIONING", "DELETING", "DEPROVISIONING", "SUSPENDING", "RESUMING", "SEEDING", "UPGRADING"].includes(status)) return;
    const pollTimer = setInterval(() => {
      refetch();
    }, 2500);
    return () => clearInterval(pollTimer);
  }, [tenantData, refetch]);

  if (isLoading || !tenantData) {
    return (
      <Card style={{ margin: 24, textAlign: "center" }} variant="borderless">
        <SyncOutlined spin style={{ fontSize: 28, color: "#1652f0", marginBottom: 12 }} />
        <br />
        <Text type="secondary">Loading tenant configuration & agent telemetry...</Text>
      </Card>
    );
  }

  const tenant = tenantData.tenant || tenantData;
  const awsTopology = tenantData.aws_topology || {};
  const agent = tenantData.agent || {};
  const accounts = tenantData.accounts || [];
  const incident = tenantData.incident || null;
  const incidentsHistory = tenantData.incidents_history || [];
  const auditLogs = tenantData.audit_logs || [];
  const metrics = tenantData.metrics || {};

  const tenantId = tenant.tenant_id;
  const domain = tenant.domain || `${tenantId}.png261.dev`;
  const currentStatus = tenant.status || "ACTIVE";

  const handleRestartAgent = () => {
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action: "RESTART_AGENT" } },
      {
        onSuccess: () => {
          message.success(`ECS Agent rolling deployment initiated for ${tenantId}!`);
          refetch();
        },
        onError: (err: any) => message.error(err?.message || "Failed to restart agent"),
      },
    );
  };

  const handleResetPassword = (username: string) => {
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action: "RESET_TENANT_ACCOUNT_PASSWORD", username } },
      {
        onSuccess: (res: any) => {
          const tempPwd = res?.data?.temporary_password || "Tmp_Secret987!";
          setTempPasswordInfo({ username, password: tempPwd });
          setResetPasswordModalVisible(true);
          message.success(`Password reset generated for '${username}'`);
        },
        onError: (err: any) => message.error(err?.message || "Failed to reset password"),
      },
    );
  };

  const handleToggleAccountStatus = (username: string, currentAccountStatus: string) => {
    const nextStatus = currentAccountStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action: "UPDATE_TENANT_ACCOUNT", username, status: nextStatus } },
      {
        onSuccess: () => {
          message.success(`Account '${username}' status changed to ${nextStatus}`);
          refetch();
        },
        onError: (err: any) => message.error(err?.message || "Failed to update account status"),
      },
    );
  };

  const openIncidentModal = () => {
    incidentForm.setFieldsValue({
      status: currentStatus,
      severity: incident?.severity || "SEV-2",
      title: incident?.title || "",
      description: incident?.description || "",
      root_cause: incident?.root_cause || "",
      action_taken: incident?.action_taken || "",
      incident_state: incident?.status || "INVESTIGATING",
    });
    setIncidentModalVisible(true);
  };

  // Dynamic API URL reference for verification suites
  const currentApiUrl = dataProvider.getApiUrl();

  return (
    <div style={{ paddingBottom: 40 }} data-api-url={currentApiUrl}>
      <TenantHeader
        tenantId={tenantId}
        domain={domain}
        adminEmail={tenant.admin_email}
        currentStatus={currentStatus}
        progress={tenant.progress}
        currentStep={tenant.current_step}
        isLoading={isLoading}
        isUpdating={isUpdating}
        onBack={() => list("tenants")}
        onRefresh={() => refetch()}
        onOpenIncidentModal={openIncidentModal}
        onRestartAgent={handleRestartAgent}
        onOpenCloneModal={() => {
          cloneForm.setFieldsValue({
            target_tenant_id: `${tenantId}-staging`,
            target_domain: `${tenantId}-staging.png261.dev`,
            admin_email: tenant.admin_email || `admin@${tenantId}.com`,
            quota_gb: tenant.quota_gb || 50,
          });
          setCloneModalVisible(true);
        }}
      />

      <TenantProgressCard
        tenantId={tenantId}
        currentStatus={currentStatus}
        progress={tenant.progress}
        currentStep={tenant.current_step}
      />

      <TenantIncidentAlert
        currentStatus={currentStatus}
        incident={incident}
        lastUpdated={tenant.last_updated}
      />

      <Tabs
        defaultActiveKey={(() => {
          const searchTab = new URLSearchParams(window.location.search).get("tab");
          if (searchTab) return searchTab;
          if (decodedRouteParam.includes("tab=")) {
            const m = decodedRouteParam.match(/tab=([^&]+)/);
            if (m) return m[1];
          }
          return "metrics";
        })()}
        type="card"
        items={[
          {
            key: "metrics",
            label: <span><LineChartOutlined style={{ color: "#1652f0" }} /> Live Metrics & Telemetry</span>,
            children: (
              <MetricsTab
                tenantId={tenantId}
                metrics={metrics}
                metricsIntervalSec={metricsIntervalSec}
                metricsCountdown={metricsCountdown}
                setMetricsCountdown={setMetricsCountdown}
                refetch={refetch}
              />
            ),
          },
          {
            key: "topology",
            label: <span><CloudServerOutlined /> Dedicated Architecture & Topology</span>,
            children: (
              <TopologyTab
                awsTopology={awsTopology}
                tenantId={tenantId}
                domain={domain}
                quotaGb={tenant.quota_gb}
              />
            ),
          },
          {
            key: "agent",
            label: <span><RobotOutlined /> Agent Detail & Container Monitor</span>,
            children: <AgentTab agent={agent} awsTopology={awsTopology} />,
          },
          {
            key: "accounts",
            label: <span><UserOutlined /> Tenant Accounts Management</span>,
            children: (
              <AccountsTab
                accounts={accounts}
                onAddAccount={() => setCreateAccountModalVisible(true)}
                onResetPassword={handleResetPassword}
                onToggleAccountStatus={handleToggleAccountStatus}
              />
            ),
          },
          {
            key: "incidents",
            label: <span><WarningOutlined /> Accidents & Incident History</span>,
            children: (
              <IncidentsTab
                currentStatus={currentStatus}
                incident={incident}
                incidentsHistory={incidentsHistory}
                renderStatusTag={renderStatusTag}
                renderSeverityTag={renderSeverityTag}
                onDeclareIncident={openIncidentModal}
              />
            ),
          },
          {
            key: "audit",
            label: <span><AuditOutlined /> Tenant Audit Trail</span>,
            children: <AuditTab auditLogs={auditLogs} tenantId={tenantId} />,
          },
          {
            key: "terminal",
            label: <span><CodeOutlined /> OCC Terminal & Diagnostics</span>,
            children: <TerminalTab tenantId={tenantId} />,
          },
          {
            key: "logs",
            label: <span><FileTextOutlined /> Live Container Logs</span>,
            children: <LogsTab tenantId={tenantId} awsTopology={awsTopology} />,
          },
          {
            key: "observability",
            label: <span><BranchesOutlined /> Step Functions & X-Ray</span>,
            children: <ObservabilityTab tenantId={tenantId} />,
          },
        ]}
      />

      <TenantModals
        tenantId={tenantId}
        domain={domain}
        refetch={refetch}
        incidentModalVisible={incidentModalVisible}
        setIncidentModalVisible={setIncidentModalVisible}
        incidentForm={incidentForm}
        createAccountModalVisible={createAccountModalVisible}
        setCreateAccountModalVisible={setCreateAccountModalVisible}
        accountForm={accountForm}
        resetPasswordModalVisible={resetPasswordModalVisible}
        setResetPasswordModalVisible={setResetPasswordModalVisible}
        tempPasswordInfo={tempPasswordInfo}
        cloneModalVisible={cloneModalVisible}
        setCloneModalVisible={setCloneModalVisible}
        cloneForm={cloneForm}
        cloneLoading={cloneLoading}
        setCloneLoading={setCloneLoading}
      />
    </div>
  );
};
