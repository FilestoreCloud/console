import React, { useState, useEffect } from "react";
import { useCustom, useNavigation } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Select,
  Button,
  Tag,
  Spin,
  Radio,
  Tooltip,
} from "antd";
import {
  LineChartOutlined,
  ReloadOutlined,
  DashboardOutlined,
  CloudUploadOutlined,
  ApartmentOutlined,
  LinkOutlined,
  EyeOutlined,
  FundViewOutlined,
  PictureOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  InteractiveFleetEcsChart,
  InteractiveFleetAlbChart,
  InteractiveFleetLifecycleChart,
} from "../../components/InteractiveFleetCharts";
import { InteractiveMetricsChart } from "../../components/InteractiveMetricsChart";

const { Text } = Typography;

export const TelemetryDashboard: React.FC = () => {
  const { show } = useNavigation();
  const [intervalSec, setIntervalSec] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");
  const [selectedTenant, setSelectedTenant] = useState<string>("fleet");
  const [viewMode, setViewMode] = useState<"interactive" | "images">(
    "interactive",
  );

  // 1. Fetch raw streaming metrics for fleet interactive charts
  const { data: rawMetricsResp, refetch: refetchRawMetrics } = useCustom({
    url: "/api",
    method: "post",
    config: { payload: { action: "METRICS" } },
  });

  // 2. Fetch tenant-specific full metrics if selected
  const { data: tenantMetricsResp, refetch: refetchTenantMetrics } = useCustom({
    url: "/api",
    method: "post",
    config: {
      payload: { action: "GET_TENANT_METRICS", tenant_id: selectedTenant },
    },
    queryOptions: {
      enabled: selectedTenant !== "fleet",
    },
  });

  // 3. Fetch static CloudWatch widget images for fallback/comparison mode
  const {
    data: wSaas,
    refetch: refetchSaas,
    isFetching: loadingSaas,
  } = useCustom({
    url: "/api",
    method: "post",
    config: { payload: { action: "WIDGET", widget: "saas_fleet" } },
  });

  const {
    data: wEcs,
    refetch: refetchEcs,
    isFetching: loadingEcs,
  } = useCustom({
    url: "/api",
    method: "post",
    config: { payload: { action: "WIDGET", widget: "ecs_compute" } },
  });

  const {
    data: wAlb,
    refetch: refetchAlb,
    isFetching: loadingAlb,
  } = useCustom({
    url: "/api",
    method: "post",
    config: { payload: { action: "WIDGET", widget: "alb_traffic" } },
  });

  const { data: wTenant, refetch: refetchTenantWidget } = useCustom({
    url: "/api",
    method: "post",
    config: {
      payload: { action: "WIDGET", widget: `tenant_${selectedTenant}` },
    },
    queryOptions: {
      enabled: selectedTenant !== "fleet",
    },
  });

  const refreshAll = () => {
    refetchRawMetrics();
    refetchSaas();
    refetchEcs();
    refetchAlb();
    if (selectedTenant !== "fleet") {
      refetchTenantMetrics();
      refetchTenantWidget();
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

  const saasImg = (wSaas?.data as any)?.image_base64;
  const ecsImg = (wEcs?.data as any)?.image_base64;
  const albImg = (wAlb?.data as any)?.image_base64;
  const tenantWidgetImg = (wTenant?.data as any)?.image_base64;

  return (
    <div>
      {/* 1. Interactive Control Bar */}
      <Card
        bordered={false}
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
              {/* View Mode Toggle: Interactive vs Images */}
              <Radio.Group
                size="middle"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <Radio.Button value="interactive">
                  <FundViewOutlined /> Interactive Charts
                </Radio.Button>
                <Radio.Button value="images">
                  <PictureOutlined /> CloudWatch Images
                </Radio.Button>
              </Radio.Group>

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
                style={{ backgroundColor: "#ec7211", borderColor: "#ec7211" }}
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
          {viewMode === "interactive" ? (
            <InteractiveMetricsChart
              tenantId={selectedTenant}
              clusterName="prod-nextcloud-cluster"
              history={tenantMetrics.history || []}
              widgetImageBase64={tenantWidgetImg}
              autoscalingTargetCpu={
                tenantMetrics.autoscaling_target_cpu || 70.0
              }
              intervalSec={intervalSec}
              countdown={countdown}
              onRefresh={refreshAll}
            />
          ) : (
            <Card
              title={
                <Space>
                  <LineChartOutlined style={{ color: "#ec7211" }} />
                  <span>
                    CloudWatch Image for Tenant:{" "}
                    <strong>{selectedTenant.toUpperCase()}</strong>
                  </span>
                  <Tag color="orange">service-{selectedTenant}</Tag>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  ghost
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    show("tenants", `${selectedTenant}?tab=metrics`)
                  }
                >
                  Open Full Tenant View
                </Button>
              }
              bordered={false}
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
            >
              <div
                style={{
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {tenantWidgetImg ? (
                  <img
                    src={`data:image/png;base64,${tenantWidgetImg}`}
                    alt={`Tenant ${selectedTenant} Telemetry`}
                    style={{ width: "100%", height: "auto", maxHeight: 380 }}
                  />
                ) : (
                  <Text type="secondary">
                    Loading live metrics widget for tenant {selectedTenant}...
                  </Text>
                )}
              </div>
            </Card>
          )}
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
                {viewMode === "interactive" && (
                  <Tag color="blue">Interactive</Tag>
                )}
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            {viewMode === "interactive" ? (
              <InteractiveFleetLifecycleChart height={260} />
            ) : (
              <div
                style={{
                  minHeight: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {loadingSaas ? (
                  <Spin />
                ) : saasImg ? (
                  <img
                    src={`data:image/png;base64,${saasImg}`}
                    alt="SaaS Fleet Status"
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <Text type="secondary">Widget loading or inactive</Text>
                )}
              </div>
            )}
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
                {viewMode === "interactive" && (
                  <Tag color="green">Wheel Zoom</Tag>
                )}
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            {viewMode === "interactive" ? (
              <InteractiveFleetEcsChart data={fleetMetrics} height={260} />
            ) : (
              <div
                style={{
                  minHeight: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {loadingEcs ? (
                  <Spin />
                ) : ecsImg ? (
                  <img
                    src={`data:image/png;base64,${ecsImg}`}
                    alt="ECS Fargate Metrics"
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <Text type="secondary">Widget loading or inactive</Text>
                )}
              </div>
            )}
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
                {viewMode === "interactive" && (
                  <Tag color="cyan">Dual-Axis</Tag>
                )}
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            {viewMode === "interactive" ? (
              <InteractiveFleetAlbChart data={fleetMetrics} height={260} />
            ) : (
              <div
                style={{
                  minHeight: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {loadingAlb ? (
                  <Spin />
                ) : albImg ? (
                  <img
                    src={`data:image/png;base64,${albImg}`}
                    alt="ALB Ingress Metrics"
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <Text type="secondary">Widget loading or inactive</Text>
                )}
              </div>
            )}
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
