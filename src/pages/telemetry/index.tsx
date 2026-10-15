import React, { useState, useEffect } from "react";
import { useCustom } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Select,
  Button,
  Tag,
  Tooltip,
} from "antd";
import {
  ReloadOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  CloudUploadOutlined,
  LinkOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  InteractiveFleetEcsChart,
  InteractiveFleetAlbChart,
  InteractiveFleetLifecycleChart,
} from "../../components/InteractiveFleetCharts";
import { InteractiveMetricsChart } from "../../components/InteractiveMetricsChart";
import { dataProvider } from "../../providers/dataProvider";

const { Text } = Typography;

export const TelemetryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [intervalSec, setIntervalSec] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");
  const [selectedTenant, setSelectedTenant] = useState<string>("fleet");

  // 1. Fetch raw streaming metrics for fleet interactive charts
  const { data: rawMetricsResp, refetch: refetchRawMetrics } = useCustom({
    url: dataProvider.getApiUrl(),
    method: "post",
    config: { payload: { action: "METRICS" } },
  });

  // 2. Fetch tenant-specific full metrics if selected
  const { data: tenantMetricsResp, refetch: refetchTenantMetrics } = useCustom({
    url: dataProvider.getApiUrl(),
    method: "post",
    config: {
      payload: { action: "GET_TENANT_METRICS", tenant_id: selectedTenant },
    },
    queryOptions: {
      enabled: selectedTenant !== "fleet",
    },
  });

  const refreshAll = () => {
    refetchRawMetrics();
    if (selectedTenant !== "fleet") {
      refetchTenantMetrics();
    }
    setLastUpdate(new Date().toTimeString().split(" ")[0]);
    setCountdown(intervalSec);
  };

  useEffect(() => {
    if (intervalSec === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshAll();
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [intervalSec]);

  const fleetMetrics = (rawMetricsResp?.data as any)?.metrics;
  const tenantMetrics = (tenantMetricsResp?.data as any) || {};

  return (
    <div>
      {/* 1. Interactive Control Bar */}
      <Card
        variant="borderless"
        style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space align="center" size="middle">
              <span style={{ fontSize: 22 }}>📡</span>
              <div>
                <Text strong style={{ fontSize: 16, display: "block" }}>
                  Live CloudWatch Telemetry &amp; Metrics
                </Text>
                <Space>
                  <Tag color={intervalSec > 0 ? "processing" : "default"}>
                    {intervalSec > 0 ? `STREAMING (${countdown}s)` : "PAUSED"}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Last updated: {lastUpdate}
                  </Text>
                  <Tooltip title="Interactive mode enables mouse wheel zoom in/out, pan slider handles, crosshair tooltips, and legend series toggles.">
                    <Tag
                      icon={<InfoCircleOutlined />}
                      color="cyan"
                      style={{ cursor: "pointer" }}
                    >
                      Wheel Zoom & Pan Enabled
                    </Tag>
                  </Tooltip>
                </Space>
              </div>
            </Space>
          </Col>

          <Col>
            <Space wrap>
              {/* Tenant Filter */}
              <Select
                value={selectedTenant}
                onChange={(val) => setSelectedTenant(val)}
                style={{ width: 180 }}
                options={[
                  { value: "fleet", label: "🌐 All Tenants (Fleet)" },
                  { value: "acme", label: "🏢 Acme Corp (Tenant)" },
                  { value: "marvel", label: "🦸 Marvel Ent (Tenant)" },
                ]}
              />

              {/* Streaming Interval */}
              <Select
                value={intervalSec}
                onChange={(val) => {
                  setIntervalSec(val);
                  setCountdown(val);
                }}
                style={{ width: 140 }}
                options={[
                  { value: 15, label: "Every 15s (Live)" },
                  { value: 30, label: "Every 30s" },
                  { value: 60, label: "Every 60s" },
                  { value: 0, label: "⏸ Pause Stream" },
                ]}
              />
              <Button icon={<ReloadOutlined />} onClick={refreshAll}>
                Sync Now
              </Button>
              <Button
                type="primary"
                href="https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards/dashboard/prod-Nextcloud-SaaS-Control-Plane"
                target="_blank"
                icon={<LinkOutlined />}
                style={{ backgroundColor: "#1652f0", borderColor: "#1652f0" }}
              >
                AWS Console
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 2. Tenant-Specific Dedicated Telemetry View if selected */}
      {selectedTenant !== "fleet" && (
        <div style={{ marginBottom: 16 }}>
          <InteractiveMetricsChart
            tenantId={selectedTenant}
            clusterName="prod-nextcloud-cluster"
            history={tenantMetrics.history || []}
            autoscalingTargetCpu={tenantMetrics.autoscaling_target_cpu || 70.0}
            intervalSec={intervalSec}
            countdown={countdown}
            onRefresh={refreshAll}
          />
        </div>
      )}

      {/* 3. Fleet-Wide Telemetry Charts */}
      <Row gutter={[16, 16]}>
        {/* Card 1: Tenant Lifecycle Status */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ApartmentOutlined style={{ color: "#3b82f6" }} />
                <span>Tenant Lifecycle Status</span>
                <Tag color="blue">Interactive</Tag>
              </Space>
            }
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <InteractiveFleetLifecycleChart height={260} />
            <Text
              type="secondary"
              style={{ fontSize: 11, display: "block", marginTop: 8 }}
            >
              Metric: Nextcloud/SaaS &gt; TenantActiveStatus
            </Text>
          </Card>
        </Col>

        {/* Card 2: ECS Fargate CPU & Memory */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: "#16a34a" }} />
                <span>ECS Fargate CPU &amp; Memory</span>
                <Tag color="green">Wheel Zoom</Tag>
              </Space>
            }
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <InteractiveFleetEcsChart data={fleetMetrics} height={260} />
            <Text
              type="secondary"
              style={{ fontSize: 11, display: "block", marginTop: 8 }}
            >
              Namespace: AWS/ECS (prod-nextcloud-cluster)
            </Text>
          </Card>
        </Col>

        {/* Card 3: ALB Ingress Requests & Latency */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <CloudUploadOutlined style={{ color: "#0284c7" }} />
                <span>ALB Ingress Requests &amp; Latency</span>
                <Tag color="cyan">Dual-Axis</Tag>
              </Space>
            }
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <InteractiveFleetAlbChart data={fleetMetrics} height={260} />
            <Text
              type="secondary"
              style={{ fontSize: 11, display: "block", marginTop: 8 }}
            >
              Namespace: AWS/ApplicationELB (Dual-Axis)
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
