import React from "react";
import { Card, Row, Col, Descriptions, Tag, Progress, Typography, Space } from "antd";
import { CloudServerOutlined, DatabaseOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface TopologyTabProps {
  awsTopology: any;
  tenantId: string;
  domain: string;
  quotaGb?: number;
}

export const TopologyTab: React.FC<TopologyTabProps> = ({
  awsTopology = {},
  tenantId,
  domain,
  quotaGb = 100,
}) => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Compute & ALB Ingress */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CloudServerOutlined style={{ color: "#1652f0" }} />
                <span>Container-per-Tenant Compute & Ingress</span>
              </Space>
            }
            size="small"
            variant="borderless"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="ECS Fargate Cluster">
                <code>
                  {awsTopology.cluster_name || "prod-nextcloud-cluster"}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="Dedicated ECS Service">
                <code>
                  {awsTopology.service_name || `service-${tenantId}`}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="Task Definition Family">
                <code>
                  {awsTopology.task_family || `prod-nextcloud-${tenantId}`}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="ALB Target Group">
                <code>
                  {awsTopology.alb_target_group_name || `tg-${tenantId}`}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="Host-Header Routing Rule">
                <Tag color="cyan">
                  {awsTopology.alb_routing_rule || `HostHeader: ${domain}`}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Health Check Path">
                <Tag color="green">
                  {awsTopology.health_check_path || "/status.php"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Storage & Database Tiers */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DatabaseOutlined style={{ color: "#0284c7" }} />
                <span>3-Tier Storage & Database Isolation</span>
              </Space>
            }
            size="small"
            variant="borderless"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="PostgreSQL Physical DB">
                <code>
                  {awsTopology.database_name ||
                    `nc_${tenantId.replace(/-/g, "_")}`}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="RDS Engine">
                <Tag color="geekblue">
                  {awsTopology.database_engine || "PostgreSQL 16.3"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="EFS Access Point">
                <code>{awsTopology.efs_access_point_id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="EFS Posix Mount Path">
                <code>
                  {awsTopology.efs_mount_path ||
                    `/tenants/${tenantId}/config`}{" "}
                  (UID 33)
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="S3 Vault Prefix">
                <code>{awsTopology.s3_vault_prefix}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Storage Quota">
                <div>
                  <Progress percent={18} size="small" status="active" />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    18 GB used of {quotaGb} GB provisioned
                  </Text>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
