import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export interface AuditTabProps {
  auditLogs: any[];
  tenantId: string;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  auditLogs = [],
  tenantId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const detailsStr =
      typeof log.details === "string" ? log.details : JSON.stringify(log.details || "");
    return (
      (log.actor || "").toLowerCase().includes(q) ||
      (log.action || "").toLowerCase().includes(q) ||
      (log.role || "").toLowerCase().includes(q) ||
      (log.status || "").toLowerCase().includes(q) ||
      detailsStr.toLowerCase().includes(q)
    );
  });

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 sm:px-6 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <CardTitle className="text-sm font-semibold">
          Compliance &amp; Audit Log for &apos;{tenantId}&apos; ({auditLogs.length})
        </CardTitle>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search actor, action, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[380px] overflow-auto">
          <Table>
            <TableHeader className="bg-card sticky top-0 z-10 border-b">
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
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    {searchTerm
                      ? "No audit events match your search."
                      : "No audit events recorded yet for this tenant."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, idx) => (
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
        </div>
      </CardContent>
    </Card>
  );
};
