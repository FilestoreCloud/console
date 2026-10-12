import React, { useState, useEffect } from "react";
import { useCustom } from "@refinedev/core";
import { Card, Row, Col, Typography, Space, Select, Button, Tag, Spin } from "antd";
import {
  LineChartOutlined,
  ReloadOutlined,
  DashboardOutlined,
  CloudUploadOutlined,
  ApartmentOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export const TelemetryDashboard: React.FC = () => {
  const [intervalSec, setIntervalSec] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");

  // Fetch widgets
  const { data: wSaas, refetch: refetchSaas, isFetching: loadingSaas } = useCustom({
    url: "/api",
    method: "post",
    config: { payload: { action: "WIDGET", widget: "saas_fleet" } },
  });

  const { data: wEcs, refetch: refetchEcs, isFetching: loadingEcs } = useCustom({
    url: "/api",
    method: "post",
    config: { payload: { action: "WIDGET", widget: "ecs_compute" } },
  });

  const { data: wAlb, refetch: refetchAlb, isFetching: loadingAlb } = useCustom({
    url: "/api",
    method: "post",
    config: { payload: { action: "WIDGET", widget: "alb_traffic" } },
  });

  const refreshAll = () => {
    refetchSaas();
    refetchEcs();
    refetchAlb();
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

  const saasImg = (wSaas?.data as any)?.image_base64;
  const ecsImg = (wEcs?.data as any)?.image_base64;
  const albImg = (wAlb?.data as any)?.image_base64;

  return (
    <div>
      {/* 1. Control Bar */}
      <Card bordered={false} style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
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
                </Space>
              </div>
            </Space>
          </Col>

          <Col>
            <Space>
              <Select
                value={intervalSec}
                onChange={(val) => {
                  setIntervalSec(val);
                  setCountdown(val);
                }}
                style={{ width: 150 }}
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

      {/* 2. CloudWatch Native Widgets */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ApartmentOutlined style={{ color: "#3b82f6" }} />
                <span>Tenant Lifecycle Status</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
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
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 8 }}>
              Metric: Nextcloud/SaaS &gt; TenantActiveStatus
            </Text>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: "#16a34a" }} />
                <span>ECS Fargate CPU &amp; Memory</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
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
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 8 }}>
              Namespace: AWS/ECS (prod-nextcloud-cluster)
            </Text>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <CloudUploadOutlined style={{ color: "#0284c7" }} />
                <span>ALB Ingress Requests &amp; Latency</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
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
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 8 }}>
              Namespace: AWS/ApplicationELB (Dual-Axis)
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
