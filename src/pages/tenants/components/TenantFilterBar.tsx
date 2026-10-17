import React from "react";
import { Card, Row, Col, Space, Input, Select, Button } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

export interface TenantFilterBarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  canCreate?: boolean;
  onOpenCreateModal: () => void;
}

export const TenantFilterBar: React.FC<TenantFilterBarProps> = ({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isLoading,
  canCreate,
  onOpenCreateModal,
}) => {
  return (
    <Card
      variant="borderless"
      style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Space style={{ width: "100%" }}>
            <Input
              placeholder="Search Tenant ID, domain, email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={onStatusFilterChange}
              style={{ width: 170 }}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "ACTIVE", label: "Active Only" },
                { value: "PROVISIONING", label: "Provisioning Only" },
                { value: "DELETING", label: "Deleting Only" },
                { value: "SUSPENDING", label: "Suspending Only" },
                { value: "RESUMING", label: "Resuming Only" },
                { value: "SUSPENDED", label: "Suspended Only" },
                { value: "FAILED", label: "Failed Only" },
              ]}
            />
          </Space>
        </Col>

        <Col xs={24} md={12} style={{ textAlign: "right" }}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onOpenCreateModal}
                style={{ backgroundColor: "#1652f0", borderColor: "#1652f0" }}
              >
                Provision Dedicated Tenant
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
