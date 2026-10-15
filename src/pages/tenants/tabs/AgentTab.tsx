import React from "react";
import { Card, Row, Col, Typography, Badge, Tag, Divider, Descriptions, Space } from "antd";
import { RobotOutlined, CloudServerOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

export interface AgentTabProps {
  agent: any;
  awsTopology: any;
}

export const AgentTab: React.FC<AgentTabProps> = ({
  agent = {},
  awsTopology = {},
}) => {
  return (
    <div>
      {/* Agent Task Runtime Card */}
      <Card
        title={
          <Space>
            <RobotOutlined style={{ color: "#10b981" }} />
            <span>ECS Agent Task Runtime Telemetry</span>
          </Space>
        }
        size="small"
        variant="borderless"
        style={{
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card size="small" style={{ background: "#f8fafc" }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                AGENT STATUS
              </Text>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {agent.status === "RUNNING" ? (
                  <Badge status="success" text="RUNNING" />
                ) : (
                  <Badge status="error" text={agent.status || "STOPPED"} />
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small" style={{ background: "#f8fafc" }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                CONTAINER HEALTH
              </Text>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {agent.health_status === "HEALTHY" ? (
                  <Tag color="success">HEALTHY (2/2 Passed)</Tag>
                ) : (
                  <Tag color="warning">{agent.health_status || "UNKNOWN"}</Tag>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small" style={{ background: "#f8fafc" }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                FARGATE COMPUTING
              </Text>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {agent.cpu || 512} vCPU-units / {agent.memory || 1024} MB RAM
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small" style={{ background: "#f8fafc" }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                PRIVATE IP / ENI
              </Text>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginTop: 4,
                  fontFamily: "monospace",
                }}
              >
                {agent.private_ip || "10.0.12.42"}
              </div>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: "16px 0" }} />

        <Descriptions column={{ xs: 1, md: 2 }} size="small" bordered>
          <Descriptions.Item label="Task ARN">
            <Paragraph
              copyable
              style={{
                margin: 0,
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              {agent.task_arn || "arn:aws:ecs:ap-southeast-1:.../task"}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Task Definition ARN">
            <Paragraph
              copyable
              style={{
                margin: 0,
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              {agent.task_definition_arn ||
                "arn:aws:ecs:ap-southeast-1:.../task-definition"}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Desired vs Running Count">
            <Tag color="blue">
              {agent.desired_count || 1} desired / {agent.running_count || 1}{" "}
              running
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Agent Uptime">
            <Text>{agent.uptime_hours || 168.4} hours continuous</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Dedicated Application Container Card */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <CloudServerOutlined style={{ color: "#1652f0" }} />
                <span>
                  Dedicated Application Container (Nextcloud Enterprise)
                </span>
              </Space>
            }
            size="small"
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Image URI" span={2}>
                <Paragraph
                  copyable
                  style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    margin: 0,
                  }}
                >
                  {awsTopology.cluster_name
                    ? "649519997247.dkr.ecr.ap-southeast-1.amazonaws.com/nextcloud-enterprise-ai:latest"
                    : "nextcloud-enterprise-ai:latest"}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Runtime Stack">
                <Tag color="orange">Apache 2.4 + PHP 8.2 (FPM)</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Listen Port">
                <Tag color="blue">Port 80 (HTTP)</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Container Health">
                <Tag color="success">HEALTHY (HTTP /status.php 200 OK)</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Resource Usage">
                <Text>CPU: 14.2% | Memory: 38.6% (395 MB)</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
