import React, { useState, useEffect } from "react";
import { useCustom, useList } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Server,
  Zap,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { InteractiveMetricsChart } from "../../components/InteractiveMetricsChart";
import { dataProvider } from "../../providers/dataProvider";

export const DashboardPage: React.FC = () => {
  const [intervalSec, setIntervalSec] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");
  const [auditSearch, setAuditSearch] = useState<string>("");

  // 1. Fetch fleet raw metrics
  const { data: rawMetricsResp, refetch: refetchRawMetrics, isLoading: metricsLoading } = useCustom({
    url: dataProvider.getApiUrl(),
    method: "post",
    config: { payload: { action: "METRICS" } },
  });

  // 2. Fetch fleet tenants count
  const { data: tenantsResp, refetch: refetchTenants } = useList({
    resource: "tenants",
  });

  // 3. Fetch audit logs
  const { data: auditResp, refetch: refetchAudit, isLoading: auditLoading } = useList({
    resource: "audit-logs",
  });

  const refreshAll = () => {
    refetchRawMetrics();
    refetchTenants();
    refetchAudit();
    setLastUpdate(new Date().toTimeString().split(" ")[0]);
    setCountdown(intervalSec);
  };

  useEffect(() => {
    if (intervalSec === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshAll();
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [intervalSec]);

  const fleetMetrics = (rawMetricsResp?.data as any)?.metrics;
  const tenants = (tenantsResp?.data || []) as any[];
  const auditLogs = (auditResp?.data || []) as any[];

  const filteredAuditLogs = auditLogs.filter((log: any) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      String(log.actor || "").toLowerCase().includes(q) ||
      String(log.action || "").toLowerCase().includes(q) ||
      String(log.target || log.tenant_id || "").toLowerCase().includes(q) ||
      String(log.ip_address || "").toLowerCase().includes(q)
    );
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
  const avgCpu = fleetMetrics?.current_cpu_percent ?? 18.4;
  const activeConnections = fleetMetrics?.active_connections ?? 124;

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
    let badgeClass = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    if (actionStr.includes("PROVISION")) {
      badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
    } else if (actionStr.includes("DELETE")) {
      badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
    } else if (actionStr.includes("SUSPEND")) {
      badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
    } else if (actionStr.includes("RESUME")) {
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
    }

    return (
      <Badge variant="outline" className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}>
        {actionStr || "UNKNOWN"}
      </Badge>
    );
  };

  const getStatusBadge = (st: string) => {
    if (st === "SUCCESS") {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1 text-xs">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          <span>SUCCESS</span>
        </Badge>
      );
    }
    if (st === "DENIED") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 gap-1 text-xs">
          <AlertTriangle className="h-3 w-3 text-amber-600" />
          <span>DENIED</span>
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <XCircle className="h-3 w-3" />
        <span>FAILED</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Top Header & Controls */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                SuperAdmin Control Plane Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Unified live fleet telemetry, infrastructure health, and real-time Cloud Audit Trail.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Polling:</span>
              <Select
                value={String(intervalSec)}
                onValueChange={(val) => {
                  const sec = Number(val);
                  setIntervalSec(sec);
                  setCountdown(sec);
                }}
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5s</SelectItem>
                  <SelectItem value="15">15s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">60s</SelectItem>
                  <SelectItem value="0">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Platform KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Registered Tenants</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">{totalTenants}</div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {activeTenants} Active
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">AWS Multi-Tenant Fleet</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Fleet CPU Utilization</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-emerald-600">{avgCpu}%</div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Nominal
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Amazon ECS Fargate Cluster</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Active Database Connections</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">{activeConnections}</div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                RDS Aurora Pool
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Shared Multi-Tenant Instance</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Audit Events Recorded</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">{auditLogs.length}</div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Immutable
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">DynamoDB Audit Trail</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Live Interactive Telemetry Chart */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 border-b pb-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Fleet Telemetry & Real-Time Performance
          </h2>
        </div>
        <InteractiveMetricsChart />
      </section>

      {/* 4. Immutable Cloud Audit Trail */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 border-b pb-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Cloud Audit Trail (Recent Activity)
          </h2>
        </div>
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 sm:px-6 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 space-y-0">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                Immutable Cloud Audit Trail
              </CardTitle>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search events, actors, targets..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:inline">
                {filteredAuditLogs.length} of {auditLogs.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[380px] overflow-auto">
              <Table>
                <TableHeader className="bg-card sticky top-0 z-10 border-b">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                    <TableHead className="text-xs font-semibold">Actor</TableHead>
                    <TableHead className="text-xs font-semibold">Action</TableHead>
                    <TableHead className="text-xs font-semibold">Target</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Source IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                        {auditSearch
                          ? "No audit events match your search."
                          : "No audit events recorded yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuditLogs.map((log: any, idx: number) => (
                      <TableRow key={log.event_id || idx} className="hover:bg-muted/50 text-xs">
                        <TableCell className="font-mono text-muted-foreground text-[11px]">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">{log.actor}</span>
                            {log.role && (
                              <Badge variant="secondary" className="text-[10px] font-mono px-1 py-0">
                                {log.role}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="font-mono text-foreground text-xs">
                          {log.target || log.tenant_id || "--"}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="font-mono text-muted-foreground text-[11px]">
                          {log.ip_address || "internal"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
export default DashboardPage;
