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
      <Row justify="space-between" align="middle" gutter={[12, 12]}>
        <Col xs={24} lg={14}>
          <Space wrap style={{ width: "100%" }}>
            <Input
              placeholder="Search Tenant ID, domain, email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ minWidth: 200, maxWidth: 320 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={onStatusFilterChange}
              style={{ width: 160 }}
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

        <Col xs={24} lg={10}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
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
          </div>
        </Col>
      </Row>
    </Card>
  );
};
