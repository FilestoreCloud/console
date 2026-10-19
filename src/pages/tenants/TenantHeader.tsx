import React from "react";
import { Card, Row, Col, Space, Button, Typography, Popconfirm } from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  BranchesOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { renderStatusTag } from "./helpers";

const { Title, Text } = Typography;

export interface TenantHeaderProps {
  tenantId: string;
  domain: string;
  adminEmail?: string;
  currentStatus: string;
  progress?: number;
  currentStep?: string;
  isLoading: boolean;
  isUpdating: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onOpenIncidentModal: () => void;
  onRestartAgent: () => void;
  onOpenCloneModal: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({
  tenantId,
  domain,
  adminEmail,
  currentStatus,
  progress,
  currentStep,
  isLoading,
  isUpdating,
  onBack,
  onRefresh,
  onOpenIncidentModal,
  onRestartAgent,
  onOpenCloneModal,
}) => {
  return (
    <Card style={{ marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }} variant="borderless">
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Fleet</Button>
            <div style={{ minWidth: 200, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Title level={4} style={{ margin: 0 }}>{tenantId}</Title>
                {renderStatusTag(currentStatus, { progress, current_step: currentStep })}
              </div>
              <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <a href={`https://${domain}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: "#0284c7" }}>
                  https://{domain} <LinkOutlined style={{ fontSize: 11 }} />
                </a>
                {adminEmail && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Admin: {adminEmail}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} xl={14}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}>
            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={isLoading}>
              Refresh
            </Button>
            {(() => {
              const isInFlight = ["PROVISIONING", "DELETING", "DEPROVISIONING", "SUSPENDING", "RESUMING", "SEEDING", "UPGRADING"].includes(currentStatus);
              return (
                <>
                  <Button
                    icon={<WarningOutlined />}
                    danger={currentStatus === "INCIDENT" || currentStatus === "DEGRADED"}
                    onClick={onOpenIncidentModal}
                    disabled={isInFlight}
                  >
                    Incident / Status Circuit-Breaker
                  </Button>
                  <Popconfirm
                    title="Trigger Rolling Restart of Agent Task?"
                    description={`This forces a new ECS task deployment for tenant '${tenantId}' with zero downtime.`}
                    onConfirm={onRestartAgent}
                    okText="Restart Task"
                    cancelText="Cancel"
                    disabled={isInFlight}
                  >
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      loading={isUpdating && isInFlight}
                      disabled={isInFlight}
                      style={{ background: "#1652f0", borderColor: "#1652f0" }}
                    >
                      Restart Agent Task
                    </Button>
                  </Popconfirm>
                  <Button
                    icon={<BranchesOutlined />}
                    style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}
                    onClick={onOpenCloneModal}
                    disabled={isInFlight}
                  >
                    Fork to Sandbox
                  </Button>
                </>
              );
            })()}
          </div>
        </Col>
      </Row>
    </Card>
  );
};
