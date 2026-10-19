import React from "react";
import { Card, Table, Tag, Typography, Button, Space } from "antd";
import { UserOutlined, PlusOutlined, KeyOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface AccountsTabProps {
  accounts: any[];
  onAddAccount: () => void;
  onResetPassword: (username: string) => void;
  onToggleAccountStatus: (username: string, currentStatus: string) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts = [],
  onAddAccount,
  onResetPassword,
  onToggleAccountStatus,
}) => {
  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <UserOutlined style={{ color: "#3b82f6" }} />
            <span>User Accounts Directory ({accounts.length})</span>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={onAddAccount}
          >
            Add Account
          </Button>
        </div>
      }
      variant="borderless"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <Table
        dataSource={accounts}
        rowKey="username"
        pagination={false}
        size="middle"
        columns={[
          {
            title: "Username",
            dataIndex: "username",
            key: "username",
            render: (u: string, record: any) => (
              <div>
                <Text strong>{u}</Text>
                {record.role === "TenantAdmin" && (
                  <Tag color="gold" style={{ marginLeft: 6, fontSize: 10 }}>
                    ADMIN
                  </Tag>
                )}
              </div>
            ),
          },
          {
            title: "Display Name",
            dataIndex: "display_name",
            key: "display_name",
          },
          {
            title: "Email",
            dataIndex: "email",
            key: "email",
          },
          {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (r: string) => <Tag color="blue">{r}</Tag>,
          },
          {
            title: "Quota / Storage",
            key: "quota",
            render: (_: any, record: any) => (
              <span>
                {record.storage_used_gb || 0} GB / {record.quota_gb || 50} GB
              </span>
            ),
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (st: string) =>
              st === "ACTIVE" ? (
                <Tag color="success">ACTIVE</Tag>
              ) : (
                <Tag color="default">DISABLED</Tag>
              ),
          },
          {
            title: "MFA",
            dataIndex: "mfa_enabled",
            key: "mfa_enabled",
            render: (mfa: boolean) =>
              mfa ? <Tag color="green">ENABLED</Tag> : <Tag color="default">NONE</Tag>,
          },
          {
            title: "Last Login",
            dataIndex: "last_login",
            key: "last_login",
            render: (ll: string) => (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {ll}
              </Text>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            align: "right" as const,
            render: (_: any, record: any) => (
              <Space>
                <Button
                  size="small"
                  type={record.role === "TenantAdmin" ? "primary" : "default"}
                  ghost={record.role === "TenantAdmin"}
                  icon={<KeyOutlined />}
                  onClick={() => onResetPassword(record.username)}
                >
                  {record.role === "TenantAdmin" ? "Set / Reset Password" : "Reset Password"}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    onToggleAccountStatus(record.username, record.status)
                  }
                >
                  {record.status === "ACTIVE" ? "Disable" : "Enable"}
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
};
