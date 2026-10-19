import React from "react";
import { Card, Table, Tag, Typography } from "antd";

const { Text, Paragraph } = Typography;

export interface AuditTabProps {
  auditLogs: any[];
  tenantId: string;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  auditLogs = [],
  tenantId,
}) => {
  return (
    <Card
      title={`Compliance & Audit Log for '${tenantId}'`}
      variant="borderless"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <Table
        dataSource={auditLogs}
        rowKey="event_id"
        pagination={{ pageSize: 10 }}
        size="small"
        scroll={{ x: 750 }}
        locale={{
          emptyText: "No audit events recorded yet for this tenant.",
        }}
        columns={[
          {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (t: string) => <Text style={{ fontSize: 11 }}>{t}</Text>,
          },
          {
            title: "Actor",
            dataIndex: "actor",
            key: "actor",
            render: (a: string) => <Text strong>{a}</Text>,
          },
          {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (r: string) => <Tag color="blue">{r}</Tag>,
          },
          {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (act: string) => <Tag color="orange">{act}</Tag>,
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (s: string) => (
              <Tag color={s === "SUCCESS" ? "green" : "red"}>{s}</Tag>
            ),
          },
          {
            title: "Details",
            dataIndex: "details",
            key: "details",
            render: (d: any) => (
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                {typeof d === "string" ? d : JSON.stringify(d)}
              </Paragraph>
            ),
          },
        ]}
      />
    </Card>
  );
};
