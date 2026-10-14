import React from "react";
import { Alert, Typography } from "antd";
import { renderSeverityTag } from "./helpers";

const { Text, Paragraph } = Typography;

export interface TenantIncidentAlertProps {
  currentStatus: string;
  incident: any;
  lastUpdated?: string;
}

export const TenantIncidentAlert: React.FC<TenantIncidentAlertProps> = ({
  currentStatus,
  incident,
  lastUpdated,
}) => {
  if (
    currentStatus !== "INCIDENT" &&
    currentStatus !== "DEGRADED" &&
    currentStatus !== "MAINTENANCE"
  ) {
    return null;
  }

  return (
    <Alert
      type={currentStatus === "INCIDENT" ? "error" : "warning"}
      showIcon
      style={{ marginBottom: 20 }}
      message={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>ACTIVE INCIDENT: {incident?.title || `Tenant status is ${currentStatus}`}</strong>
            {incident?.severity && <span style={{ marginLeft: 8 }}>{renderSeverityTag(incident.severity)}</span>}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Reported by: {incident?.reported_by || "System"} at {incident?.reported_at || lastUpdated}
          </Text>
        </div>
      }
      description={
        <div style={{ marginTop: 6 }}>
          {incident?.description && (
            <Paragraph style={{ marginBottom: 4 }}>
              <strong>Description:</strong> {incident.description}
            </Paragraph>
          )}
          {incident?.root_cause && (
            <Paragraph style={{ marginBottom: 4 }}>
              <strong>Root Cause:</strong> {incident.root_cause}
            </Paragraph>
          )}
          {incident?.action_taken && (
            <Paragraph style={{ marginBottom: 0 }}>
              <strong>Remediation Taken:</strong> {incident.action_taken}
            </Paragraph>
          )}
        </div>
      }
    />
  );
};
