import React, { useState } from "react";
import { Card, Space, Button, Input, Tag, Typography, message, Switch } from "antd";
import {
  CodeOutlined,
  ClearOutlined,
  PlayCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { dataProvider } from "../../../providers/dataProvider";

const { Text } = Typography;

export interface TerminalTabProps {
  tenantId: string;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({ tenantId }) => {
  const [occCommand, setOccCommand] = useState("status");
  const [occLoading, setOccLoading] = useState(false);
  const [isAsync, setIsAsync] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
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
      output: `  - installed: true\n  - version: 30.0.1.3\n  - versionstring: 30.0.1\n  - edition: Enterprise AI\n  - maintenance: false\n  - needsDbUpgrade: false\n  - productname: Storix\n  - extendedSupport: true`,
      exit_code: 0,
      duration_ms: 182,
      timestamp: new Date().toISOString(),
    },
  ]);

  const pollJobStatus = async (jobId: string, cmd: string, startTime: number) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await dataProvider.custom!({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "CHECK_OCC_JOB",
            tenant_id: tenantId,
            job_id: jobId,
          },
        });
        const job = res.data?.job || res.data;
        if (job.status === "COMPLETED" || job.status === "FAILED") {
          const duration = Math.round((Date.now() - startTime));
          setTerminalOutput((prev) => [
            ...prev,
            {
              cmd: `occ ${cmd} (Async Job ${jobId})`,
              output: job.output || (job.status === "COMPLETED" ? "Async job finished successfully." : "Job failed."),
              exit_code: job.exit_code ?? (job.status === "COMPLETED" ? 0 : 1),
              duration_ms: duration,
              timestamp: new Date().toISOString(),
            },
          ]);
          setActiveJobId(null);
          setOccLoading(false);
          message.success(`Async job 'occ ${cmd}' completed!`);
          return;
        }
      } catch (_) {
        // continue polling
      }
    }
    setActiveJobId(null);
    setOccLoading(false);
    message.warning(`Async job ${jobId} is taking longer than expected. Check Audit logs.`);
  };

  const handleExecuteOcc = async (cmdToRun?: string) => {
    if (!dataProvider.custom) return;
    const cmd = (cmdToRun || occCommand).trim();
    if (!cmd) return;
    setOccLoading(true);
    const startTime = Date.now();
    try {
      if (isAsync) {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "EXECUTE_OCC_ASYNC",
            tenant_id: tenantId,
            command: cmd,
          },
        });
        const jobId = res.data?.job_id || `job-${Date.now()}`;
        setActiveJobId(jobId);
        setTerminalOutput((prev) => [
          ...prev,
          {
            cmd: `occ ${cmd}`,
            output: `[ASYNC DISPATCH] Job ${jobId} submitted to Step Functions state engine. Polling output in background...`,
            exit_code: 0,
            duration_ms: 50,
            timestamp: new Date().toISOString(),
          },
        ]);
        message.info(`Dispatched async OCC job: ${jobId}`);
        pollJobStatus(jobId, cmd, startTime);
      } else {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
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
        setOccLoading(false);
      }
    } catch (err: any) {
      message.error(err?.message || "OCC execution failed");
      setOccLoading(false);
    }
  };

  return (
    <div>
      <Card
        title={
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Space wrap>
              <CodeOutlined style={{ color: "#1652f0" }} />
              <span>Interactive Storix `occ` CLI Diagnostic Runner</span>
              <Tag color="geekblue">Container: service-{tenantId}</Tag>
            </Space>
            <Space wrap>
              <Space size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>Async Mode</Text>
                <Switch
                  size="small"
                  checked={isAsync}
                  onChange={setIsAsync}
                />
              </Space>
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={() => setTerminalOutput([])}
              >
                Clear Screen
              </Button>
            </Space>
          </div>
        }
        variant="borderless"
        style={{
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
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
                onClick={() => handleExecuteOcc("db:add-missing-indices")}
                loading={occLoading}
              >
                db:add-missing-indices
              </Button>
              <Button
                size="small"
                onClick={() => handleExecuteOcc("maintenance:mode --status")}
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
                background: "#1652f0",
                borderColor: "#1652f0",
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
        styles={{
          body: { padding: 16 },
          header: {
            background: "#1e293b",
            borderBottom: "1px solid #334155",
            color: "#94a3b8",
          },
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
              Terminal output buffer empty. Execute a command above to inspect
              Storix platform internals.
            </div>
          ) : (
            terminalOutput.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div>
                    <span style={{ color: "#38bdf8" }}>
                      storix@{tenantId}
                    </span>
                    <span style={{ color: "#94a3b8" }}>:</span>
                    <span style={{ color: "#a855f7" }}>/var/www/html</span>
                    <span style={{ color: "#94a3b8" }}>$ </span>
                    <strong style={{ color: "#4ade80" }}>{item.cmd}</strong>
                  </div>
                  <Space size={6}>
                    <Tag
                      color={item.exit_code === 0 ? "success" : "error"}
                      style={{ fontSize: 10, margin: 0 }}
                    >
                      exit {item.exit_code}
                    </Tag>
                    <Tag color="default" style={{ fontSize: 10, margin: 0 }}>
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
  );
};
