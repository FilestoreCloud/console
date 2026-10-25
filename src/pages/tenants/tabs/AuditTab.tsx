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

export interface AuditTabProps {
  auditLogs: any[];
  tenantId: string;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  auditLogs = [],
  tenantId,
}) => {
  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardHeader className="py-4 px-5 border-b">
        <CardTitle className="text-sm font-semibold">
          Compliance &amp; Audit Log for &apos;{tenantId}&apos;
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-xs">Timestamp</TableHead>
              <TableHead className="font-semibold text-xs">Actor</TableHead>
              <TableHead className="font-semibold text-xs">Role</TableHead>
              <TableHead className="font-semibold text-xs">Action</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No audit events recorded yet for this tenant.
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log, idx) => (
                <TableRow key={log.event_id || idx} className="text-xs">
                  <TableCell className="font-mono text-muted-foreground text-[11px]">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="font-semibold">{log.actor}</TableCell>
                  <TableCell>
                    <Badge variant="info" className="text-xs">
                      {log.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning" className="text-xs">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={log.status === "SUCCESS" ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] font-mono text-muted-foreground line-clamp-2">
                      {typeof log.details === "string"
                        ? log.details
                        : JSON.stringify(log.details)}
                    </code>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
