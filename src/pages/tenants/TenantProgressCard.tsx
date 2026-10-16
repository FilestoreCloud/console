import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, Progress, Space, Row, Col, Tag, Steps, Tooltip } from "antd";
import {
  SyncOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { dataProvider } from "../../providers/dataProvider";

const { Text } = Typography;

export interface MilestoneItem {
  id: string;
  name: string;
  description: string;
  percent: number;
  status: "completed" | "active" | "pending" | "error";
}

export interface TenantProgressCardProps {
  currentStatus: string;
  progress?: number | string;
  currentStep?: string;
  tenantId?: string;
}

export const TenantProgressCard: React.FC<TenantProgressCardProps> = ({
  currentStatus,
  progress = 15,
  currentStep,
  tenantId,
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

  const [liveData, setLiveData] = useState<{
    progress: number;
    currentStep: string;
    currentStepDescription?: string;
    elapsedSeconds: number;
    estimatedRemainingSeconds: number;
    milestones: MilestoneItem[];
    executionArn?: string;
  } | null>(null);

  const fetchLiveStream = useCallback(async () => {
    if (!tenantId || !activeStatuses.includes(currentStatus)) return;
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "STREAM_SFN_PROGRESS",
          tenant_id: tenantId,
        },
      });
      if (res.data) {
        setLiveData({
          progress: Number(res.data.progress ?? progress),
          currentStep: res.data.currentStep || currentStep || "In progress",
          currentStepDescription: res.data.currentStepDescription,
          elapsedSeconds: Number(res.data.elapsedSeconds || 0),
          estimatedRemainingSeconds: Number(res.data.estimatedRemainingSeconds || 0),
          milestones: res.data.milestones || [],
          executionArn: res.data.executionArn,
        });
      }
    } catch {
      // Fallback gracefully to prop-provided status
    }
  }, [tenantId, currentStatus, progress, currentStep]);

  useEffect(() => {
    if (!activeStatuses.includes(currentStatus) || !tenantId) return;
    fetchLiveStream();
    const timer = setInterval(fetchLiveStream, 3000);
    return () => clearInterval(timer);
  }, [fetchLiveStream, currentStatus, tenantId]);

  if (!activeStatuses.includes(currentStatus)) {
    return null;
  }

  const effectiveProgress = liveData ? liveData.progress : Number(progress);
  const effectiveStep = liveData ? liveData.currentStep : currentStep || "Step Functions Workflow in progress...";

  const isDeleting = ["DELETING", "DEPROVISIONING"].includes(currentStatus);
  const isSuspending = currentStatus === "SUSPENDING";
  const isResuming = currentStatus === "RESUMING";
  const isSeeding = currentStatus === "SEEDING";
  const isUpgrading = currentStatus === "UPGRADING";

  let cardBg = "#f0f7ff";
  let cardBorder = "#91caff";
  let iconColor = "#1652f0";
  let strokeColor: any = { "0%": "#1652f0", "100%": "#52c41a" };
  let title = `Tenant Provisioning in Progress (${effectiveProgress}%)`;

  if (isDeleting) {
    cardBg = "#fff1f0";
    cardBorder = "#ffa39e";
    iconColor = "#ff4d4f";
    strokeColor = { "0%": "#faad14", "100%": "#ff4d4f" };
    title = `Tenant Teardown & Deprovisioning in Progress (${effectiveProgress}%)`;
  } else if (isSuspending) {
    cardBg = "#fffbe6";
    cardBorder = "#ffe58f";
    iconColor = "#fa8c16";
    strokeColor = "#fa8c16";
    title = `Tenant Suspension (FinOps Scale-to-Zero) in Progress (${effectiveProgress}%)`;
  } else if (isResuming) {
    cardBg = "#e6fffb";
    cardBorder = "#87e8de";
    iconColor = "#13c2c8";
    strokeColor = "#13c2c8";
    title = `Tenant Resumption & Container Rehydration in Progress (${effectiveProgress}%)`;
  } else if (isSeeding) {
    cardBg = "#f9f0ff";
    cardBorder = "#d3adf7";
    iconColor = "#722ed1";
    strokeColor = "#722ed1";
    title = `Tenant Demo Data Seeding in Progress (${effectiveProgress}%)`;
  } else if (isUpgrading) {
    cardBg = "#f0f5ff";
    cardBorder = "#adc6ff";
    iconColor = "#2f54eb";
    strokeColor = "#2f54eb";
    title = `Rolling Container Image Upgrade in Progress (${effectiveProgress}%)`;
  }

  // Fallback default milestones if not streamed from backend
  const displayMilestones: MilestoneItem[] =
    liveData?.milestones && liveData.milestones.length > 0
      ? liveData.milestones
      : [
          {
            id: "VALIDATE",
            name: "Validation & Registry",
            description: "Validate tenant parameters & initialize DynamoDB registry record",
            percent: 15,
            status: effectiveProgress >= 15 ? "completed" : "active",
          },
          {
            id: "DATABASE",
            name: "Postgres Isolation",
            description: "Create isolated database schema and credentials",
            percent: 35,
            status: effectiveProgress > 35 ? "completed" : effectiveProgress >= 35 ? "active" : "pending",
          },
          {
            id: "STORAGE",
            name: "EFS Storage",
            description: "Provision dedicated EFS access point & permissions",
            percent: 55,
            status: effectiveProgress > 55 ? "completed" : effectiveProgress >= 55 ? "active" : "pending",
          },
          {
            id: "COMPUTE",
            name: "ECS Task",
            description: "Register container task definition & service",
            percent: 75,
            status: effectiveProgress > 75 ? "completed" : effectiveProgress >= 75 ? "active" : "pending",
          },
          {
            id: "HEALTH_CHECK",
            name: "Health Probe",
            description: "Verify Nextcloud container health check probe",
            percent: 90,
            status: effectiveProgress > 90 ? "completed" : effectiveProgress >= 90 ? "active" : "pending",
          },
          {
            id: "ACTIVE",
            name: "Ready & Active",
            description: "Tenant operational and ready for use",
            percent: 100,
            status: effectiveProgress >= 100 ? "completed" : "pending",
          },
        ];

  return (
    <Card
      style={{
        marginBottom: 20,
        borderColor: cardBorder,
        backgroundColor: cardBg,
        boxShadow: "0 2px 8px rgba(22, 82, 240, 0.08)",
      }}
      variant="borderless"
    >
      <Row align="middle" gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space align="center" wrap>
              <SyncOutlined spin style={{ color: iconColor, fontSize: 18 }} />
              <Text strong style={{ fontSize: 16 }}>
                {title}
              </Text>
              {liveData && (
                <Tag color="cyan" style={{ fontSize: 11, borderRadius: 12 }}>
                  <ThunderboltOutlined /> Real-Time Live Streaming
                </Tag>
              )}
            </Space>

            <Space wrap size={[16, 4]}>
              <Text type="secondary">
                Current Step: <Text strong>{effectiveStep}</Text>
              </Text>
              {liveData && liveData.elapsedSeconds > 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  Elapsed: <Text strong>{liveData.elapsedSeconds}s</Text>
                  {liveData.estimatedRemainingSeconds > 0 && (
                    <span style={{ marginLeft: 6 }}>
                      (est. ~{liveData.estimatedRemainingSeconds}s remaining)
                    </span>
                  )}
                </Text>
              )}
            </Space>

            {liveData?.currentStepDescription && (
              <Text type="secondary" style={{ fontSize: 12, fontStyle: "italic" }}>
                <InfoCircleOutlined style={{ marginRight: 4 }} />
                {liveData.currentStepDescription}
              </Text>
            )}

            <Progress
              percent={effectiveProgress}
              status={isDeleting ? "exception" : "active"}
              strokeColor={strokeColor}
            />
          </Space>
        </Col>

        <Col xs={24} md={8} style={{ textAlign: "right" }}>
          <Space direction="vertical" align="end" size={6}>
            <Tag
              color={isDeleting ? "error" : isSuspending ? "warning" : "processing"}
              style={{ fontSize: 12, padding: "4px 10px", margin: 0 }}
            >
              AWS Step Functions Orchestrated
            </Tag>
            {liveData?.executionArn && (
              <Tooltip title={liveData.executionArn}>
                <Text
                  copyable={{ text: liveData.executionArn }}
                  code
                  style={{ fontSize: 10, maxWidth: 220 }}
                  ellipsis
                >
                  {liveData.executionArn.split(":").pop()}
                </Text>
              </Tooltip>
            )}
          </Space>
        </Col>
      </Row>

      {/* Real-time State Machine Milestone Stepper */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed #d9d9d9" }}>
        <Text strong style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 10 }}>
          Execution Milestones:
        </Text>
        <Row gutter={[8, 8]}>
          {displayMilestones.map((m) => {
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
                      padding: "6px 8px",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      cursor: "default",
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
      </div>
    </Card>
  );
};
