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
} from "antd";
import {
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { dataProvider } from "../../../providers/dataProvider";

const { Text } = Typography;

export interface LogsTabProps {
  tenantId: string;
  awsTopology: any;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  tenantId,
  awsTopology = {},
}) => {
  const [logsContainer, setLogsContainer] = useState("all");
  const [logsLevel, setLogsLevel] = useState("ALL");
  const [logsFilter, setLogsFilter] = useState("");
  const [logsAutoRefresh, setLogsAutoRefresh] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [containerLogs, setContainerLogs] = useState<any[]>([]);

  const handleFetchLogs = useCallback(async () => {
    if (!dataProvider.custom) return;
    setLogsLoading(true);
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
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
  }, [tenantId, logsContainer, logsFilter]);

  useEffect(() => {
    handleFetchLogs();
  }, [handleFetchLogs]);

  useEffect(() => {
    if (!logsAutoRefresh) return;
    const interval = setInterval(() => {
      handleFetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [logsAutoRefresh, handleFetchLogs]);

  return (
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
                  {awsTopology.cluster_name ? "prod-storix" : "storix"}
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
                      value: "storix-app",
                      label: "Storix 30 App",
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
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
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
        variant="borderless"
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
              <SyncOutlined spin style={{ fontSize: 20, marginBottom: 8 }} />
              <br />
              Streaming logs from CloudWatch for tenant '{tenantId}'...
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
              .filter((l) => logsLevel === "ALL" || l.level === logsLevel)
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
                      l.container === "litellm-sidecar" ? "purple" : "orange"
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
  );
};
