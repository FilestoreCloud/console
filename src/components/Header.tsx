import React from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Layout,
  Space,
  Tag,
  Dropdown,
  Button,
  Typography,
  Avatar,
  MenuProps,
} from "antd";
import {
  SafetyCertificateFilled,
  LogoutOutlined,
  GlobalOutlined,
  CheckCircleFilled,
  LineChartOutlined,
  UserOutlined,
  LockFilled,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";

const { Text } = Typography;

export interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const CustomHeader: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
}) => {
  const { data: user } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();

  const role = user?.role || "SuperAdmin";

  const getRoleBadge = () => {
    return (
      <Tag color="error" icon={<SafetyCertificateFilled />}>
        SuperAdmin (Full Control)
      </Tag>
    );
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <Text strong>{user?.email || "SuperAdmin"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Role: {role}
          </Text>
        </div>
      ),
    },
    {
      key: "mfa-status",
      label: (
        <Space style={{ padding: "2px 8px" }}>
          <CheckCircleFilled style={{ color: "#52c41a" }} />
          <Text style={{ fontSize: 12, color: "#52c41a" }}>
            MFA: Verified
          </Text>
        </Space>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      danger: true,
      label: "Sign Out",
      onClick: () => logout(),
    },
  ];

  return (
    <Layout.Header
      style={{
        backgroundColor: "#071736",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid #1652f0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Space size="middle" align="center">
        <img
          src="/storix-icon.png"
          alt="Storix"
          style={{ width: 28, height: 28, objectFit: "contain" }}
        />
        <Text strong style={{ color: "#ffffff", fontSize: 16 }}>
          Storix Console
        </Text>
        <Tag
          color="default"
          style={{
            backgroundColor: "#1e293b",
            color: "#cbd5e1",
            borderColor: "#334155",
          }}
        >
          <GlobalOutlined style={{ marginRight: 4 }} /> Region: ap-southeast-1
        </Tag>
        <Tag
          color="success"
          style={{
            backgroundColor: "rgba(82, 196, 26, 0.15)",
            borderColor: "#52c41a",
          }}
        >
          <CheckCircleFilled style={{ marginRight: 4 }} /> Online
        </Tag>
      </Space>

      <Space size="middle" align="center">
        <Button
          size="small"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
          style={{
            backgroundColor: isDark ? "#1e293b" : "#334155",
            borderColor: "#475569",
            color: "#e2e8f0",
            fontSize: 12,
          }}
        >
          ⌘K Palette
        </Button>

        <Button
          type="link"
          href="https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards/dashboard/prod-Nextcloud-SaaS-Control-Plane"
          target="_blank"
          icon={<LineChartOutlined style={{ color: "#faad14" }} />}
          style={{ color: "#f8fafc" }}
        >
          CloudWatch Dashboard ↗
        </Button>

        {onToggleTheme && (
          <Button
            size="small"
            icon={
              isDark ? (
                <BulbFilled style={{ color: "#faad14" }} />
              ) : (
                <BulbOutlined style={{ color: "#ffffff" }} />
              )
            }
            onClick={onToggleTheme}
            style={{
              backgroundColor: isDark ? "#1e293b" : "#334155",
              borderColor: "#475569",
              color: "#ffffff",
            }}
          >
            {isDark ? "Dark" : "Light"}
          </Button>
        )}

        {getRoleBadge()}

        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button
            type="text"
            style={{
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1652f0" }}
            />
            <span>{user?.name || "ADMIN"}</span>
          </Button>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
};
