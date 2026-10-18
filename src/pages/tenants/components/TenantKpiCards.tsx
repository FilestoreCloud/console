import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  HddOutlined,
} from "@ant-design/icons";

export interface TenantKpiCardsProps {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalQuota: number;
}

export const TenantKpiCards: React.FC<TenantKpiCardsProps> = ({
  totalTenants,
  activeTenants,
  suspendedTenants,
  totalQuota,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card
          variant="borderless"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <Statistic
            title="TOTAL REGISTERED TENANTS"
            value={totalTenants}
            prefix={<AppstoreOutlined style={{ color: "#3b82f6" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          variant="borderless"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <Statistic
            title="ACTIVE DEPLOYMENTS"
            value={activeTenants}
            valueStyle={{ color: "#16a34a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          variant="borderless"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <Statistic
            title="SUSPENDED DEPLOYMENTS"
            value={suspendedTenants}
            valueStyle={{ color: "#ea580c" }}
            prefix={<PauseCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card
          variant="borderless"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <Statistic
            title="ALLOCATED STORAGE"
            value={totalQuota}
            suffix="GB"
            valueStyle={{ color: "#0284c7" }}
            prefix={<HddOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};
