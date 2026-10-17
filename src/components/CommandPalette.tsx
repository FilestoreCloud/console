import React, { useState, useEffect } from "react";
import { Modal, Input, List, Typography, Space, Tag } from "antd";
import {
  SearchOutlined,
  CompassOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ClusterOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

export interface CommandPaletteProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

interface CommandItem {
  key: string;
  category: "Navigation" | "Action" | "Quick Setting";
  title: string;
  description: string;
  icon: React.ReactNode;
  handler: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isDark,
  onToggleTheme,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands: CommandItem[] = [
    {
      key: "nav-tenants",
      category: "Navigation",
      title: "Fleet Tenants",
      description: "Manage tenant instances, sandbox staging, and scaling",
      icon: <ClusterOutlined style={{ color: "#1652f0" }} />,
      handler: () => {
        navigate("/tenants");
        setOpen(false);
      },
    },
    {
      key: "nav-audit",
      category: "Navigation",
      title: "Audit Logs",
      description: "Inspect immutable security logs and operator activities",
      icon: <SafetyCertificateOutlined style={{ color: "#52c41a" }} />,
      handler: () => {
        navigate("/audit-logs");
        setOpen(false);
      },
    },
    {
      key: "nav-telemetry",
      category: "Navigation",
      title: "Telemetry & Telemetry Dashboard",
      description: "CloudWatch metrics, ECS CPU/RAM, and WebDAV latency",
      icon: <LineChartOutlined style={{ color: "#faad14" }} />,
      handler: () => {
        navigate("/telemetry");
        setOpen(false);
      },
    },
    {
      key: "nav-webhooks",
      category: "Navigation",
      title: "Webhook Integrations",
      description: "Configure HTTP notification webhooks and dispatch history",
      icon: <BellOutlined style={{ color: "#722ed1" }} />,
      handler: () => {
        navigate("/settings/webhooks");
        setOpen(false);
      },
    },
    {
      key: "act-theme",
      category: "Quick Setting",
      title: `Switch to ${isDark ? "Light" : "Dark"} Mode`,
      description: "Toggle dynamic Ant Design 5 light/dark color theme",
      icon: <BulbOutlined style={{ color: "#fa8c16" }} />,
      handler: () => {
        if (onToggleTheme) onToggleTheme();
        setOpen(false);
      },
    },
    {
      key: "act-suspend",
      category: "Action",
      title: "Emergency Suspend: dev-tenant",
      description: "Scale ECS Fargate tasks to 0 for FinOps cost reduction",
      icon: <ThunderboltOutlined style={{ color: "#ff4d4f" }} />,
      handler: () => {
        navigate("/tenants");
        setOpen(false);
      },
    },
    {
      key: "act-resume",
      category: "Action",
      title: "Resume Fleet: dev-tenant",
      description: "Scale ECS Fargate tasks to 1 for active user traffic",
      icon: <ThunderboltOutlined style={{ color: "#13c2c2" }} />,
      handler: () => {
        navigate("/tenants");
        setOpen(false);
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#8c8c8c",
          }}
        >
          <span>Use <b>↑</b> <b>↓</b> to navigate, <b>ESC</b> to dismiss</span>
          <span>Storix Command Palette <b>Cmd + K</b></span>
        </div>
      }
      width={560}
      destroyOnClose
      style={{ top: 120 }}
    >
      <Input
        prefix={<SearchOutlined style={{ color: "#1652f0" }} />}
        placeholder="Type a command or search (e.g. Tenants, Audit, Theme, Suspend)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        allowClear
        style={{ marginBottom: 16, fontSize: 16, padding: "8px 12px" }}
      />
      <List
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item
            onClick={item.handler}
            style={{
              cursor: "pointer",
              padding: "10px 14px",
              borderRadius: 6,
              transition: "background-color 0.2s",
            }}
            className="command-palette-item"
          >
            <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
              <Space>
                {item.icon}
                <div>
                  <Text strong>{item.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.description}
                  </Text>
                </div>
              </Space>
              <Tag color={item.category === "Navigation" ? "blue" : item.category === "Action" ? "red" : "orange"}>
                {item.category}
              </Tag>
            </Space>
          </List.Item>
        )}
      />
    </Modal>
  );
};
