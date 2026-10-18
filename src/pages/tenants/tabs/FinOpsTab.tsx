import React from "react";
import { Card, Row, Col, Typography, Tag, Progress, Table, Alert, Descriptions } from "antd";
import {
  DollarOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export interface FinOpsTabProps {
  tenantId: string;
  tenant: any;
  finops?: any;
}

export const FinOpsTab: React.FC<FinOpsTabProps> = ({
  tenantId,
  tenant = {},
  finops,
}) => {
  const fData = finops || tenant.finops || {
    plan_tier: "Enterprise",
    monthly_subscription_usd: 499.0,
    total_infra_cost_usd: 12.85,
    gross_margin_percent: 97.4,
    breakdown: {
      s3_vault_storage_usd: 4.6,
      fargate_compute_usd: 5.18,
      bedrock_ai_tokens_usd: 1.05,
      data_transfer_usd: 2.02,
    },
    spot_savings_usd: 7.77,
    storage_used_gb: 200,
    quota_gb: 1000,
    currency: "USD",
    cost_attribution_tag: `storix:tenant-id=${tenantId}`,
  };

  const costBreakdownData = [
    {
      key: "s3",
      category: "S3 Object Vault Storage",
      desc: "Intelligent-Tiering & Primary Encrypted Vault",
      usage: `${fData.storage_used_gb || 200} GB`,
      rate: "$0.023 / GB-mo",
      monthly_cost: `$${(fData.breakdown?.s3_vault_storage_usd || 4.6).toFixed(2)}`,
    },
    {
      key: "compute",
      category: "Amazon ECS Fargate Fleet",
      desc: "1:3 Spot Capacity Provider Strategy",
      usage: "720 hours (Blended Spot)",
      rate: "$0.0144 / hr (Spot 75%)",
      monthly_cost: `$${(fData.breakdown?.fargate_compute_usd || 5.18).toFixed(2)}`,
    },
    {
      key: "ai",
      category: "Amazon Bedrock AI Engine",
      desc: "Claude 3.5 Sonnet Converse API Tokens",
      usage: "150,000 tokens",
      rate: "$0.003 / 1k in, $0.015 / 1k out",
      monthly_cost: `$${(fData.breakdown?.bedrock_ai_tokens_usd || 1.05).toFixed(2)}`,
    },
    {
      key: "network",
      category: "Data Transfer & ALB Egress",
      desc: "Client WebDAV sync & API Gateway",
      usage: "15 GB transfer",
      rate: "$0.09 / GB",
      monthly_cost: `$${(fData.breakdown?.data_transfer_usd || 2.02).toFixed(2)}`,
    },
  ];

  const costColumns = [
    {
      title: "Cost Category",
      dataIndex: "category",
      key: "category",
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.desc}</Text>
        </div>
      ),
    },
    {
      title: "Usage Metrics",
      dataIndex: "usage",
      key: "usage",
    },
    {
      title: "Unit Rate",
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "Monthly Cost (USD)",
      dataIndex: "monthly_cost",
      key: "monthly_cost",
      render: (cost: string) => <Tag color="blue">{cost}</Tag>,
    },
  ];

  const customDomain = tenant.custom_domain || `${tenantId}.customer-portal.com`;
  const domainStatus = tenant.custom_domain_status || "ISSUED_MANAGED";
  const cnameTarget = tenant.cname_target || `dev-nextcloud-alb.ap-southeast-1.elb.amazonaws.com`;

  return (
    <div>
      {/* 1. Top FinOps KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Monthly Subscription</Text>
            <div style={{ marginTop: 8 }}>
              <Title level={3} style={{ margin: 0, color: "#1652f0" }}>
                ${fData.monthly_subscription_usd?.toFixed(2) || "499.00"}
              </Title>
              <Tag color="cyan" style={{ marginTop: 4 }}>Tier: {fData.plan_tier || "Enterprise"}</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Total AWS Infra Cost (COGS)</Text>
            <div style={{ marginTop: 8 }}>
              <Title level={3} style={{ margin: 0, color: "#fa8c16" }}>
                ${fData.total_infra_cost_usd?.toFixed(2) || "12.85"}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Spot Savings: -${fData.spot_savings_usd?.toFixed(2) || "7.77"}
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Gross Profit Margin</Text>
            <div style={{ marginTop: 8 }}>
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                {fData.gross_margin_percent || 97.4}%
              </Title>
              <Progress
                percent={fData.gross_margin_percent || 97.4}
                size="small"
                status="active"
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Cost Allocation Tag</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="purple" style={{ fontSize: 12, padding: "4px 8px" }}>
                {fData.cost_attribution_tag}
              </Tag>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>Granular AWS CUR Attribution</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2. White-Label Custom Domain & SSL Automation Card */}
      <Card
        title={
          <span>
            <GlobalOutlined style={{ marginRight: 8, color: "#1652f0" }} />
            White-Label Custom Domain & Automated SSL (CloudFront SaaS Manager)
          </span>
        }
        variant="borderless"
        style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered>
          <Descriptions.Item label="Custom FQDN">
            <Text strong>{customDomain}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="SSL Status">
            <Tag color="green" icon={<SafetyCertificateOutlined />}>
              {domainStatus}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Edge Target (CNAME)">
            <Text code>{cnameTarget}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Certificate Authority">
            AWS Certificate Manager (ACM) Managed TLS
          </Descriptions.Item>
          <Descriptions.Item label="Edge Distribution">
            Amazon CloudFront SaaS Multi-Tenant Distribution (2,000 SNI capacity)
          </Descriptions.Item>
          <Descriptions.Item label="Automated Validation">
            <Tag color="blue" icon={<CheckCircleOutlined />}>HTTP-01 Managed Token</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 3. Cost Attribution Breakdown Table */}
      <Card
        title={
          <span>
            <DollarOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
            Unit Economics & AWS Infrastructure Cost Breakdown
          </span>
        }
        variant="borderless"
        style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Table
          columns={costColumns}
          dataSource={costBreakdownData}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 4. FinOps Architecture Directives */}
      <Alert
        message="Active FinOps Cost Optimizations"
        description="This tenant utilizes Amazon Fargate Spot capacity (saving 52.5% compute cost), S3 Intelligent-Tiering automatic cold data archiving, and direct-to-S3 multipart upload bypass to achieve a 97%+ gross profit margin."
        type="info"
        showIcon
        icon={<ThunderboltOutlined />}
      />
    </div>
  );
};
