import React from "react";
import { Card, Table, Tag, Typography, Button, Space, Descriptions } from "antd";
import { WarningOutlined, AlertOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface IncidentsTabProps {
  currentStatus: string;
  incident: any;
  incidentsHistory: any[];
  renderStatusTag: (status: string) => React.ReactNode;
  renderSeverityTag: (sev: string) => React.ReactNode;
  onDeclareIncident: () => void;
}

export const IncidentsTab: React.FC<IncidentsTabProps> = ({
  currentStatus,
  incident,
  incidentsHistory = [],
  renderStatusTag,
  renderSeverityTag,
  onDeclareIncident,
}) => {
  return (
    <div>
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
              <AlertOutlined style={{ color: "#ef4444" }} />
              <span>Incident Circuit Breaker & Accident Log</span>
            </Space>
            <Button
              type="primary"
              danger
              size="small"
              icon={<WarningOutlined />}
              onClick={onDeclareIncident}
            >
              Declare Incident / Change State
            </Button>
          </div>
        }
        variant="borderless"
        style={{
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Descriptions column={{ xs: 1, md: 3 }} size="small" bordered>
          <Descriptions.Item label="Current Circuit State">
            {renderStatusTag(currentStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="Active Incident ID">
            <code>{incident?.incident_id || "None"}</code>
          </Descriptions.Item>
          <Descriptions.Item label="Active Severity">
            {incident?.severity ? (
              renderSeverityTag(incident.severity)
            ) : (
              <Tag color="green">NORMAL</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Incidents History Table */}
      <Card
        title="Historical Incident Records"
        variant="borderless"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Table
          dataSource={incidentsHistory}
          rowKey="incident_id"
          pagination={false}
          size="middle"
          locale={{
            emptyText: "Zero recorded incidents for this tenant.",
          }}
          columns={[
            {
              title: "Incident ID",
              dataIndex: "incident_id",
              key: "incident_id",
              render: (id: string) => <code>{id}</code>,
            },
            {
              title: "Severity",
              dataIndex: "severity",
              key: "severity",
              render: (s: string) => renderSeverityTag(s),
            },
            {
              title: "Title / Summary",
              dataIndex: "title",
              key: "title",
              render: (t: string, rec: any) => (
                <div>
                  <Text strong>{t}</Text>
                  {rec.root_cause && (
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Root Cause: {rec.root_cause}
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: "Resolution State",
              dataIndex: "status",
              key: "status",
              render: (st: string) => (
                <Tag color={st === "RESOLVED" ? "green" : "volcano"}>
                  {st}
                </Tag>
              ),
            },
            {
              title: "Reported By",
              dataIndex: "reported_by",
              key: "reported_by",
            },
            {
              title: "Reported At",
              dataIndex: "reported_at",
              key: "reported_at",
              render: (ts: string) => (
                <Text style={{ fontSize: 12 }}>{ts}</Text>
              ),
            },
            {
              title: "Resolved At",
              dataIndex: "resolved_at",
              key: "resolved_at",
              render: (ts: string) => (
                <Text style={{ fontSize: 12 }}>{ts || "-"}</Text>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
