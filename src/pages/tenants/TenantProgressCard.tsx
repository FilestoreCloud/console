import React from "react";
import { Card, Typography, Progress, Space, Row, Col, Tag } from "antd";
import { SyncOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TenantProgressCardProps {
  currentStatus: string;
  progress?: number | string;
  currentStep?: string;
}

export const TenantProgressCard: React.FC<TenantProgressCardProps> = ({
  currentStatus,
  progress = 15,
  currentStep,
}) => {
  const activeStatuses = [
    "PROVISIONING",
    "DELETING",
    "DEPROVISIONING",
    "SUSPENDING",
    "RESUMING",
    "SEEDING",
    "UPGRADING",
  ];

  if (!activeStatuses.includes(currentStatus)) {
    return null;
  }

  const isDeleting = ["DELETING", "DEPROVISIONING"].includes(currentStatus);
  const isSuspending = currentStatus === "SUSPENDING";
  const isResuming = currentStatus === "RESUMING";
  const isSeeding = currentStatus === "SEEDING";
  const isUpgrading = currentStatus === "UPGRADING";

  let cardBg = "#e6f4ff";
  let cardBorder = "#91caff";
  let iconColor = "#1890ff";
  let strokeColor: any = { "0%": "#108ee9", "100%": "#52c41a" };
  let title = `Tenant Provisioning in Progress (${progress}%)`;

  if (isDeleting) {
    cardBg = "#fff1f0";
    cardBorder = "#ffa39e";
    iconColor = "#ff4d4f";
    strokeColor = { "0%": "#faad14", "100%": "#ff4d4f" };
    title = `Tenant Teardown & Deprovisioning in Progress (${progress}%)`;
  } else if (isSuspending) {
    cardBg = "#fffbe6";
    cardBorder = "#ffe58f";
    iconColor = "#fa8c16";
    strokeColor = "#fa8c16";
    title = `Tenant Suspension (FinOps Scale-to-Zero) in Progress (${progress}%)`;
  } else if (isResuming) {
    cardBg = "#e6fffb";
    cardBorder = "#87e8de";
    iconColor = "#13c2c8";
    strokeColor = "#13c2c8";
    title = `Tenant Resumption & Container Rehydration in Progress (${progress}%)`;
  } else if (isSeeding) {
    cardBg = "#f9f0ff";
    cardBorder = "#d3adf7";
    iconColor = "#722ed1";
    strokeColor = "#722ed1";
    title = `Tenant Demo Data Seeding in Progress (${progress}%)`;
  } else if (isUpgrading) {
    cardBg = "#f0f5ff";
    cardBorder = "#adc6ff";
    iconColor = "#2f54eb";
    strokeColor = "#2f54eb";
    title = `Rolling Container Image Upgrade in Progress (${progress}%)`;
  }

  return (
    <Card style={{ marginBottom: 20, borderColor: cardBorder, backgroundColor: cardBg }} variant="borderless">
      <Row align="middle" gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space>
              <SyncOutlined spin style={{ color: iconColor, fontSize: 18 }} />
              <Text strong style={{ fontSize: 16 }}>
                {title}
              </Text>
            </Space>
            <Text type="secondary">
              Current Step: <Text strong>{currentStep || "Step Functions Workflow in progress..."}</Text>
            </Text>
            <Progress
              percent={Number(progress)}
              status={isDeleting ? "exception" : "active"}
              strokeColor={strokeColor}
            />
          </Space>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: "right" }}>
          <Tag color={isDeleting ? "error" : isSuspending ? "warning" : "processing"} style={{ fontSize: 13, padding: "4px 12px" }}>
            AWS Step Functions Orchestrating
          </Tag>
        </Col>
      </Row>
    </Card>
  );
};
