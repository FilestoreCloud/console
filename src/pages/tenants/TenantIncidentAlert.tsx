import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon, AlertTriangle } from "lucide-react";
import { renderSeverityTag } from "./helpers";

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

  const isIncident = currentStatus === "INCIDENT";

  return (
    <Alert
      variant={isIncident ? "destructive" : "warning"}
      className="mb-5 shadow-sm"
    >
      <div className="flex items-start gap-2.5">
        {isIncident ? (
          <AlertOctagon className="h-5 w-5 mt-0.5 text-red-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600" />
        )}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTitle className="font-bold text-sm">
                ACTIVE INCIDENT: {incident?.title || `Tenant status is ${currentStatus}`}
              </AlertTitle>
              {incident?.severity && (
                <span>{renderSeverityTag(incident.severity)}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Reported by: {incident?.reported_by || "System"} at{" "}
              {incident?.reported_at || lastUpdated}
            </span>
          </div>

          <AlertDescription className="text-xs space-y-1 pt-1 text-foreground">
            {incident?.description && (
              <p>
                <strong>Description:</strong> {incident.description}
              </p>
            )}
            {incident?.root_cause && (
              <p>
                <strong>Root Cause:</strong> {incident.root_cause}
              </p>
            )}
            {incident?.action_taken && (
              <p>
                <strong>Remediation Taken:</strong> {incident.action_taken}
              </p>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
