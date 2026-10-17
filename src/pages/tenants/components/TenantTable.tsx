import React from "react";
import {
  Card,
  Table,
  Space,
  Button,
  Tag,
  Typography,
  Tooltip,
  Popconfirm,
  Alert,
} from "antd";
import {
  BranchesOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  EyeOutlined,
  LineChartOutlined,
  ExperimentOutlined,
  PauseOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  LockOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { renderStatusTag } from "../helpers";

const { Text } = Typography;

export interface TenantTableProps {
  tenants: any[];
  filteredTenants: any[];
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  canDelete?: { can?: boolean; reason?: string };
  onToggleStatus: (tenantId: string, currentStatus: string) => void;
  onSeedTenant: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => void;
  onOpenForkModal: (record: any) => void;
  onShowTenant: (tenantId: string) => void;
  onNavigate: (path: string) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  filteredTenants,
  isLoading,
  isUpdating,
  isDeleting,
  canDelete,
  onToggleStatus,
  onSeedTenant,
  onDeleteTenant,
  onOpenForkModal,
  onShowTenant,
  onNavigate,
}) => {
  const inFlightTenants = tenants.filter((t) =>
    [
      "PROVISIONING",
      "DELETING",
      "DEPROVISIONING",
      "SUSPENDING",
      "RESUMING",
      "SEEDING",
      "UPGRADING",
    ].includes(t.status),
  );
  const hasInFlightTenants = inFlightTenants.length > 0;

  const columns = [
    {
      title: "Tenant Identifier",
      dataIndex: "tenant_id",
      key: "tenant_id",
      render: (tid: string, record: any) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="link"
              style={{ padding: 0, fontWeight: 700, fontSize: 14 }}
              onClick={() => onShowTenant(tid)}
            >
              {tid}
            </Button>
            {record.is_sandbox && (
              <Tooltip
                title={
                  record.cloned_from
                    ? `Forked from '${record.cloned_from}'`
                    : "Isolated Staging Sandbox"
                }
              >
                <Tag
                  color="purple"
                  icon={<BranchesOutlined />}
                  style={{ marginLeft: 6, fontSize: 10 }}
                >
                  SANDBOX
                </Tag>
              </Tooltip>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Partition: HASH (AWS Fargate)
          </Text>
        </div>
      ),
    },
    {
      title: "Dedicated Ingress",
      dataIndex: "domain",
      key: "domain",
      render: (domain: string, record: any) => {
        const fullDomain = domain || `${record.tenant_id}.png261.dev`;
        return (
          <div>
            <a
              href={`https://${fullDomain}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 600, color: "#0284c7" }}
            >
              {fullDomain} <LinkOutlined style={{ fontSize: 11 }} />
            </a>
            <div style={{ marginTop: 2 }}>
              <Tag
                color="gold"
                icon={<SafetyCertificateOutlined />}
                style={{ fontSize: 10 }}
              >
                AWS Secrets Manager
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Admin Contact",
      dataIndex: "admin_email",
      key: "admin_email",
      render: (email: string) => (
        <Text style={{ fontSize: 13 }}>{email || "admin@acme.com"}</Text>
      ),
    },
    {
      title: "Quota",
      dataIndex: "quota_gb",
      key: "quota_gb",
      render: (quota: any) => <Tag color="blue">{quota || 100} GB</Tag>,
    },
    {
      title: "Status & Progress",
      dataIndex: "status",
      key: "status",
      render: (st: string, record: any) => renderStatusTag(st, record),
    },
    {
      title: "Isolated Infrastructure",
      key: "infra",
      render: (_: any, record: any) => {
        const svc = record.service_name || `service-${record.tenant_id}`;
        const db =
          record.database_name || `nc_${record.tenant_id.replace(/-/g, "_")}`;
        const ap =
          record.efs_access_point_id || `/tenants/${record.tenant_id}/config`;
        return (
          <Space direction="vertical" size={2}>
            <Tag
              color={record.status === "ACTIVE" ? "green" : "default"}
              icon={<ClusterOutlined />}
            >
              {svc} ({record.status === "ACTIVE" ? "1 task" : "0 tasks / $0"})
            </Tag>
            <Tag color="cyan" icon={<DatabaseOutlined />}>
              {db}
            </Tag>
            <Tag
              color="default"
              style={{ fontSize: 10, fontFamily: "monospace" }}
            >
              {ap}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: any) => {
        const isActive = record.status === "ACTIVE";
        const isInFlight = [
          "PROVISIONING",
          "DELETING",
          "DEPROVISIONING",
          "SUSPENDING",
          "RESUMING",
          "SEEDING",
          "UPGRADING",
        ].includes(record.status);
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => onShowTenant(record.tenant_id)}
            >
              Manage
            </Button>

            <Button
              size="small"
              icon={<LineChartOutlined style={{ color: "#1652f0" }} />}
              onClick={() =>
                onNavigate(`/tenants/${record.tenant_id}?tab=metrics`)
              }
            >
              Metrics
            </Button>

            {isActive && (
              <Popconfirm
                title="Seed Demo Showcase Data?"
                description={`Run dedicated TenantSeedingStateMachine for '${record.tenant_id}'?`}
                onConfirm={() => onSeedTenant(record.tenant_id)}
                okText="Seed Demo"
                cancelText="Cancel"
                disabled={isInFlight}
              >
                <Button
                  size="small"
                  icon={<ExperimentOutlined style={{ color: "#722ed1" }} />}
                  style={{ color: "#722ed1", borderColor: "#d3adf7" }}
                  disabled={isInFlight}
                >
                  Seed
                </Button>
              </Popconfirm>
            )}

            <Button
              size="small"
              icon={<BranchesOutlined />}
              style={{ color: "#8b5cf6", borderColor: "#8b5cf6" }}
              onClick={() => onOpenForkModal(record)}
              disabled={isInFlight}
            >
              Fork
            </Button>

            <Button
              size="small"
              icon={isActive ? <PauseOutlined /> : <CaretRightOutlined />}
              onClick={() =>
                onToggleStatus(record.tenant_id, record.status)
              }
              loading={isUpdating && isInFlight}
              disabled={isInFlight}
            >
              {isActive ? "Suspend" : "Resume"}
            </Button>

            {canDelete?.can ? (
              <Popconfirm
                title="Permanently Delete Tenant?"
                description={`Delete tenant "${record.tenant_id}" and tear down dedicated ECS service & target group?`}
                onConfirm={() => onDeleteTenant(record.tenant_id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                disabled={isInFlight}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={isDeleting && isInFlight}
                  disabled={isInFlight}
                />
              </Popconfirm>
            ) : (
              <Tooltip
                title={canDelete?.reason || "Restricted to SuperAdmin role"}
              >
                <Button size="small" disabled icon={<LockOutlined />} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      variant="borderless"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      {hasInFlightTenants && (
        <Alert
          message={
            <Space>
              <SyncOutlined spin style={{ color: "#1890ff" }} />
              <Text strong>AWS Step Functions Fleet Orchestration Active</Text>
              <span>
                — {inFlightTenants.length} operation(s) in progress (
                {[
                  inFlightTenants.filter((t) => t.status === "PROVISIONING")
                    .length > 0 &&
                    `${inFlightTenants.filter((t) => t.status === "PROVISIONING").length} creating`,
                  inFlightTenants.filter((t) =>
                    ["DELETING", "DEPROVISIONING"].includes(t.status),
                  ).length > 0 &&
                    `${inFlightTenants.filter((t) => ["DELETING", "DEPROVISIONING"].includes(t.status)).length} deleting`,
                  inFlightTenants.filter((t) => t.status === "SUSPENDING")
                    .length > 0 &&
                    `${inFlightTenants.filter((t) => t.status === "SUSPENDING").length} suspending`,
                  inFlightTenants.filter((t) => t.status === "RESUMING")
                    .length > 0 &&
                    `${inFlightTenants.filter((t) => t.status === "RESUMING").length} resuming`,
                  inFlightTenants.filter((t) => t.status === "SEEDING")
                    .length > 0 &&
                    `${inFlightTenants.filter((t) => t.status === "SEEDING").length} seeding`,
                  inFlightTenants.filter((t) => t.status === "UPGRADING")
                    .length > 0 &&
                    `${inFlightTenants.filter((t) => t.status === "UPGRADING").length} upgrading`,
                ]
                  .filter(Boolean)
                  .join(", ")}
                ). Real-time progress is auto-polling every 2.5s.
              </span>
            </Space>
          }
          type="info"
          showIcon={false}
          style={{ marginBottom: 16 }}
        />
      )}
      <Table
        columns={columns}
        dataSource={filteredTenants}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
};
