import React from "react";
import { useList } from "@refinedev/core";
import { Table, Card, Tag, Typography, Button, Space, Row, Col } from "antd";
import {
  SafetyCertificateOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export const AuditLogList: React.FC = () => {
  const { data, isLoading, refetch } = useList({
    resource: "audit-logs",
  });

  const logs = (data?.data || []) as any[];

  const columns = [
    {
      title: "Timestamp (UTC)",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (ts: any) => {
        if (!ts) return <Text style={{ fontFamily: "monospace", fontSize: 12 }}>--</Text>;
        let str = String(ts);
        if (typeof ts === "number" || (!str.includes("T") && !isNaN(Number(ts)))) {
          try {
            const num = Number(ts);
            const date = new Date(num > 1e11 ? num : num * 1000);
            str = date.toISOString();
          } catch {
            str = String(ts);
          }
        }
        return (
          <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
            {str.replace("T", " ").substring(0, 19)}
          </Text>
        );
      },
    },
    {
      title: "Event Action",
      dataIndex: "action",
      key: "action",
      render: (act: any) => {
        const actionStr = String(act || "");
        let color = "default";
        if (actionStr.includes("PROVISION")) color = "green";
        else if (actionStr.includes("DELETE")) color = "red";
        else if (actionStr.includes("SUSPEND")) color = "orange";
        else if (actionStr.includes("RESUME")) color = "blue";
        else if (actionStr.includes("LOGIN") || actionStr.includes("MFA"))
          color = "purple";

        return (
          <Tag
            color={color}
            style={{ fontFamily: "monospace", fontWeight: 600 }}
          >
            {actionStr || "UNKNOWN"}
          </Tag>
        );
      },
    },
    {
      title: "Target Resource",
      dataIndex: "target",
      key: "target",
      render: (tgt: string) => <Text code>{tgt || "system"}</Text>,
    },
    {
      title: "Actor (User)",
      dataIndex: "actor",
      key: "actor",
      render: (actor: string) => (
        <Text style={{ fontSize: 13 }}>{actor || "anonymous"}</Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const color = role === "SuperAdmin" ? "red" : "default";
        return <Tag color={color}>{role || "Unauthenticated"}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st: string) => {
        if (st === "SUCCESS") {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              SUCCESS
            </Tag>
          );
        }
        if (st === "DENIED") {
          return (
            <Tag color="warning" icon={<ExclamationCircleOutlined />}>
              DENIED
            </Tag>
          );
        }
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            FAILED
          </Tag>
        );
      },
    },
    {
      title: "Source IP",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (ip: string) => (
        <Text
          type="secondary"
          style={{ fontFamily: "monospace", fontSize: 12 }}
        >
          {ip || "127.0.0.1"}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <Card
        variant="borderless"
        style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <span style={{ fontSize: 20 }}>📜</span>
              <div>
                <Text strong style={{ fontSize: 16, display: "block" }}>
                  Immutable Cloud Audit Trail
                </Text>
                <Tag
                  color="success"
                  icon={<DatabaseOutlined />}
                  style={{ marginTop: 4 }}
                >
                  Amazon DynamoDB &amp; CloudWatch Logs (365-Day Retention TTL)
                </Tag>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              Refresh Logs
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        variant="borderless"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};
