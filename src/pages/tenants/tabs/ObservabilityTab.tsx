import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Space,
  Tag,
  Select,
  Input,
  Switch,
  Button,
  Typography,
  Table,
  Timeline,
  Alert,
  Tooltip,
  Badge,
  Progress,
} from "antd";
import {
  ApartmentOutlined,
  BranchesOutlined,
  SearchOutlined,
  ReloadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { dataProvider } from "../../../providers/dataProvider";

const { Text } = Typography;

export interface ObservabilityTabProps {
  tenantId: string;
}

export const ObservabilityTab: React.FC<ObservabilityTabProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [workflowFilter, setWorkflowFilter] = useState<string>("ALL");
  const [selectedExecutionArn, setSelectedExecutionArn] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState("");
  const [logLevel, setLogLevel] = useState("ALL");

  const [obsData, setObsData] = useState<any>({
    region: "ap-southeast-1",
    environment: "prod",
    log_group: "/aws/vendedlogs/states/prod-storix-sfn",
    tracing_enabled: true,
    state_machines: [],
    executions: [],
    selected_execution: null,
    execution_history: [],
    logs: [],
    traces: [],
    console_links: {},
  });

  const [liveStream, setLiveStream] = useState<any>(null);

  const fetchLiveStream = useCallback(
    async (execArn?: string) => {
      if (!dataProvider.custom) return;
      try {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "STREAM_SFN_PROGRESS",
            tenant_id: tenantId,
            execution_arn: execArn || selectedExecutionArn || undefined,
          },
        });
        if (res.data) {
          setLiveStream(res.data);
        }
      } catch {
        // Fallback gracefully
      }
    },
    [tenantId, selectedExecutionArn]
  );

  const fetchData = useCallback(
    async (execArn?: string) => {
      if (!dataProvider.custom) return;
      setLoading(true);
      try {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "GET_SFN_OBSERVABILITY",
            tenant_id: tenantId,
            execution_arn: execArn || selectedExecutionArn || undefined,
            limit: 30,
          },
        });
        if (res.data) {
          setObsData(res.data);
          if (!selectedExecutionArn && res.data.executions?.length > 0) {
            setSelectedExecutionArn(res.data.executions[0].executionArn);
          }
        }
      } catch (err: any) {
        console.warn("Notice fetching Step Functions observability:", err);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, selectedExecutionArn]
  );

  useEffect(() => {
    fetchData();
    fetchLiveStream();
  }, [fetchData, fetchLiveStream]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
      fetchLiveStream();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData, fetchLiveStream]);

  const handleSelectExecution = (arn: string) => {
    setSelectedExecutionArn(arn);
    fetchData(arn);
    fetchLiveStream(arn);
  };

  const executions = (obsData.executions || []).filter((ex: any) => {
    if (workflowFilter === "ALL") return true;
    return ex.workflowType === workflowFilter;
  });

  const logs = (obsData.logs || []).filter((l: any) => {
    if (logLevel !== "ALL" && l.level !== logLevel) return false;
    if (logFilter && !l.message?.toLowerCase().includes(logFilter.toLowerCase())) return false;
    return true;
  });

  const renderStatusTag = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCEEDED":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            SUCCEEDED
          </Tag>
        );
      case "RUNNING":
        return (
          <Tag color="processing" icon={<SyncOutlined spin />}>
            RUNNING
          </Tag>
        );
      case "FAILED":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            FAILED
          </Tag>
        );
      case "TIMED_OUT":
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            TIMED_OUT
          </Tag>
        );
      default:
        return <Tag>{status || "UNKNOWN"}</Tag>;
    }
  };

  return (
    <div>
      {/* 1. Header Overview & Deep Links Banner */}
      <Card
        variant="borderless"
        style={{
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderRadius: 8,
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Space direction="vertical" size={4}>
              <Space align="center">
                <BranchesOutlined style={{ fontSize: 20, color: "#1652f0" }} />
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Step Functions Orchestration & X-Ray Distributed Tracing
                </Typography.Title>
                <Badge
                  status="processing"
                  text={<span style={{ color: "#059669", fontWeight: 600 }}>Active Telemetry</span>}
                />
              </Space>
              <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                Live state transitions, execution step timeline, CloudWatch structured logs, and AWS
                X-Ray service traces for tenant <Text code>{tenantId}</Text>.
              </Typography.Paragraph>
            </Space>
          </Col>
          <Col xs={24} lg={10} style={{ textAlign: "right" }}>
            <Space wrap>
              <Switch
                checkedChildren="Auto 4s"
                unCheckedChildren="Auto Off"
                checked={autoRefresh}
                onChange={setAutoRefresh}
              />
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={() => fetchData()}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 1-Click AWS Deep Link Shortcuts */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
          <Space wrap size={[8, 8]}>
            <Text strong style={{ fontSize: 12, marginRight: 4 }}>
              AWS Management Console Links:
            </Text>
            {obsData.console_links?.step_functions && (
              <Button
                size="small"
                type="dashed"
                icon={<BranchesOutlined />}
                href={obsData.console_links.step_functions}
                target="_blank"
                rel="noreferrer"
              >
                Step Functions State Machines <LinkOutlined style={{ fontSize: 10 }} />
              </Button>
            )}
            {obsData.console_links?.cloudwatch_log_group && (
              <Button
                size="small"
                type="dashed"
                icon={<FileTextOutlined />}
                href={obsData.console_links.cloudwatch_log_group}
                target="_blank"
                rel="noreferrer"
              >
                CloudWatch SFN Log Group <LinkOutlined style={{ fontSize: 10 }} />
              </Button>
            )}
            {obsData.console_links?.cloudwatch_insights && (
              <Button
                size="small"
                type="dashed"
                icon={<DashboardOutlined />}
                href={obsData.console_links.cloudwatch_insights}
                target="_blank"
                rel="noreferrer"
              >
                CloudWatch Log Insights <LinkOutlined style={{ fontSize: 10 }} />
              </Button>
            )}
            {obsData.console_links?.xray_traces && (
              <Button
                size="small"
                type="dashed"
                icon={<ThunderboltOutlined style={{ color: "#d97706" }} />}
                href={obsData.console_links.xray_traces}
                target="_blank"
                rel="noreferrer"
              >
                AWS X-Ray Trace Map <LinkOutlined style={{ fontSize: 10 }} />
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Real-time State Machine Lifecycle Visualizer */}
      <Card
        variant="borderless"
        style={{
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderLeft: "4px solid #1652f0",
          background: "#ffffff",
        }}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space>
              <ThunderboltOutlined style={{ color: "#1652f0" }} />
              <span style={{ fontWeight: 600 }}>State Machine Lifecycle Visualizer</span>
              {liveStream?.status === "RUNNING" ? (
                <Tag color="processing" icon={<SyncOutlined spin />}>
                  Live Stream Active
                </Tag>
              ) : (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Synchronized
                </Tag>
              )}
            </Space>
            {liveStream && (
              <Space size={14}>
                {liveStream.elapsedSeconds !== undefined && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Elapsed: <Text strong>{liveStream.elapsedSeconds}s</Text>
                  </Text>
                )}
                {liveStream.estimatedRemainingSeconds > 0 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Est. Remaining: <Text strong>~{liveStream.estimatedRemainingSeconds}s</Text>
                  </Text>
                )}
              </Space>
            )}
          </div>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text strong style={{ fontSize: 14 }}>
                Current Active Step:{" "}
                <span style={{ color: "#1652f0" }}>
                  {liveStream?.currentStep || "Workflow Completed & Operational"}
                </span>
              </Text>
              {liveStream?.currentStepDescription && (
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  {liveStream.currentStepDescription}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <Text strong style={{ fontSize: 16 }}>
                {liveStream?.progress ?? 100}%
              </Text>
            </div>
          </div>

          <Progress
            percent={liveStream?.progress ?? 100}
            status={
              liveStream?.status === "FAILED"
                ? "exception"
                : liveStream?.status === "RUNNING"
                  ? "active"
                  : "success"
            }
            strokeColor={{ "0%": "#1652f0", "100%": "#52c41a" }}
          />

          <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
            {(
              liveStream?.milestones || [
                { id: "VALIDATE", name: "Validation", percent: 15, status: "completed", description: "Validate tenant parameters & initialize DynamoDB" },
                { id: "DATABASE", name: "Postgres Isolation", percent: 35, status: "completed", description: "Create isolated database schema" },
                { id: "STORAGE", name: "EFS Storage", percent: 55, status: "completed", description: "Provision dedicated EFS access point" },
                { id: "COMPUTE", name: "ECS Task", percent: 75, status: "completed", description: "Register container task definition & service" },
                { id: "HEALTH_CHECK", name: "Health Probe", percent: 90, status: "completed", description: "Verify container health check probe" },
                { id: "ACTIVE", name: "Ready & Active", percent: 100, status: "completed", description: "Tenant operational and ready for use" },
              ]
            ).map((m: any) => {
              const isDone = m.status === "completed";
              const isActive = m.status === "active";
              const isError = m.status === "error";

              let badgeBg = "#f8fafc";
              let badgeBorder = "#e2e8f0";
              let badgeColor = "#64748b";

              if (isDone) {
                badgeBg = "#f6ffed";
                badgeBorder = "#b7eb8f";
                badgeColor = "#389e0d";
              } else if (isActive) {
                badgeBg = "#e6f4ff";
                badgeBorder = "#91caff";
                badgeColor = "#0958d9";
              } else if (isError) {
                badgeBg = "#fff1f0";
                badgeBorder = "#ffa39e";
                badgeColor = "#cf1322";
              }

              return (
                <Col xs={12} sm={8} md={4} key={m.id}>
                  <Tooltip title={m.description}>
                    <div
                      style={{
                        background: badgeBg,
                        border: `1px solid ${badgeBorder}`,
                        borderRadius: 6,
                        padding: "8px 6px",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: badgeColor }}>
                        {isDone && <CheckCircleFilled style={{ marginRight: 4, color: "#52c41a" }} />}
                        {isActive && <LoadingOutlined style={{ marginRight: 4, color: "#1652f0" }} />}
                        {isError && <InfoCircleOutlined style={{ marginRight: 4, color: "#ff4d4f" }} />}
                        {m.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{m.percent}%</div>
                    </div>
                  </Tooltip>
                </Col>
              );
            })}
          </Row>
        </Space>
      </Card>

      {/* 2. Step Functions Workflow Executions Table */}
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space>
              <ApartmentOutlined style={{ color: "#1652f0" }} />
              <span>Step Functions Workflow Executions ({executions.length})</span>
            </Space>
            <Select
              value={workflowFilter}
              onChange={setWorkflowFilter}
              style={{ width: 220 }}
              size="small"
              options={[
                { value: "ALL", label: "All Workflows" },
                { value: "PROVISION", label: "Tenant Provisioning" },
                { value: "SEED", label: "Tenant Seeding" },
                { value: "DEMO", label: "Demo Provision & Seed" },
                { value: "SUSPEND", label: "Tenant Suspend" },
                { value: "RESUME", label: "Tenant Resume" },
                { value: "DEPROVISION", label: "Tenant Deprovision" },
                { value: "FLEET_UPGRADE", label: "Fleet Rolling Upgrade" },
              ]}
            />
          </div>
        }
        variant="borderless"
        style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Table
          dataSource={executions}
          rowKey="executionArn"
          size="small"
          pagination={{ pageSize: 5 }}
          rowClassName={(record) =>
            record.executionArn === selectedExecutionArn ? "ant-table-row-selected" : ""
          }
          onRow={(record) => ({
            onClick: () => handleSelectExecution(record.executionArn),
            style: { cursor: "pointer" },
          })}
          columns={[
            {
              title: "Execution Name",
              dataIndex: "name",
              key: "name",
              render: (name: string, record: any) => (
                <Space direction="vertical" size={1}>
                  <Text
                    strong
                    style={{
                      color: record.executionArn === selectedExecutionArn ? "#1652f0" : "inherit",
                    }}
                  >
                    {name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {record.stateMachineName}
                  </Text>
                </Space>
              ),
            },
            {
              title: "Workflow",
              dataIndex: "workflowType",
              key: "workflowType",
              render: (wType: string) => <Tag color="blue">{wType}</Tag>,
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: renderStatusTag,
            },
            {
              title: "Duration",
              dataIndex: "durationSeconds",
              key: "durationSeconds",
              render: (sec: number) => (sec ? `${sec}s` : "-"),
            },
            {
              title: "Started",
              dataIndex: "startDate",
              key: "startDate",
              render: (d: string) => (d ? new Date(d).toLocaleTimeString() : "-"),
            },
            {
              title: "Console Link",
              key: "deepLink",
              render: (_: any, record: any) => (
                <Space size={6}>
                  <Tooltip title="View in AWS Step Functions Console">
                    <Button
                      type="link"
                      size="small"
                      href={record.deepLinks?.sfnConsole}
                      target="_blank"
                      rel="noreferrer"
                      icon={<LinkOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Console
                    </Button>
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* 3. Selected Execution Detail & State Transition Timeline */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "#1652f0" }} />
                <span>Execution Timeline & State Graph</span>
              </Space>
            }
            variant="borderless"
            style={{ height: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            {obsData.execution_history?.length > 0 ? (
              <Timeline
                mode="left"
                style={{ marginTop: 12 }}
                items={obsData.execution_history.map((step: any) => ({
                  color:
                    step.type?.includes("Failed") || step.type?.includes("Error")
                      ? "red"
                      : step.type === "ExecutionSucceeded"
                        ? "green"
                        : "blue",
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13 }}>
                        {step.stepName || step.type}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {step.type} • {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : ""}
                      </Text>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Alert
                type="info"
                message="Select an execution from the table above to view state transition history."
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: "#1652f0" }} />
                <span>Execution I/O & X-Ray Context</span>
              </Space>
            }
            variant="borderless"
            style={{ height: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            {obsData.selected_execution ? (
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <div>
                  <Text strong>Execution ARN:</Text>
                  <br />
                  <Text copyable code style={{ fontSize: 11 }}>
                    {obsData.selected_execution.executionArn}
                  </Text>
                </div>
                {obsData.selected_execution.traceHeader && (
                  <div>
                    <Text strong>AWS X-Ray Trace Header:</Text>
                    <br />
                    <Text code style={{ fontSize: 11, color: "#d97706" }}>
                      {obsData.selected_execution.traceHeader}
                    </Text>
                  </div>
                )}
                <div>
                  <Text strong>Input Payload:</Text>
                  <pre
                    style={{
                      background: "#1e293b",
                      color: "#38bdf8",
                      padding: 10,
                      borderRadius: 6,
                      fontSize: 11,
                      maxHeight: 120,
                      overflowY: "auto",
                    }}
                  >
                    {(() => {
                      try {
                        return JSON.stringify(
                          JSON.parse(obsData.selected_execution.input || "{}"),
                          null,
                          2
                        );
                      } catch {
                        return obsData.selected_execution.input || "{}";
                      }
                    })()}
                  </pre>
                </div>
                <div>
                  <Text strong>Output Result:</Text>
                  <pre
                    style={{
                      background: "#1e293b",
                      color: "#4ade80",
                      padding: 10,
                      borderRadius: 6,
                      fontSize: 11,
                      maxHeight: 120,
                      overflowY: "auto",
                    }}
                  >
                    {(() => {
                      try {
                        return JSON.stringify(
                          JSON.parse(obsData.selected_execution.output || "{}"),
                          null,
                          2
                        );
                      } catch {
                        return obsData.selected_execution.output || "{}";
                      }
                    })()}
                  </pre>
                </div>
              </Space>
            ) : (
              <Alert type="info" message="No execution selected." />
            )}
          </Card>
        </Col>
      </Row>

      {/* 4. Live CloudWatch Execution Logs */}
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space>
              <FileTextOutlined style={{ color: "#1652f0" }} />
              <span>Step Functions CloudWatch Structured Logs ({logs.length})</span>
            </Space>
            <Space>
              <Input
                placeholder="Search logs..."
                prefix={<SearchOutlined />}
                size="small"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                allowClear
                style={{ width: 180 }}
              />
              <Select
                value={logLevel}
                onChange={setLogLevel}
                size="small"
                style={{ width: 100 }}
                options={[
                  { value: "ALL", label: "All Levels" },
                  { value: "INFO", label: "INFO" },
                  { value: "ERROR", label: "ERROR" },
                ]}
              />
            </Space>
          </div>
        }
        variant="borderless"
        style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <div
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            padding: 12,
            borderRadius: 6,
            fontFamily: "monospace",
            fontSize: 12,
            maxHeight: 280,
            overflowY: "auto",
            lineHeight: 1.6,
          }}
        >
          {logs.length > 0 ? (
            logs.map((log: any, idx: number) => {
              const isError = log.level === "ERROR";
              return (
                <div key={idx} style={{ marginBottom: 4, display: "flex", gap: 12 }}>
                  <span style={{ color: "#64748b", flexShrink: 0 }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "-"}
                  </span>
                  <span
                    style={{
                      color: isError ? "#f87171" : "#34d399",
                      fontWeight: 600,
                      flexShrink: 0,
                      width: 50,
                    }}
                  >
                    [{log.level}]
                  </span>
                  <span style={{ color: isError ? "#fca5a5" : "#f1f5f9", wordBreak: "break-all" }}>
                    {log.structured
                      ? `${log.structured.type || ""} - ${JSON.stringify(log.structured.details || log.structured)}`
                      : log.message}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
              No CloudWatch log events found for current filters.
            </div>
          )}
        </div>
      </Card>

      {/* 5. AWS X-Ray Tracing Telemetry */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: "#d97706" }} />
            <span>AWS X-Ray Distributed Traces</span>
          </Space>
        }
        variant="borderless"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Table
          dataSource={obsData.traces || []}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Trace ID",
              dataIndex: "id",
              key: "id",
              render: (id: string, record: any) => (
                <a
                  href={record.url || obsData.console_links?.xray_traces}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontFamily: "monospace", fontSize: 12 }}
                >
                  {id} <LinkOutlined style={{ fontSize: 10 }} />
                </a>
              ),
            },
            {
              title: "Latency / Duration",
              dataIndex: "duration",
              key: "duration",
              render: (dur: number) => (dur ? `${dur}s` : "-"),
            },
            {
              title: "Response Time",
              dataIndex: "responseTime",
              key: "responseTime",
              render: (rt: number) => (rt ? `${rt}s` : "-"),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (st: string) => {
                if (st === "FAULT") return <Tag color="error">FAULT</Tag>;
                if (st === "ERROR") return <Tag color="warning">ERROR</Tag>;
                return <Tag color="success">OK</Tag>;
              },
            },
            {
              title: "Service Nodes Traversed",
              dataIndex: "services",
              key: "services",
              render: (services: string[]) => (
                <Space wrap size={[4, 4]}>
                  {(services || []).map((s, idx) => (
                    <Tag key={idx} style={{ fontSize: 11 }}>
                      {s.replace("AWS::", "")}
                    </Tag>
                  ))}
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
