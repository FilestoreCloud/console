import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Steps,
  Progress,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Input,
  Select,
  Tooltip,
  Badge,
  Alert,
  Switch,
  message,
} from "antd";
import {
  SyncOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { dataProvider } from "../../../providers/dataProvider";

const { Text } = Typography;

export interface LogEntry {
  timestamp: string;
  source: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR" | string;
  message: string;
}

export interface MilestoneItem {
  id: string;
  name: string;
  description: string;
  percent: number;
  status: "completed" | "active" | "pending" | "error";
}

export interface TenantProgressModalProps {
  visible: boolean;
  onClose: () => void;
  tenantId: string | null;
  initialStatus?: string;
}

export const TenantProgressModal: React.FC<TenantProgressModalProps> = ({
  visible,
  onClose,
  tenantId,
  initialStatus = "PROVISIONING",
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    workflowType: string;
    status: string;
    progress: number;
    currentStep: string;
    currentStepDescription?: string;
    elapsedSeconds: number;
    estimatedRemainingSeconds: number;
    milestones: MilestoneItem[];
    logs: LogEntry[];
    executionArn?: string;
  } | null>(null);

  const [filterText, setFilterText] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchProgress = useCallback(async () => {
    if (!tenantId || !dataProvider.custom) return;
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "STREAM_SFN_PROGRESS",
          tenant_id: tenantId,
        },
      });
      if (res?.data) {
        setData({
          workflowType: res.data.workflowType || (initialStatus.includes("DEL") ? "DEPROVISION" : "PROVISION"),
          status: res.data.status || initialStatus,
          progress: Number(res.data.progress ?? 15),
          currentStep: res.data.currentStep || "Workflow in progress...",
          currentStepDescription: res.data.currentStepDescription,
          elapsedSeconds: Number(res.data.elapsedSeconds || 0),
          estimatedRemainingSeconds: Number(res.data.estimatedRemainingSeconds || 0),
          milestones: res.data.milestones || [],
          logs: res.data.logs || [],
          executionArn: res.data.executionArn,
        });
      }
    } catch (err: any) {
      console.warn("Error streaming SFN progress:", err);
    }
  }, [tenantId, initialStatus]);

  useEffect(() => {
    if (!visible || !tenantId) return;
    setLoading(true);
    fetchProgress().finally(() => setLoading(false));

    const interval = setInterval(fetchProgress, 2000);
    return () => clearInterval(interval);
  }, [visible, tenantId, fetchProgress]);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data?.logs, autoScroll]);

  if (!visible) return null;

  const isDeleting =
    data?.workflowType === "DEPROVISION" ||
    ["DELETING", "DEPROVISIONING"].includes(initialStatus) ||
    data?.status?.includes("DEP") ||
    data?.status?.includes("DEL");

  const progress = data?.progress ?? (isDeleting ? 15 : 20);
  const currentStep = data?.currentStep || "Processing...";
  const currentStepDesc = data?.currentStepDescription;
  const isFinished = progress >= 100 || data?.status === "SUCCEEDED";

  // Filter logs by search keyword and level
  const filteredLogs = (data?.logs || []).filter((l) => {
    const matchesLevel = filterLevel === "ALL" || l.level === filterLevel;
    const matchesSearch =
      !filterText ||
      l.message.toLowerCase().includes(filterText.toLowerCase()) ||
      l.source.toLowerCase().includes(filterText.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopyLogs = () => {
    const formatted = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.source}] [${l.level}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(formatted);
    message.success("Logs copied to clipboard!");
  };

  const stepsItems = (data?.milestones || []).map((m) => {
    let stepStatus: "wait" | "process" | "finish" | "error" = "wait";
    if (m.status === "completed") stepStatus = "finish";
    else if (m.status === "active") stepStatus = "process";
    else if (m.status === "error") stepStatus = "error";

    return {
      title: m.name,
      description: (
        <div style={{ fontSize: 11, color: "#64748b" }}>
          {m.description}
          <div style={{ marginTop: 2, fontWeight: 600 }}>{m.percent}%</div>
        </div>
      ),
      status: stepStatus,
      icon:
        stepStatus === "process" ? (
          <LoadingOutlined style={{ color: "#1652f0" }} />
        ) : undefined,
    };
  });

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>,
      ]}
      title={
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space align="center">
            {isFinished ? (
              <CheckCircleFilled style={{ color: "#52c41a", fontSize: 20 }} />
            ) : (
              <SyncOutlined spin style={{ color: isDeleting ? "#ff4d4f" : "#1652f0", fontSize: 20 }} />
            )}
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              {isDeleting ? "Deprovisioning Teardown" : "Provisioning Orchestration"}:{" "}
              <span style={{ color: "#1652f0" }}>{tenantId}</span>
            </span>
          </Space>
          <Space>
            <Tag color={isDeleting ? "error" : "processing"} style={{ fontWeight: 600, margin: 0 }}>
              {isDeleting ? "DEPROVISIONING" : "PROVISIONING"}
            </Tag>
            {isFinished && <Tag color="success">COMPLETED</Tag>}
          </Space>
        </Space>
      }
    >
      <div style={{ padding: "8px 0" }}>
        {/* Progress & Timing Bar */}
        <div
          style={{
            background: isDeleting ? "#fff1f0" : "#f0f7ff",
            border: `1px solid ${isDeleting ? "#ffa39e" : "#adc6ff"}`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <Row align="middle" gutter={[16, 8]}>
            <Col xs={24} md={14}>
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: 13 }}>
                    Overall Execution Progress: {progress}%
                  </Text>
                  {data && data.elapsedSeconds > 0 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Elapsed: <Text strong>{data.elapsedSeconds}s</Text>
                      {data.estimatedRemainingSeconds > 0 && (
                        <span> (~{data.estimatedRemainingSeconds}s remaining)</span>
                      )}
                    </Text>
                  )}
                </div>
                <Progress
                  percent={progress}
                  status={isDeleting ? "exception" : isFinished ? "success" : "active"}
                  strokeColor={
                    isDeleting
                      ? { "0%": "#faad14", "100%": "#ff4d4f" }
                      : { "0%": "#1652f0", "100%": "#52c41a" }
                  }
                  style={{ margin: "4px 0" }}
                />
              </Space>
            </Col>
            <Col xs={24} md={10} style={{ textAlign: "right" }}>
              <Space direction="vertical" align="end" size={2}>
                <Tag color="geekblue" icon={<ThunderboltOutlined />} style={{ fontSize: 11 }}>
                  AWS Step Functions & Worker Lambda
                </Tag>
                {data?.executionArn && (
                  <Tooltip title={data.executionArn}>
                    <Text
                      code
                      copyable={{ text: data.executionArn }}
                      style={{ fontSize: 10, maxWidth: 280 }}
                      ellipsis
                    >
                      {data.executionArn.split(":").pop()}
                    </Text>
                  </Tooltip>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        {/* Current Active Step Banner */}
        <Alert
          type={isDeleting ? "warning" : "info"}
          showIcon
          icon={isFinished ? <CheckCircleFilled /> : <LoadingOutlined />}
          message={
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Text strong style={{ fontSize: 13 }}>
                Active Step:
              </Text>
              <Tag color={isDeleting ? "volcano" : "blue"} style={{ fontWeight: 600 }}>
                {currentStep}
              </Tag>
              {currentStepDesc && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  — {currentStepDesc}
                </Text>
              )}
            </div>
          }
          style={{ marginBottom: 20 }}
        />

        {/* Steps Milestones Visualizer */}
        <div style={{ marginBottom: 24, padding: "0 8px" }}>
          <Text strong style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
            Execution Milestones & Current Phase:
          </Text>
          {stepsItems.length > 0 ? (
            <Steps
              items={stepsItems}
              size="small"
              responsive
              style={{ overflowX: "auto", paddingBottom: 8 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 16 }}>
              <LoadingOutlined spin style={{ fontSize: 20 }} />
              <div style={{ marginTop: 8 }}>Discovering execution milestones...</div>
            </div>
          )}
        </div>

        {/* Real-Time Live Logs Terminal */}
        <div
          style={{
            background: "#0d1117",
            borderRadius: 8,
            border: "1px solid #30363d",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {/* Terminal Toolbar */}
          <div
            style={{
              padding: "8px 12px",
              background: "#161b22",
              borderBottom: "1px solid #30363d",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Space align="center" size={8}>
              <CodeOutlined style={{ color: "#58a6ff" }} />
              <Text strong style={{ color: "#e6edf3", fontSize: 12 }}>
                Live Execution Logs
              </Text>
              <Badge status={isFinished ? "default" : "processing"} text={<span style={{ color: isFinished ? "#8b949e" : "#58a6ff", fontSize: 11 }}>{isFinished ? "Ended" : "Live (2s)"}</span>} />
              <span style={{ color: "#8b949e", fontSize: 11 }}>({filteredLogs.length} events)</span>
            </Space>

            <Space wrap size={8}>
              <Input
                size="small"
                prefix={<SearchOutlined style={{ color: "#8b949e" }} />}
                placeholder="Filter logs..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ width: 140, background: "#0d1117", borderColor: "#30363d", color: "#e6edf3" }}
                allowClear
              />
              <Select
                size="small"
                value={filterLevel}
                onChange={setFilterLevel}
                style={{ width: 90 }}
                options={[
                  { value: "ALL", label: "All Levels" },
                  { value: "INFO", label: "INFO" },
                  { value: "SUCCESS", label: "SUCCESS" },
                  { value: "WARN", label: "WARN" },
                  { value: "ERROR", label: "ERROR" },
                ]}
              />
              <Tooltip title="Auto-scroll to latest log">
                <Space size={4} style={{ color: "#8b949e", fontSize: 11 }}>
                  <span>Scroll:</span>
                  <Switch
                    size="small"
                    checked={autoScroll}
                    onChange={setAutoScroll}
                  />
                </Space>
              </Tooltip>
              <Tooltip title="Refresh logs">
                <Button
                  size="small"
                  type="text"
                  icon={<ReloadOutlined style={{ color: "#8b949e" }} />}
                  onClick={fetchProgress}
                  loading={loading}
                />
              </Tooltip>
              <Tooltip title="Copy all logs">
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined style={{ color: "#8b949e" }} />}
                  onClick={handleCopyLogs}
                />
              </Tooltip>
            </Space>
          </div>

          {/* Terminal Log Console */}
          <div
            ref={logContainerRef}
            style={{
              maxHeight: 280,
              minHeight: 180,
              overflowY: "auto",
              padding: "10px 14px",
              fontFamily: "Menlo, Monaco, 'Courier New', monospace",
              fontSize: 11.5,
              lineHeight: 1.6,
              color: "#c9d1d9",
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ color: "#8b949e", textAlign: "center", padding: "24px 0" }}>
                {filterText || filterLevel !== "ALL"
                  ? "No logs match the current filter criteria."
                  : "Streaming logs from Step Functions & CloudWatch worker..."}
              </div>
            ) : (
              filteredLogs.map((log, idx) => {
                let lvlColor = "#58a6ff"; // INFO default
                if (log.level === "SUCCESS") lvlColor = "#3fb950";
                else if (log.level === "WARN") lvlColor = "#d29922";
                else if (log.level === "ERROR") lvlColor = "#f85149";

                const srcColor = log.source === "TenantWorker" ? "#7ee787" : "#58a6ff";

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      wordBreak: "break-all",
                      padding: "2px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.02)",
                    }}
                  >
                    <span style={{ color: "#7d8590", flexShrink: 0, userSelect: "none" }}>
                      {log.timestamp.includes("T")
                        ? log.timestamp.split("T")[1].replace("Z", "")
                        : log.timestamp.split(" ")[1] || log.timestamp}
                    </span>
                    <span
                      style={{
                        color: srcColor,
                        fontWeight: 600,
                        flexShrink: 0,
                        fontSize: 10.5,
                        background: "rgba(255,255,255,0.06)",
                        padding: "0 4px",
                        borderRadius: 3,
                      }}
                    >
                      {log.source}
                    </span>
                    <span
                      style={{
                        color: lvlColor,
                        fontWeight: 600,
                        flexShrink: 0,
                        fontSize: 10.5,
                      }}
                    >
                      [{log.level}]
                    </span>
                    <span style={{ color: log.level === "ERROR" ? "#f85149" : "#e6edf3" }}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
