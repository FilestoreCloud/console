import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
    <div className="space-y-4">
      {/* Active Circuit State Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>Incident Circuit Breaker &amp; Accident Log</span>
          </CardTitle>
          <Button
            size="sm"
            onClick={onDeclareIncident}
            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Declare Incident / Change State</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border p-3 text-xs divide-y md:divide-y-0 md:divide-x">
            <div className="flex flex-col gap-1 pb-2 md:pb-0">
              <span className="text-muted-foreground">Current Circuit State:</span>
              <div>{renderStatusTag(currentStatus)}</div>
            </div>
            <div className="flex flex-col gap-1 py-2 md:py-0 md:px-3">
              <span className="text-muted-foreground">Active Incident ID:</span>
              <code className="font-mono font-bold text-foreground">
                {incident?.incident_id || "None"}
              </code>
            </div>
            <div className="flex flex-col gap-1 pt-2 md:pt-0 md:px-3">
              <span className="text-muted-foreground">Active Severity:</span>
              <div>
                {incident?.severity ? (
                  renderSeverityTag(incident.severity)
                ) : (
                  <Badge variant="success" className="text-xs">
                    NORMAL
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents History Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold">
            Historical Incident Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-xs">Incident ID</TableHead>
                <TableHead className="font-semibold text-xs">Severity</TableHead>
                <TableHead className="font-semibold text-xs">Title / Summary</TableHead>
                <TableHead className="font-semibold text-xs">Resolution State</TableHead>
                <TableHead className="font-semibold text-xs">Reported By</TableHead>
                <TableHead className="font-semibold text-xs">Reported At</TableHead>
                <TableHead className="font-semibold text-xs">Resolved At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentsHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    Zero recorded incidents for this tenant.
                  </TableCell>
                </TableRow>
              ) : (
                incidentsHistory.map((rec) => (
                  <TableRow key={rec.incident_id} className="text-xs">
                    <TableCell className="font-mono text-muted-foreground">
                      {rec.incident_id}
                    </TableCell>
                    <TableCell>{renderSeverityTag(rec.severity)}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-semibold">{rec.title}</span>
                        {rec.root_cause && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Root Cause: {rec.root_cause}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rec.status === "RESOLVED"
                            ? "success"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {rec.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{rec.reported_by}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {rec.reported_at}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {rec.resolved_at || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
