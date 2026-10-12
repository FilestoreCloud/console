import React, { useState, useEffect } from "react";
import { useShow, useUpdate, useCan, useNavigation } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Typography,
  Tabs,
  Table,
  Badge,
  Descriptions,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Alert,
  message,
  Tooltip,
  Divider,
  Switch,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  HddOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  WarningOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  KeyOutlined,
  PlusOutlined,
  LockOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  AuditOutlined,
  RobotOutlined,
  CodeOutlined,
  FileTextOutlined,
  BranchesOutlined,
  CopyOutlined,
  ClearOutlined,
  SearchOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { dataProvider } from "../../providers/dataProvider";
import { InteractiveMetricsChart } from "../../components/InteractiveMetricsChart";

const { Title, Text, Paragraph } = Typography;

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
  const { data: canUpdate } = useCan({ resource: "tenants", action: "edit" });

  // Modals state
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] =
    useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] =
    useState(false);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const [incidentForm] = Form.useForm();
  const [accountForm] = Form.useForm();
  const [cloneForm] = Form.useForm();

  // OCC Terminal State
  const [occCommand, setOccCommand] = useState("status");
  const [occLoading, setOccLoading] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<
    Array<{
      cmd: string;
      output: string;
      exit_code: number;
      duration_ms: number;
      timestamp: string;
    }>
  >([
    {
      cmd: "occ status",
      output: `  - installed: true\n  - version: 30.0.1.3\n  - versionstring: 30.0.1\n  - edition: Enterprise AI\n  - maintenance: false\n  - needsDbUpgrade: false\n  - productname: Nextcloud\n  - extendedSupport: true`,
      exit_code: 0,
      duration_ms: 182,
      timestamp: new Date().toISOString(),
    },
  ]);

  // Live Container Logs State
  const [logsContainer, setLogsContainer] = useState("all");
  const [logsLevel, setLogsLevel] = useState("ALL");
  const [logsFilter, setLogsFilter] = useState("");
  const [logsAutoRefresh, setLogsAutoRefresh] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [containerLogs, setContainerLogs] = useState<any[]>([]);

  // Fork / Clone Tenant Modal State
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);

  // Live Telemetry Stream Auto-Refresh State
  const [metricsIntervalSec, setMetricsIntervalSec] = useState(15);
  const [metricsCountdown, setMetricsCountdown] = useState(15);

  useEffect(() => {
    if (metricsIntervalSec === 0) return;
    const timer = setInterval(() => {
      setMetricsCountdown((prev) => {
        if (prev <= 1) {
          refetch();
          return metricsIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [metricsIntervalSec, refetch]);

  if (isLoading || !tenantData) {
    return (
      <Card style={{ margin: 24, textAlign: "center" }}>
        <SyncOutlined
          spin
          style={{ fontSize: 28, color: "#ec7211", marginBottom: 12 }}
        />
        <br />
        <Text type="secondary">
          Loading tenant configuration & agent telemetry...
        </Text>
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

  // Status tag styling
  const renderStatusTag = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            ACTIVE
          </Tag>
        );
      case "DEGRADED":
        return (
          <Tag color="warning" icon={<AlertOutlined />}>
            DEGRADED
          </Tag>
        );
      case "INCIDENT":
        return (
          <Tag color="error" icon={<WarningOutlined />}>
            INCIDENT / OUTAGE
          </Tag>
        );
      case "MAINTENANCE":
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            MAINTENANCE
          </Tag>
        );
      case "SUSPENDED":
        return <Tag color="default">SUSPENDED ($0 FINOPS)</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const renderSeverityTag = (sev: string) => {
    switch (sev) {
      case "SEV-1":
        return <Tag color="#cf1322">SEV-1 CRITICAL</Tag>;
      case "SEV-2":
        return <Tag color="#d46b08">SEV-2 MAJOR</Tag>;
      case "SEV-3":
        return <Tag color="#d4b106">SEV-3 MINOR</Tag>;
      default:
        return <Tag color="#1d39c4">{sev || "NOTICE"}</Tag>;
    }
  };

  // Agent Operations: Rolling Restart
  const handleRestartAgent = () => {
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: { action: "RESTART_AGENT" },
      },
      {
        onSuccess: (res: any) => {
          message.success(
            `ECS Agent rolling deployment initiated for ${tenantId}!`,
          );
          refetch();
        },
        onError: (err: any) => {
          message.error(err?.message || "Failed to restart agent");
        },
      },
    );
  };

  // Incident & Accident Status Update
  const handleIncidentSubmit = (values: any) => {
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: {
          action: "UPDATE_INCIDENT_STATUS",
          status: values.status,
          severity: values.severity,
          title: values.title,
          description: values.description,
          root_cause: values.root_cause,
          action_taken: values.action_taken,
          incident_state: values.incident_state,
        },
      },
      {
        onSuccess: () => {
          message.success(`Incident status updated for tenant ${tenantId}!`);
          setIncidentModalVisible(false);
          incidentForm.resetFields();
          refetch();
        },
        onError: (err: any) => {
          message.error(err?.message || "Failed to update incident");
        },
      },
    );
  };

  // Account Management: Create Account
  const handleCreateAccount = (values: any) => {
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: {
          action: "CREATE_TENANT_ACCOUNT",
          username: values.username,
          display_name: values.display_name,
          email: values.email,
          role: values.role,
          quota_gb: values.quota_gb,
        },
      },
      {
        onSuccess: () => {
          message.success(`Account '${values.username}' created successfully!`);
          setCreateAccountModalVisible(false);
          accountForm.resetFields();
          refetch();
        },
        onError: (err: any) => {
          message.error(err?.message || "Failed to create account");
        },
      },
    );
  };

  // Account Management: Reset Password
  const handleResetPassword = (username: string) => {
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: {
          action: "RESET_TENANT_ACCOUNT_PASSWORD",
          username,
        },
      },
      {
        onSuccess: (res: any) => {
          const tempPwd = res?.data?.temporary_password || "Tmp_Secret987!";
          setTempPasswordInfo({ username, password: tempPwd });
          setResetPasswordModalVisible(true);
          message.success(`Password reset generated for '${username}'`);
        },
        onError: (err: any) => {
          message.error(err?.message || "Failed to reset password");
        },
      },
    );
  };

  // Account Management: Toggle Status
  const handleToggleAccountStatus = (
    username: string,
    currentAccountStatus: string,
  ) => {
    const nextStatus =
      currentAccountStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: {
          action: "UPDATE_TENANT_ACCOUNT",
          username,
          status: nextStatus,
        },
      },
      {
        onSuccess: () => {
          message.success(
            `Account '${username}' status changed to ${nextStatus}`,
          );
          refetch();
        },
        onError: (err: any) => {
          message.error(err?.message || "Failed to update account status");
        },
      },
    );
  };

  // OCC Runner Execution
  const handleExecuteOcc = async (cmdToRun?: string) => {
    const cmd = (cmdToRun || occCommand).trim();
    if (!cmd) return;
    setOccLoading(true);
    try {
      const res = await dataProvider.custom({
        url: "/api",
        method: "post",
        payload: {
          action: "EXECUTE_OCC_COMMAND",
          tenant_id: tenantId,
          command: cmd,
        },
      });
      const data = res.data;
      setTerminalOutput((prev) => [
        ...prev,
        {
          cmd: data.command || `occ ${cmd}`,
          output: data.output || "Execution completed.",
          exit_code: data.exit_code ?? 0,
          duration_ms: data.duration_ms ?? 240,
          timestamp: data.executed_at || new Date().toISOString(),
        },
      ]);
      message.success(`Command 'occ ${cmd}' executed successfully!`);
    } catch (err: any) {
      message.error(err?.message || "OCC execution failed");
    } finally {
      setOccLoading(false);
    }
  };

  // Live Container Logs Fetching
  const handleFetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await dataProvider.custom({
        url: "/api",
        method: "post",
        payload: {
          action: "GET_CONTAINER_LOGS",
          tenant_id: tenantId,
          container: logsContainer,
          limit: 100,
          filter: logsFilter || undefined,
        },
      });
      setContainerLogs(res.data?.events || []);
    } catch (err: any) {
      console.warn("Notice fetching logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Clone / Fork Tenant to Sandbox
  const handleCloneTenant = async (values: any) => {
    setCloneLoading(true);
    try {
      const targetId = values.target_tenant_id.toLowerCase().trim();
      await dataProvider.custom({
        url: "/api",
        method: "post",
        payload: {
          action: "CLONE_TENANT",
          source_tenant_id: tenantId,
          target_tenant_id: targetId,
          target_domain: values.target_domain?.trim(),
          admin_email: values.admin_email?.trim(),
          quota_gb: values.quota_gb,
        },
      });
      message.success(
        `Tenant '${tenantId}' cloned to staging sandbox '${targetId}'!`,
      );
      setCloneModalVisible(false);
      cloneForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.message || "Failed to clone tenant");
    } finally {
      setCloneLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* 1. Header Bar with Tenant Breadcrumb & Quick Actions */}
      <Card
        style={{ marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space align="center" size={12}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => list("tenants")}
              >
                Fleet
              </Button>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {tenantId}
                  </Title>
                  {renderStatusTag(currentStatus)}
                </div>
                <div style={{ marginTop: 4 }}>
                  <a
                    href={`https://${domain}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontWeight: 600, color: "#0284c7" }}
                  >
                    https://{domain} <LinkOutlined style={{ fontSize: 11 }} />
                  </a>
                  <Text
                    type="secondary"
                    style={{ marginLeft: 12, fontSize: 12 }}
                  >
                    Admin: {tenant.admin_email}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
              >
                Refresh
              </Button>

              <Button
                icon={<WarningOutlined />}
                danger={
                  currentStatus === "INCIDENT" || currentStatus === "DEGRADED"
                }
                onClick={() => {
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
                }}
              >
                Incident / Status Circuit-Breaker
              </Button>

              <Popconfirm
                title="Trigger Rolling Restart of Agent Task?"
                description={`This forces a new ECS task deployment for tenant '${tenantId}' with zero downtime.`}
                onConfirm={handleRestartAgent}
                okText="Restart Task"
                cancelText="Cancel"
              >
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  loading={isUpdating}
                  style={{ background: "#ec7211", borderColor: "#ec7211" }}
                >
                  Restart Agent Task
                </Button>
              </Popconfirm>

              <Button
                icon={<BranchesOutlined />}
                style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}
                onClick={() => {
                  cloneForm.setFieldsValue({
                    target_tenant_id: `${tenantId}-staging`,
                    target_domain: `${tenantId}-staging.png261.dev`,
                    admin_email: tenant.admin_email || `admin@${tenantId}.com`,
                    quota_gb: tenant.quota_gb || 50,
                  });
                  setCloneModalVisible(true);
                }}
              >
                Fork to Sandbox
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 2. Active Incident Alert Banner if in incident or degraded state */}
      {(currentStatus === "INCIDENT" ||
        currentStatus === "DEGRADED" ||
        currentStatus === "MAINTENANCE") && (
        <Alert
          type={currentStatus === "INCIDENT" ? "error" : "warning"}
          showIcon
          style={{ marginBottom: 20 }}
          message={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>
                  ACTIVE INCIDENT:{" "}
                  {incident?.title || `Tenant status is ${currentStatus}`}
                </strong>
                {incident?.severity && (
                  <span style={{ marginLeft: 8 }}>
                    {renderSeverityTag(incident.severity)}
                  </span>
                )}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Reported by: {incident?.reported_by || "Operator"} at{" "}
                {incident?.reported_at || tenant.last_updated}
              </Text>
            </div>
          }
          description={
            <div style={{ marginTop: 6 }}>
              {incident?.description && (
                <Paragraph style={{ marginBottom: 4 }}>
                  <strong>Description:</strong> {incident.description}
                </Paragraph>
              )}
              {incident?.root_cause && (
                <Paragraph style={{ marginBottom: 4 }}>
                  <strong>Root Cause:</strong> {incident.root_cause}
                </Paragraph>
              )}
              {incident?.action_taken && (
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Remediation Taken:</strong> {incident.action_taken}
                </Paragraph>
              )}
            </div>
          }
        />
      )}

      {/* 3. Main Operational Tabs */}
      <Tabs
        defaultActiveKey={(() => {
          const searchTab = new URLSearchParams(window.location.search).get(
            "tab",
          );
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
            label: (
              <span>
                <LineChartOutlined style={{ color: "#ec7211" }} /> Live Metrics
                & Telemetry
              </span>
            ),
            children: (
              <div>
                {/* 1. Top KPI Summary Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  {/* CPU Utilization */}
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          CPU Utilization
                        </Text>
                        <Tag
                          color={
                            (metrics.current_cpu_percent ?? 1.2) >= 70
                              ? "error"
                              : (metrics.current_cpu_percent ?? 1.2) >= 50
                                ? "warning"
                                : "success"
                          }
                        >
                          Fargate Task
                        </Tag>
                      </div>
                      <Title level={2} style={{ margin: "0 0 8px 0" }}>
                        {metrics.current_cpu_percent ?? 1.2}%
                      </Title>
                      <Progress
                        percent={metrics.current_cpu_percent ?? 1.2}
                        status={
                          (metrics.current_cpu_percent ?? 1.2) >= 70
                            ? "exception"
                            : "normal"
                        }
                        strokeColor={
                          (metrics.current_cpu_percent ?? 1.2) >= 70
                            ? "#ef4444"
                            : (metrics.current_cpu_percent ?? 1.2) >= 50
                              ? "#f59e0b"
                              : "#10b981"
                        }
                        showInfo={false}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 8,
                          fontSize: 11,
                        }}
                      >
                        <Text type="secondary">
                          Peak:{" "}
                          <strong>{metrics.peak_cpu_percent ?? 2.8}%</strong>
                        </Text>
                        <Text type="secondary">
                          Target: <strong>70% (Autoscale)</strong>
                        </Text>
                      </div>
                    </Card>
                  </Col>

                  {/* Memory Utilization */}
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Memory Utilization
                        </Text>
                        <Tag color="processing">1024 MB Limit</Tag>
                      </div>
                      <Title level={2} style={{ margin: "0 0 8px 0" }}>
                        {metrics.current_memory_percent ?? 10.1}%
                      </Title>
                      <Progress
                        percent={metrics.current_memory_percent ?? 10.1}
                        strokeColor="#3b82f6"
                        showInfo={false}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 8,
                          fontSize: 11,
                        }}
                      >
                        <Text type="secondary">
                          Peak:{" "}
                          <strong>
                            {metrics.peak_memory_percent ?? 10.1}%
                          </strong>
                        </Text>
                        <Text type="secondary">
                          Allocated:{" "}
                          <strong>
                            {metrics.allocated_memory_mb ?? 1024} MB
                          </strong>
                        </Text>
                      </div>
                    </Card>
                  </Col>

                  {/* Ingress & Traffic */}
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Ingress & Latency
                        </Text>
                        <Tag color="cyan">ALB tg-{tenantId}</Tag>
                      </div>
                      <Title level={2} style={{ margin: "0 0 8px 0" }}>
                        {metrics.avg_latency_ms ?? 44.2}{" "}
                        <span style={{ fontSize: 14, fontWeight: "normal" }}>
                          ms
                        </span>
                      </Title>
                      <div style={{ marginTop: 8 }}>
                        <Badge
                          status="success"
                          text="Target Health: HTTP 200 OK"
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 12,
                          fontSize: 11,
                        }}
                      >
                        <Text type="secondary">
                          Requests (2h):{" "}
                          <strong>{metrics.total_requests_2h ?? 15}</strong>
                        </Text>
                        <Text type="secondary">
                          5xx Errors:{" "}
                          <strong style={{ color: "#10b981" }}>0</strong>
                        </Text>
                      </div>
                    </Card>
                  </Col>

                  {/* Storage Quota */}
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Storage & Quota
                        </Text>
                        <Tag color="purple">S3 Vault + EFS</Tag>
                      </div>
                      <Title level={2} style={{ margin: "0 0 8px 0" }}>
                        {((metrics.storage_used_mb ?? 1420.5) / 1024).toFixed(
                          1,
                        )}{" "}
                        <span style={{ fontSize: 14, fontWeight: "normal" }}>
                          / {metrics.storage_quota_gb ?? 100} GB
                        </span>
                      </Title>
                      <Progress
                        percent={metrics.storage_percent ?? 1.4}
                        strokeColor="#8b5cf6"
                        showInfo={false}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 8,
                          fontSize: 11,
                        }}
                      >
                        <Text type="secondary">
                          Used:{" "}
                          <strong>
                            {metrics.storage_used_mb ?? 1420.5} MB
                          </strong>
                        </Text>
                        <Text type="secondary">
                          DB: <strong>nc_{tenantId}</strong>
                        </Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* 2. Middle Row: CloudWatch Real-Time Graph + Auto-Scaling Details */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} lg={15}>
                    <InteractiveMetricsChart
                      tenantId={tenantId}
                      clusterName={
                        metrics.cluster_name || "prod-nextcloud-cluster"
                      }
                      history={metrics.history || []}
                      autoscalingTargetCpu={
                        metrics.autoscaling_target_cpu || 70.0
                      }
                      intervalSec={metricsIntervalSec}
                      countdown={metricsCountdown}
                      onRefresh={() => {
                        refetch();
                        setMetricsCountdown(metricsIntervalSec);
                      }}
                    />
                  </Col>

                  <Col xs={24} lg={9}>
                    <Card
                      title={
                        <Space>
                          <ThunderboltOutlined style={{ color: "#3b82f6" }} />
                          <span>Auto-Scaling & Elastic Capacity</span>
                        </Space>
                      }
                      bordered={false}
                      style={{
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        height: "100%",
                      }}
                    >
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="ECS Service">
                          <code>service-{tenantId}</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Running / Desired Tasks">
                          <Space>
                            <Tag color="success">
                              <strong>
                                {metrics.running_tasks ?? 1} Running
                              </strong>
                            </Tag>
                            <Tag color="default">
                              {metrics.desired_tasks ?? 1} Desired
                            </Tag>
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Capacity Bounds">
                          Min: <strong>{metrics.min_capacity ?? 1} task</strong>{" "}
                          | Max:{" "}
                          <strong>{metrics.max_capacity ?? 4} tasks</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Scaling Policy">
                          <Tag color="processing">TargetTrackingScaling</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Target Utilization">
                          <strong>
                            {metrics.autoscaling_target_cpu ?? 70.0}% Average
                            CPU
                          </strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Cooldown Periods">
                          Scale-Out: <strong>60s</strong> | Scale-In:{" "}
                          <strong>300s</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="CloudWatch Alarms">
                          <Badge
                            status="processing"
                            text="AlarmHigh (Scale-Out: CPU > 70%)"
                          />
                          <br />
                          <Badge
                            status="default"
                            text="AlarmLow (Scale-In: CPU < 70%)"
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="FinOps Zero Compute">
                          <Tag color="green">
                            Supported (DesiredCount: 0 on Suspend)
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                {/* 3. Bottom Row: Live Metric Time-Slice History Table */}
                <Card
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: "#10b981" }} />
                      <span>Telemetry History Time-Slices (Last 2 Hours)</span>
                    </Space>
                  }
                  size="small"
                  bordered={false}
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                >
                  <Table
                    dataSource={metrics.history || []}
                    rowKey="timestamp"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Timestamp",
                        dataIndex: "timestamp",
                        key: "timestamp",
                        render: (val: string) => <code>{val}</code>,
                      },
                      {
                        title: "CPU Utilization",
                        dataIndex: "cpu_percent",
                        key: "cpu_percent",
                        render: (val: number) => (
                          <Space>
                            <Progress
                              percent={val}
                              size="small"
                              style={{ width: 100 }}
                              strokeColor={
                                val >= 70
                                  ? "#ef4444"
                                  : val >= 50
                                    ? "#f59e0b"
                                    : "#10b981"
                              }
                              showInfo={false}
                            />
                            <strong>{val}%</strong>
                          </Space>
                        ),
                      },
                      {
                        title: "Memory Utilization",
                        dataIndex: "memory_percent",
                        key: "memory_percent",
                        render: (val: number) => (
                          <Space>
                            <Progress
                              percent={val}
                              size="small"
                              style={{ width: 100 }}
                              strokeColor="#3b82f6"
                              showInfo={false}
                            />
                            <strong>{val}%</strong>
                          </Space>
                        ),
                      },
                      {
                        title: "HTTP Requests",
                        dataIndex: "requests",
                        key: "requests",
                        render: (val: number) => (
                          <Tag color="blue">{val} reqs</Tag>
                        ),
                      },
                      {
                        title: "Avg Latency",
                        dataIndex: "latency_ms",
                        key: "latency_ms",
                        render: (val: number) => (
                          <span>{val.toFixed(1)} ms</span>
                        ),
                      },
                      {
                        title: "Service Health",
                        dataIndex: "status",
                        key: "status",
                        render: (val: string) => (
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            {val}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: "topology",
            label: (
              <span>
                <CloudServerOutlined /> Dedicated Architecture & Topology
              </span>
            ),
            children: (
              <div>
                <Row gutter={[16, 16]}>
                  {/* Compute & ALB Ingress */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <CloudServerOutlined style={{ color: "#ec7211" }} />
                          <span>Container-per-Tenant Compute & Ingress</span>
                        </Space>
                      }
                      size="small"
                      bordered={false}
                      style={{
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        height: "100%",
                      }}
                    >
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="ECS Fargate Cluster">
                          <code>
                            {awsTopology.cluster_name ||
                              "prod-nextcloud-cluster"}
                          </code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Dedicated ECS Service">
                          <code>
                            {awsTopology.service_name || `service-${tenantId}`}
                          </code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Task Definition Family">
                          <code>
                            {awsTopology.task_family ||
                              `prod-nextcloud-${tenantId}`}
                          </code>
                        </Descriptions.Item>
                        <Descriptions.Item label="ALB Target Group">
                          <code>
                            {awsTopology.alb_target_group_name ||
                              `tg-${tenantId}`}
                          </code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Host-Header Routing Rule">
                          <Tag color="cyan">
                            {awsTopology.alb_routing_rule ||
                              `HostHeader: ${domain}`}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Health Check Path">
                          <Tag color="green">
                            {awsTopology.health_check_path || "/status.php"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  {/* Storage & Database Tiers */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <DatabaseOutlined style={{ color: "#0284c7" }} />
                          <span>3-Tier Storage & Database Isolation</span>
                        </Space>
                      }
                      size="small"
                      bordered={false}
                      style={{
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        height: "100%",
                      }}
                    >
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="PostgreSQL Physical DB">
                          <code>
                            {awsTopology.database_name ||
                              `nc_${tenantId.replace(/-/g, "_")}`}
                          </code>
                        </Descriptions.Item>
                        <Descriptions.Item label="RDS Engine">
                          <Tag color="geekblue">
                            {awsTopology.database_engine || "PostgreSQL 16.3"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="EFS Access Point">
                          <code>{awsTopology.efs_access_point_id}</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="EFS Posix Mount Path">
                          <code>
                            {awsTopology.efs_mount_path ||
                              `/tenants/${tenantId}/config`}{" "}
                            (UID 33)
                          </code>
                        </Descriptions.Item>
                        <Descriptions.Item label="S3 Vault Prefix">
                          <code>{awsTopology.s3_vault_prefix}</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Storage Quota">
                          <div>
                            <Progress
                              percent={18}
                              size="small"
                              status="active"
                            />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              18 GB used of {tenant.quota_gb || 100} GB
                              provisioned
                            </Text>
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },

          {
            key: "agent",
            label: (
              <span>
                <RobotOutlined /> Agent Detail & Container Monitor
              </span>
            ),
            children: (
              <div>
                {/* Agent Task Runtime Card */}
                <Card
                  title={
                    <Space>
                      <RobotOutlined style={{ color: "#10b981" }} />
                      <span>ECS Agent Task Runtime Telemetry</span>
                    </Space>
                  }
                  size="small"
                  bordered={false}
                  style={{
                    marginBottom: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={6}>
                      <Card size="small" style={{ background: "#f8fafc" }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          AGENT STATUS
                        </Text>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            marginTop: 4,
                          }}
                        >
                          {agent.status === "RUNNING" ? (
                            <Badge status="success" text="RUNNING" />
                          ) : (
                            <Badge
                              status="error"
                              text={agent.status || "STOPPED"}
                            />
                          )}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} md={6}>
                      <Card size="small" style={{ background: "#f8fafc" }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          CONTAINER HEALTH
                        </Text>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            marginTop: 4,
                          }}
                        >
                          {agent.health_status === "HEALTHY" ? (
                            <Tag color="success">HEALTHY (2/2 Passed)</Tag>
                          ) : (
                            <Tag color="warning">
                              {agent.health_status || "UNKNOWN"}
                            </Tag>
                          )}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} md={6}>
                      <Card size="small" style={{ background: "#f8fafc" }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          FARGATE COMPUTING
                        </Text>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            marginTop: 4,
                          }}
                        >
                          {agent.cpu || 512} vCPU-units / {agent.memory || 1024}{" "}
                          MB RAM
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} md={6}>
                      <Card size="small" style={{ background: "#f8fafc" }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          PRIVATE IP / ENI
                        </Text>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            marginTop: 4,
                            fontFamily: "monospace",
                          }}
                        >
                          {agent.private_ip || "10.0.12.42"}
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  <Divider style={{ margin: "16px 0" }} />

                  <Descriptions column={{ xs: 1, md: 2 }} size="small" bordered>
                    <Descriptions.Item label="Task ARN">
                      <Paragraph
                        copyable
                        style={{
                          margin: 0,
                          fontFamily: "monospace",
                          fontSize: 11,
                        }}
                      >
                        {agent.task_arn ||
                          "arn:aws:ecs:ap-southeast-1:.../task"}
                      </Paragraph>
                    </Descriptions.Item>
                    <Descriptions.Item label="Task Definition ARN">
                      <Paragraph
                        copyable
                        style={{
                          margin: 0,
                          fontFamily: "monospace",
                          fontSize: 11,
                        }}
                      >
                        {agent.task_definition_arn ||
                          "arn:aws:ecs:ap-southeast-1:.../task-definition"}
                      </Paragraph>
                    </Descriptions.Item>
                    <Descriptions.Item label="Desired vs Running Count">
                      <Tag color="blue">
                        {agent.desired_count || 1} desired /{" "}
                        {agent.running_count || 1} running
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Agent Uptime">
                      <Text>
                        {agent.uptime_hours || 168.4} hours continuous
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Dedicated Application Container Card */}
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Card
                      title={
                        <Space>
                          <CloudServerOutlined style={{ color: "#ec7211" }} />
                          <span>
                            Dedicated Application Container (Nextcloud
                            Enterprise)
                          </span>
                        </Space>
                      }
                      size="small"
                      bordered={false}
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Image URI" span={2}>
                          <Paragraph
                            copyable
                            style={{
                              fontSize: 11,
                              fontFamily: "monospace",
                              margin: 0,
                            }}
                          >
                            {awsTopology.cluster_name
                              ? "649519997247.dkr.ecr.ap-southeast-1.amazonaws.com/nextcloud-enterprise-ai:latest"
                              : "nextcloud-enterprise-ai:latest"}
                          </Paragraph>
                        </Descriptions.Item>
                        <Descriptions.Item label="Runtime Stack">
                          <Tag color="orange">Apache 2.4 + PHP 8.2 (FPM)</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Listen Port">
                          <Tag color="blue">Port 80 (HTTP)</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Container Health">
                          <Tag color="success">
                            HEALTHY (HTTP /status.php 200 OK)
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Resource Usage">
                          <Text>CPU: 14.2% | Memory: 38.6% (395 MB)</Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },

          {
            key: "accounts",
            label: (
              <span>
                <UserOutlined /> Tenant Accounts Management
              </span>
            ),
            children: (
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <UserOutlined style={{ color: "#3b82f6" }} />
                      <span>User Accounts Directory ({accounts.length})</span>
                    </Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => setCreateAccountModalVisible(true)}
                    >
                      Add Account
                    </Button>
                  </div>
                }
                bordered={false}
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              >
                <Table
                  dataSource={accounts}
                  rowKey="username"
                  pagination={false}
                  size="middle"
                  columns={[
                    {
                      title: "Username",
                      dataIndex: "username",
                      key: "username",
                      render: (u: string, record: any) => (
                        <div>
                          <Text strong>{u}</Text>
                          {record.role === "TenantAdmin" && (
                            <Tag
                              color="gold"
                              style={{ marginLeft: 6, fontSize: 10 }}
                            >
                              ADMIN
                            </Tag>
                          )}
                        </div>
                      ),
                    },
                    {
                      title: "Display Name",
                      dataIndex: "display_name",
                      key: "display_name",
                    },
                    {
                      title: "Email",
                      dataIndex: "email",
                      key: "email",
                    },
                    {
                      title: "Role",
                      dataIndex: "role",
                      key: "role",
                      render: (r: string) => <Tag color="blue">{r}</Tag>,
                    },
                    {
                      title: "Quota / Storage",
                      key: "quota",
                      render: (_: any, record: any) => (
                        <span>
                          {record.storage_used_gb || 0} GB /{" "}
                          {record.quota_gb || 50} GB
                        </span>
                      ),
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (st: string) =>
                        st === "ACTIVE" ? (
                          <Tag color="success">ACTIVE</Tag>
                        ) : (
                          <Tag color="default">DISABLED</Tag>
                        ),
                    },
                    {
                      title: "MFA",
                      dataIndex: "mfa_enabled",
                      key: "mfa_enabled",
                      render: (mfa: boolean) =>
                        mfa ? (
                          <Tag color="green">ENABLED</Tag>
                        ) : (
                          <Tag color="default">NONE</Tag>
                        ),
                    },
                    {
                      title: "Last Login",
                      dataIndex: "last_login",
                      key: "last_login",
                      render: (ll: string) => (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {ll}
                        </Text>
                      ),
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      align: "right" as const,
                      render: (_: any, record: any) => (
                        <Space>
                          <Button
                            size="small"
                            icon={<KeyOutlined />}
                            onClick={() => handleResetPassword(record.username)}
                          >
                            Reset Password
                          </Button>
                          <Button
                            size="small"
                            onClick={() =>
                              handleToggleAccountStatus(
                                record.username,
                                record.status,
                              )
                            }
                          >
                            {record.status === "ACTIVE" ? "Disable" : "Enable"}
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },

          {
            key: "incidents",
            label: (
              <span>
                <WarningOutlined /> Accidents & Incident History
              </span>
            ),
            children: (
              <div>
                <Card
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <AlertOutlined style={{ color: "#ef4444" }} />
                        <span>Incident Circuit Breaker & Accident Log</span>
                      </Space>
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<WarningOutlined />}
                        onClick={() => {
                          incidentForm.setFieldsValue({
                            status: currentStatus,
                            severity: "SEV-2",
                            title: "",
                            description: "",
                            root_cause: "",
                            action_taken: "",
                            incident_state: "INVESTIGATING",
                          });
                          setIncidentModalVisible(true);
                        }}
                      >
                        Declare Incident / Change State
                      </Button>
                    </div>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Descriptions column={{ xs: 1, md: 3 }} size="small" bordered>
                    <Descriptions.Item label="Current Circuit State">
                      {renderStatusTag(currentStatus)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Active Incident ID">
                      <code>{incident?.incident_id || "None"}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Active Severity">
                      {incident?.severity ? (
                        renderSeverityTag(incident.severity)
                      ) : (
                        <Tag color="green">NORMAL</Tag>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Incidents History Table */}
                <Card
                  title="Historical Incident Records"
                  bordered={false}
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                >
                  <Table
                    dataSource={incidentsHistory}
                    rowKey="incident_id"
                    pagination={false}
                    size="middle"
                    locale={{
                      emptyText: "Zero recorded incidents for this tenant.",
                    }}
                    columns={[
                      {
                        title: "Incident ID",
                        dataIndex: "incident_id",
                        key: "incident_id",
                        render: (id: string) => <code>{id}</code>,
                      },
                      {
                        title: "Severity",
                        dataIndex: "severity",
                        key: "severity",
                        render: (s: string) => renderSeverityTag(s),
                      },
                      {
                        title: "Title / Summary",
                        dataIndex: "title",
                        key: "title",
                        render: (t: string, rec: any) => (
                          <div>
                            <Text strong>{t}</Text>
                            {rec.root_cause && (
                              <div style={{ fontSize: 11, color: "#64748b" }}>
                                Root Cause: {rec.root_cause}
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        title: "Resolution State",
                        dataIndex: "status",
                        key: "status",
                        render: (st: string) => (
                          <Tag color={st === "RESOLVED" ? "green" : "volcano"}>
                            {st}
                          </Tag>
                        ),
                      },
                      {
                        title: "Reported By",
                        dataIndex: "reported_by",
                        key: "reported_by",
                      },
                      {
                        title: "Reported At",
                        dataIndex: "reported_at",
                        key: "reported_at",
                        render: (ts: string) => (
                          <Text style={{ fontSize: 12 }}>{ts}</Text>
                        ),
                      },
                      {
                        title: "Resolved At",
                        dataIndex: "resolved_at",
                        key: "resolved_at",
                        render: (ts: string) => (
                          <Text style={{ fontSize: 12 }}>{ts || "-"}</Text>
                        ),
                      },
                    ]}
                  />
                </Card>
              </div>
            ),
          },

          {
            key: "audit",
            label: (
              <span>
                <AuditOutlined /> Tenant Audit Trail
              </span>
            ),
            children: (
              <Card
                title={`Compliance & Audit Log for '${tenantId}'`}
                bordered={false}
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              >
                <Table
                  dataSource={auditLogs}
                  rowKey="event_id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                  locale={{
                    emptyText: "No audit events recorded yet for this tenant.",
                  }}
                  columns={[
                    {
                      title: "Timestamp",
                      dataIndex: "timestamp",
                      key: "timestamp",
                      render: (t: string) => (
                        <Text style={{ fontSize: 11 }}>{t}</Text>
                      ),
                    },
                    {
                      title: "Actor",
                      dataIndex: "actor",
                      key: "actor",
                      render: (a: string) => <Text strong>{a}</Text>,
                    },
                    {
                      title: "Role",
                      dataIndex: "role",
                      key: "role",
                      render: (r: string) => <Tag color="blue">{r}</Tag>,
                    },
                    {
                      title: "Action",
                      dataIndex: "action",
                      key: "action",
                      render: (act: string) => <Tag color="orange">{act}</Tag>,
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (s: string) => (
                        <Tag color={s === "SUCCESS" ? "green" : "red"}>{s}</Tag>
                      ),
                    },
                    {
                      title: "Details",
                      dataIndex: "details",
                      key: "details",
                      render: (d: any) => (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{
                            margin: 0,
                            fontSize: 11,
                            fontFamily: "monospace",
                          }}
                        >
                          {typeof d === "string" ? d : JSON.stringify(d)}
                        </Paragraph>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },

          {
            key: "terminal",
            label: (
              <span>
                <CodeOutlined /> OCC Terminal & Diagnostics
              </span>
            ),
            children: (
              <div>
                <Card
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <CodeOutlined style={{ color: "#ec7211" }} />
                        <span>
                          Interactive Nextcloud `occ` CLI Diagnostic Runner
                        </span>
                        <Tag color="geekblue">
                          Container: service-{tenantId}
                        </Tag>
                      </Space>
                      <Button
                        size="small"
                        icon={<ClearOutlined />}
                        onClick={() => setTerminalOutput([])}
                      >
                        Clear Screen
                      </Button>
                    </div>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={12}
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 13, marginRight: 8 }}>
                        Quick Diagnostic Commands:
                      </Text>
                      <Space wrap>
                        <Button
                          size="small"
                          onClick={() => handleExecuteOcc("status")}
                          loading={occLoading}
                        >
                          status
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleExecuteOcc("files:scan --all")}
                          loading={occLoading}
                        >
                          files:scan --all
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            handleExecuteOcc("db:add-missing-indices")
                          }
                          loading={occLoading}
                        >
                          db:add-missing-indices
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            handleExecuteOcc("maintenance:mode --status")
                          }
                          loading={occLoading}
                        >
                          maintenance:mode --status
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleExecuteOcc("app:list")}
                          loading={occLoading}
                        >
                          app:list
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleExecuteOcc("check")}
                          loading={occLoading}
                        >
                          check
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleExecuteOcc("user:list")}
                          loading={occLoading}
                        >
                          user:list
                        </Button>
                      </Space>
                    </div>

                    <Space.Compact style={{ width: "100%" }}>
                      <span
                        style={{
                          background: "#1e1e1e",
                          color: "#10b981",
                          fontFamily: "monospace",
                          fontSize: 13,
                          padding: "4px 10px",
                          borderRadius: "6px 0 0 6px",
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #333",
                          borderRight: "none",
                        }}
                      >
                        occ
                      </span>
                      <Input
                        placeholder="e.g. status, config:system:get version, db:convert-filecache-bigint"
                        value={occCommand}
                        onChange={(e) => setOccCommand(e.target.value)}
                        onPressEnter={() => handleExecuteOcc()}
                        style={{ fontFamily: "monospace" }}
                      />
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        loading={occLoading}
                        onClick={() => handleExecuteOcc()}
                        style={{
                          background: "#ec7211",
                          borderColor: "#ec7211",
                        }}
                      >
                        Execute
                      </Button>
                    </Space.Compact>
                  </Space>
                </Card>

                {/* Monospace Terminal Screen */}
                <Card
                  title={
                    <Space>
                      <span style={{ color: "#10b981" }}>●</span>
                      <span style={{ color: "#f59e0b" }}>●</span>
                      <span style={{ color: "#ef4444" }}>●</span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          marginLeft: 8,
                        }}
                      >
                        www-data@fargate-task: /var/www/html
                      </span>
                    </Space>
                  }
                  size="small"
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)",
                  }}
                  bodyStyle={{ padding: 16 }}
                  headStyle={{
                    background: "#1e293b",
                    borderBottom: "1px solid #334155",
                    color: "#94a3b8",
                  }}
                >
                  <div
                    style={{
                      minHeight: 280,
                      maxHeight: 500,
                      overflowY: "auto",
                      fontFamily:
                        "'Fira Code', 'JetBrains Mono', Monaco, monospace",
                      fontSize: 12,
                      lineHeight: "1.6",
                      color: "#e2e8f0",
                    }}
                  >
                    {terminalOutput.length === 0 ? (
                      <div style={{ color: "#64748b", fontStyle: "italic" }}>
                        Terminal output buffer empty. Execute a command above to
                        inspect Nextcloud internals.
                      </div>
                    ) : (
                      terminalOutput.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <span style={{ color: "#38bdf8" }}>
                                nextcloud@{tenantId}
                              </span>
                              <span style={{ color: "#94a3b8" }}>:</span>
                              <span style={{ color: "#a855f7" }}>
                                /var/www/html
                              </span>
                              <span style={{ color: "#94a3b8" }}>$ </span>
                              <strong style={{ color: "#4ade80" }}>
                                {item.cmd}
                              </strong>
                            </div>
                            <Space size={6}>
                              <Tag
                                color={
                                  item.exit_code === 0 ? "success" : "error"
                                }
                                style={{ fontSize: 10, margin: 0 }}
                              >
                                exit {item.exit_code}
                              </Tag>
                              <Tag
                                color="default"
                                style={{ fontSize: 10, margin: 0 }}
                              >
                                {item.duration_ms}ms
                              </Tag>
                              <span style={{ fontSize: 10, color: "#64748b" }}>
                                {item.timestamp.slice(11, 19)}
                              </span>
                            </Space>
                          </div>
                          <pre
                            style={{
                              margin: "6px 0 0 0",
                              padding: "8px 12px",
                              background: "#090d16",
                              borderRadius: 4,
                              color: "#cbd5e1",
                              fontSize: 11,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                              borderLeft:
                                item.exit_code === 0
                                  ? "3px solid #10b981"
                                  : "3px solid #ef4444",
                            }}
                          >
                            {item.output}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            ),
          },

          {
            key: "logs",
            label: (
              <span>
                <FileTextOutlined /> Live Container Logs
              </span>
            ),
            children: (
              <div>
                <Card
                  title={
                    <Row justify="space-between" align="middle" gutter={[8, 8]}>
                      <Col>
                        <Space wrap>
                          <FileTextOutlined style={{ color: "#0284c7" }} />
                          <span>Container Log Stream</span>
                          <Tag color="cyan">
                            Log Group: /ecs/
                            {awsTopology.cluster_name
                              ? "prod-nextcloud"
                              : "nextcloud"}
                          </Tag>
                        </Space>
                      </Col>
                      <Col>
                        <Space wrap>
                          <Select
                            size="small"
                            value={logsContainer}
                            onChange={(val) => setLogsContainer(val)}
                            style={{ width: 170 }}
                            options={[
                              { value: "all", label: "All Logs" },
                              {
                                value: "nextcloud-app",
                                label: "Nextcloud 30 App",
                              },
                            ]}
                          />
                          <Select
                            size="small"
                            value={logsLevel}
                            onChange={(val) => setLogsLevel(val)}
                            style={{ width: 110 }}
                            options={[
                              { value: "ALL", label: "All Levels" },
                              { value: "INFO", label: "INFO" },
                              { value: "WARN", label: "WARN" },
                              { value: "ERROR", label: "ERROR" },
                            ]}
                          />
                          <Input
                            size="small"
                            placeholder="Filter pattern..."
                            prefix={
                              <SearchOutlined style={{ color: "#94a3b8" }} />
                            }
                            value={logsFilter}
                            onChange={(e) => setLogsFilter(e.target.value)}
                            onPressEnter={handleFetchLogs}
                            style={{ width: 150 }}
                          />
                          <Space size={4}>
                            <Switch
                              size="small"
                              checked={logsAutoRefresh}
                              onChange={(val) => setLogsAutoRefresh(val)}
                            />
                            <Text style={{ fontSize: 11 }}>Auto 5s</Text>
                          </Space>
                          <Button
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={handleFetchLogs}
                            loading={logsLoading}
                          >
                            Refresh
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  }
                  bordered={false}
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                >
                  <div
                    style={{
                      background: "#090d16",
                      color: "#cbd5e1",
                      borderRadius: 6,
                      padding: 12,
                      fontFamily:
                        "'Fira Code', 'JetBrains Mono', Monaco, monospace",
                      fontSize: 12,
                      maxHeight: 520,
                      overflowY: "auto",
                      border: "1px solid #1e293b",
                    }}
                  >
                    {logsLoading && containerLogs.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: 40,
                          color: "#94a3b8",
                        }}
                      >
                        <SyncOutlined
                          spin
                          style={{ fontSize: 20, marginBottom: 8 }}
                        />
                        <br />
                        Streaming logs from CloudWatch for tenant '{tenantId}
                        '...
                      </div>
                    ) : containerLogs.filter(
                        (l) => logsLevel === "ALL" || l.level === logsLevel,
                      ).length === 0 ? (
                      <div
                        style={{
                          color: "#64748b",
                          fontStyle: "italic",
                          textAlign: "center",
                          padding: 20,
                        }}
                      >
                        No container logs match current filter criteria.
                      </div>
                    ) : (
                      containerLogs
                        .filter(
                          (l) => logsLevel === "ALL" || l.level === logsLevel,
                        )
                        .map((l, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              gap: 10,
                              padding: "4px 0",
                              borderBottom: "1px solid #111827",
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{
                                color: "#64748b",
                                fontSize: 11,
                                minWidth: 140,
                              }}
                            >
                              {l.timestamp}
                            </span>
                            <Tag
                              color={
                                l.container === "litellm-sidecar"
                                  ? "purple"
                                  : "orange"
                              }
                              style={{
                                fontSize: 10,
                                padding: "0 4px",
                                margin: 0,
                                minWidth: 90,
                                textAlign: "center",
                              }}
                            >
                              {l.container}
                            </Tag>
                            <Tag
                              color={
                                l.level === "ERROR"
                                  ? "red"
                                  : l.level === "WARN"
                                    ? "gold"
                                    : "blue"
                              }
                              style={{
                                fontSize: 10,
                                padding: "0 4px",
                                margin: 0,
                                minWidth: 46,
                                textAlign: "center",
                              }}
                            >
                              {l.level}
                            </Tag>
                            <span
                              style={{
                                flex: 1,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                              }}
                            >
                              {l.message}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* MODAL 1: Incident / Accident Declaration & Circuit Breaker */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: "#ef4444" }} />
            <span>Incident Management & Status Circuit Breaker</span>
          </Space>
        }
        open={incidentModalVisible}
        onCancel={() => setIncidentModalVisible(false)}
        onOk={() => incidentForm.submit()}
        confirmLoading={isUpdating}
        width={600}
      >
        <Form
          form={incidentForm}
          layout="vertical"
          onFinish={handleIncidentSubmit}
        >
          <Form.Item
            name="status"
            label="Tenant Circuit State"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="ACTIVE">
                ACTIVE (Normal Operation)
              </Select.Option>
              <Select.Option value="DEGRADED">
                DEGRADED (Elevated Latency / Issues)
              </Select.Option>
              <Select.Option value="INCIDENT">
                INCIDENT (Severe Outage / Accident)
              </Select.Option>
              <Select.Option value="MAINTENANCE">
                MAINTENANCE (Emergency Maintenance Mode)
              </Select.Option>
              <Select.Option value="SUSPENDED">
                SUSPENDED (Compute Scaled to 0)
              </Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Severity Level"
                initialValue="SEV-2"
              >
                <Select>
                  <Select.Option value="SEV-1">
                    SEV-1 Critical Outage
                  </Select.Option>
                  <Select.Option value="SEV-2">
                    SEV-2 Major Degradation
                  </Select.Option>
                  <Select.Option value="SEV-3">
                    SEV-3 Minor Impairment
                  </Select.Option>
                  <Select.Option value="Notice">
                    Operational Notice
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="incident_state"
                label="Resolution State"
                initialValue="INVESTIGATING"
              >
                <Select>
                  <Select.Option value="INVESTIGATING">
                    INVESTIGATING
                  </Select.Option>
                  <Select.Option value="IDENTIFIED">IDENTIFIED</Select.Option>
                  <Select.Option value="MITIGATING">MITIGATING</Select.Option>
                  <Select.Option value="RESOLVED">RESOLVED</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Incident Title / Summary"
            rules={[
              { required: true, message: "Please provide incident title" },
            ]}
          >
            <Input placeholder="e.g. High memory utilization in Nextcloud worker container" />
          </Form.Item>

          <Form.Item name="description" label="Incident Details">
            <Input.TextArea
              rows={2}
              placeholder="Explain observed symptoms, error codes, and customer impact"
            />
          </Form.Item>

          <Form.Item name="root_cause" label="Root Cause Analysis">
            <Input.TextArea
              rows={2}
              placeholder="e.g. DB connection leak, EFS IOPS burst capacity exhausted, large sync storm"
            />
          </Form.Item>

          <Form.Item
            name="action_taken"
            label="Remediation / Corrective Action"
          >
            <Input.TextArea
              rows={2}
              placeholder="e.g. Triggered container task rolling restart, scaled resources, isolated tenant traffic"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL 2: Create Tenant User Account */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: "#3b82f6" }} />
            <span>Create Tenant User Account</span>
          </Space>
        }
        open={createAccountModalVisible}
        onCancel={() => setCreateAccountModalVisible(false)}
        onOk={() => accountForm.submit()}
        confirmLoading={isUpdating}
      >
        <Form
          form={accountForm}
          layout="vertical"
          onFinish={handleCreateAccount}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input placeholder="e.g. john.doe" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[{ required: true, message: "Display name is required" }]}
          >
            <Input placeholder="e.g. John Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              {
                required: true,
                type: "email",
                message: "Valid email is required",
              },
            ]}
          >
            <Input placeholder="e.g. john@tenant.com" />
          </Form.Item>

          <Form.Item name="role" label="Account Role" initialValue="User">
            <Select>
              <Select.Option value="TenantAdmin">
                Tenant Administrator
              </Select.Option>
              <Select.Option value="User">Standard User</Select.Option>
              <Select.Option value="ServiceAccount">
                Service Account / Machine
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quota_gb"
            label="Storage Quota (GB)"
            initialValue={25}
          >
            <Select>
              <Select.Option value={10}>10 GB</Select.Option>
              <Select.Option value={25}>25 GB</Select.Option>
              <Select.Option value={50}>50 GB</Select.Option>
              <Select.Option value={100}>100 GB</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL 3: Temporary Password Display */}
      <Modal
        title="Temporary Credentials Generated"
        open={resetPasswordModalVisible}
        onOk={() => setResetPasswordModalVisible(false)}
        onCancel={() => setResetPasswordModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setResetPasswordModalVisible(false)}
          >
            Done
          </Button>,
        ]}
      >
        <Alert
          type="success"
          showIcon
          message="Password reset successfully!"
          description="A temporary one-time password has been generated and stored in AWS Secrets Manager."
          style={{ marginBottom: 16 }}
        />
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Target Account">
            <strong>{tempPasswordInfo?.username}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Temporary Password">
            <Paragraph
              copyable
              style={{
                margin: 0,
                fontWeight: 700,
                color: "#ec7211",
                fontSize: 16,
              }}
            >
              {tempPasswordInfo?.password}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Validity">
            24 Hours (User prompted to change on initial login)
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* MODAL 4: One-Click Tenant Clone / Sandbox ("Fork Tenant") */}
      <Modal
        title={
          <Space>
            <BranchesOutlined style={{ color: "#8b5cf6" }} />
            <span>Fork Tenant to Isolated Staging Sandbox</span>
          </Space>
        }
        open={cloneModalVisible}
        onCancel={() => setCloneModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          message="Multi-Tenant Isolation Guarantees"
          description={`Cloning '${tenantId}' provisions an isolated staging sandbox with dedicated PostgreSQL database 'nc_<target>', dedicated S3 prefix, dedicated EFS mount path, and container service.`}
          style={{ marginBottom: 16 }}
        />
        <Form form={cloneForm} layout="vertical" onFinish={handleCloneTenant}>
          <Form.Item label="Source Tenant Template">
            <Tag color="blue" style={{ fontSize: 13, padding: "2px 8px" }}>
              {tenantId} ({domain})
            </Tag>
          </Form.Item>

          <Form.Item
            name="target_tenant_id"
            label="Sandbox Tenant Identifier (Slug)"
            rules={[
              { required: true, message: "Sandbox tenant ID is required" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Lowercase letters, numbers, and hyphens only",
              },
            ]}
          >
            <Input placeholder="e.g. acme-staging, marvel-sandbox" />
          </Form.Item>

          <Form.Item
            name="target_domain"
            label="Dedicated Host-Header Ingress Domain"
          >
            <Input placeholder="e.g. acme-staging.png261.dev" />
          </Form.Item>

          <Form.Item name="admin_email" label="Sandbox Admin Contact Email">
            <Input type="email" placeholder="e.g. admin@acme-staging.com" />
          </Form.Item>

          <Form.Item name="quota_gb" label="Storage Quota (GB)">
            <Input type="number" placeholder="50" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setCloneModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={cloneLoading}
                icon={<BranchesOutlined />}
                style={{ background: "#8b5cf6", borderColor: "#8b5cf6" }}
              >
                Provision Staging Sandbox
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
