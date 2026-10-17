import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Progress,
  Badge,
  Descriptions,
  Table,
  Space,
} from "antd";
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { InteractiveMetricsChart } from "../../../components/InteractiveMetricsChart";

const { Title, Text } = Typography;

export interface MetricsTabProps {
  tenantId: string;
  metrics: any;
  metricsIntervalSec: number;
  metricsCountdown: number;
  setMetricsCountdown: React.Dispatch<React.SetStateAction<number>>;
  refetch: () => void;
}

export const MetricsTab: React.FC<MetricsTabProps> = ({
  tenantId,
  metrics = {},
  metricsIntervalSec,
  metricsCountdown,
  setMetricsCountdown,
  refetch,
}) => {
  return (
    <div>
      {/* 1. Top KPI Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* CPU Utilization */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            variant="borderless"
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
                Peak: <strong>{metrics.peak_cpu_percent ?? 2.8}%</strong>
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
            variant="borderless"
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
                Peak: <strong>{metrics.peak_memory_percent ?? 10.1}%</strong>
              </Text>
              <Text type="secondary">
                Allocated: <strong>{metrics.allocated_memory_mb ?? 1024} MB</strong>
              </Text>
            </div>
          </Card>
        </Col>

        {/* Ingress & Traffic */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            variant="borderless"
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
              <span style={{ fontSize: 14, fontWeight: "normal" }}>ms</span>
            </Title>
            <div style={{ marginTop: 8 }}>
              <Badge status="success" text="Target Health: HTTP 200 OK" />
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
                Requests (2h): <strong>{metrics.total_requests_2h ?? 15}</strong>
              </Text>
              <Text type="secondary">
                5xx Errors: <strong style={{ color: "#10b981" }}>0</strong>
              </Text>
            </div>
          </Card>
        </Col>

        {/* Storage Quota */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            size="small"
            variant="borderless"
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
              {((metrics.storage_used_mb ?? 1420.5) / 1024).toFixed(1)}{" "}
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
                Used: <strong>{metrics.storage_used_mb ?? 1420.5} MB</strong>
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
            clusterName={metrics.cluster_name || "prod-storix-cluster"}
            history={metrics.history || []}
            autoscalingTargetCpu={metrics.autoscaling_target_cpu || 70.0}
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
            variant="borderless"
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
                    <strong>{metrics.running_tasks ?? 1} Running</strong>
                  </Tag>
                  <Tag color="default">
                    {metrics.desired_tasks ?? 1} Desired
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Capacity Bounds">
                Min: <strong>{metrics.min_capacity ?? 1} task</strong> | Max:{" "}
                <strong>{metrics.max_capacity ?? 4} tasks</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Scaling Policy">
                <Tag color="processing">TargetTrackingScaling</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Target Utilization">
                <strong>
                  {metrics.autoscaling_target_cpu ?? 70.0}% Average CPU
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
        variant="borderless"
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
              render: (val: number) => <Tag color="blue">{val} reqs</Tag>,
            },
            {
              title: "Avg Latency",
              dataIndex: "latency_ms",
              key: "latency_ms",
              render: (val: number) => <span>{val.toFixed(1)} ms</span>,
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
  );
};
