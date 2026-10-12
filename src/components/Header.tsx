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
  ToolFilled,
  EyeFilled,
  LockFilled,
} from "@ant-design/icons";

const { Text } = Typography;

export const CustomHeader: React.FC = () => {
  const { data: user } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();

  const role = user?.role || "SuperAdmin";

  const getRoleBadge = () => {
    if (role === "SuperAdmin") {
      return (
        <Tag color="error" icon={<SafetyCertificateFilled />}>
          SuperAdmin (Full Control)
        </Tag>
      );
    }
    if (role === "TenantOperator") {
      return (
        <Tag color="processing" icon={<ToolFilled />}>
          TenantOperator (Ops Only)
        </Tag>
      );
    }
    return (
      <Tag color="warning" icon={<EyeFilled />}>
        SecurityAuditor (Read-Only)
      </Tag>
    );
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <Text strong>{user?.email || "admin@png261.dev"}</Text>
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
          <Text orientation="left" style={{ fontSize: 12, color: "#52c41a" }}>
            MFA: RFC 6238 TOTP Verified
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
        backgroundColor: "#0f1b2a",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid #ec7211",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Space size="middle" align="center">
        <span style={{ fontSize: 24 }}>☁️</span>
        <Text strong style={{ color: "#ffffff", fontSize: 16 }}>
          Filestore Cloud Console
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
          type="link"
          href="https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards/dashboard/prod-Nextcloud-SaaS-Control-Plane"
          target="_blank"
          icon={<LineChartOutlined style={{ color: "#faad14" }} />}
          style={{ color: "#f8fafc" }}
        >
          CloudWatch Dashboard ↗
        </Button>

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
              style={{ backgroundColor: "#ec7211" }}
            />
            <span>{user?.name || "ADMIN"}</span>
          </Button>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
};
