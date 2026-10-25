import React from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export const AuditLogList: React.FC = () => {
  const { data, isLoading, refetch } = useList({
    resource: "audit-logs",
  });

  const logs = (data?.data || []) as any[];

  const formatTimestamp = (ts: any) => {
    if (!ts) return "--";
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
    return str.replace("T", " ").substring(0, 19);
  };

  const getActionBadge = (act: any) => {
    const actionStr = String(act || "");
    let variant: "default" | "success" | "destructive" | "warning" | "info" = "default";
    if (actionStr.includes("PROVISION")) variant = "success";
    else if (actionStr.includes("DELETE")) variant = "destructive";
    else if (actionStr.includes("SUSPEND")) variant = "warning";
    else if (actionStr.includes("RESUME")) variant = "info";
    else if (actionStr.includes("LOGIN") || actionStr.includes("MFA"))
      variant = "info";

    return (
      <Badge
        variant={variant}
        className="font-mono text-xs font-semibold uppercase tracking-wider"
      >
        {actionStr || "UNKNOWN"}
      </Badge>
    );
  };

  const getStatusBadge = (st: string) => {
    if (st === "SUCCESS") {
      return (
        <Badge
          variant="success"
          className="flex items-center gap-1 font-semibold"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>SUCCESS</span>
        </Badge>
      );
    }
    if (st === "DENIED") {
      return (
        <Badge
          variant="warning"
          className="flex items-center gap-1 font-semibold"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>DENIED</span>
        </Badge>
      );
    }
    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-1 font-semibold"
      >
        <XCircle className="h-3.5 w-3.5" />
        <span>FAILED</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Immutable Cloud Audit Trail
              </h1>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge
                  variant="success"
                  className="flex items-center gap-1 font-normal text-xs"
                >
                  <Database className="h-3 w-3" />
                  <span>
                    Amazon DynamoDB &amp; CloudWatch Logs (365-Day Retention TTL)
                  </span>
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table Card */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold">Timestamp (UTC)</TableHead>
                <TableHead className="font-semibold">Event Action</TableHead>
                <TableHead className="font-semibold">Target Resource</TableHead>
                <TableHead className="font-semibold">Actor (User)</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Source IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {isLoading
                      ? "Loading audit records..."
                      : "No audit logs recorded yet."}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((record, idx) => (
                  <TableRow
                    key={record.id || record.event_id || idx}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatTimestamp(record.timestamp)}
                    </TableCell>
                    <TableCell>{getActionBadge(record.action)}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium">
                        {record.target || "system"}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {record.actor || "anonymous"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.role === "SuperAdmin"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {record.role || "Unauthenticated"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {record.ip_address || "127.0.0.1"}
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
