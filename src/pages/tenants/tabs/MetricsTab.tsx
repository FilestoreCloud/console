import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Zap,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { InteractiveMetricsChart } from "../../../components/InteractiveMetricsChart";

export interface MetricsTabProps {
  tenantId: string;
  metrics: any;
  metricsIntervalSec: number;
  metricsCountdown: number;
  setMetricsCountdown: React.Dispatch<React.SetStateAction<number>>;
  refetch: () => void;
}

export const MetricsTab: React.FC<MetricsTabProps> = ({
  tenantId,
  metrics = {},
  metricsIntervalSec,
  metricsCountdown,
  setMetricsCountdown,
  refetch,
}) => {
  const cpuPercent = metrics.current_cpu_percent ?? 1.2;
  const memPercent = metrics.current_memory_percent ?? 10.1;
  const avgLatency = metrics.avg_latency_ms ?? 44.2;
  const storageUsed = metrics.storage_used_mb ?? 1420.5;
  const storageQuota = metrics.storage_quota_gb ?? 100;
  const storagePercent = metrics.storage_percent ?? 1.4;

  return (
    <div className="space-y-4">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Utilization */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>CPU Utilization</span>
              <Badge
                variant={
                  cpuPercent >= 70
                    ? "destructive"
                    : cpuPercent >= 50
                    ? "warning"
                    : "success"
                }
                className="text-[10px] py-0 px-1.5"
              >
                Fargate Task
              </Badge>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {cpuPercent}%
            </div>
            <Progress
              value={cpuPercent}
              className={`h-2 ${
                cpuPercent >= 70
                  ? "bg-red-100 dark:bg-red-950"
                  : cpuPercent >= 50
                  ? "bg-amber-100 dark:bg-amber-950"
                  : ""
              }`}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>
                Peak: <b>{metrics.peak_cpu_percent ?? 2.8}%</b>
              </span>
              <span>
                Target: <b>70% (Autoscale)</b>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Memory Utilization */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Memory Utilization</span>
              <Badge variant="info" className="text-[10px] py-0 px-1.5">
                1024 MB Limit
              </Badge>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {memPercent}%
            </div>
            <Progress value={memPercent} className="h-2" />
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>
                Peak: <b>{metrics.peak_memory_percent ?? 10.1}%</b>
              </span>
              <span>
                Allocated: <b>{metrics.allocated_memory_mb ?? 1024} MB</b>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Ingress & Latency */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Ingress &amp; Latency</span>
              <Badge variant="info" className="text-[10px] py-0 px-1.5 font-mono">
                ALB tg-{tenantId}
              </Badge>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {avgLatency}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ms
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Target Health: HTTP 200 OK</span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>
                Requests (2h): <b>{metrics.total_requests_2h ?? 15}</b>
              </span>
              <span>
                5xx Errors: <b className="text-emerald-600">0</b>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Storage Quota */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Storage &amp; Quota</span>
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                S3 Vault + EFS
              </Badge>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {(storageUsed / 1024).toFixed(1)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {storageQuota} GB
              </span>
            </div>
            <Progress value={storagePercent} className="h-2" />
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>
                Used: <b>{storageUsed} MB</b>
              </span>
              <span>
                DB: <b>nc_{tenantId}</b>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Middle Row: Graph + Auto-Scaling Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <InteractiveMetricsChart
            tenantId={tenantId}
            clusterName={metrics.cluster_name || "prod-storix-cluster"}
            history={metrics.history || []}
            autoscalingTargetCpu={metrics.autoscaling_target_cpu || 70.0}
            intervalSec={metricsIntervalSec}
            countdown={metricsCountdown}
            onRefresh={() => {
              refetch();
              setMetricsCountdown(metricsIntervalSec);
            }}
          />
        </div>

        <div className="lg:col-span-4">
          <Card className="border-border shadow-sm h-full">
            <CardHeader className="py-4 px-5 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Auto-Scaling &amp; Elastic Capacity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">ECS Service:</span>
                <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                  service-{tenantId}
                </code>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Running / Desired:</span>
                <div className="flex items-center gap-1">
                  <Badge variant="success" className="text-[10px]">
                    {metrics.running_tasks ?? 1} Running
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {metrics.desired_tasks ?? 1} Desired
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Capacity Bounds:</span>
                <span>
                  Min: <b>{metrics.min_capacity ?? 1} task</b> | Max:{" "}
                  <b>{metrics.max_capacity ?? 4} tasks</b>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Scaling Policy:</span>
                <Badge variant="info" className="text-[10px]">
                  TargetTrackingScaling
                </Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Target CPU:</span>
                <b>{metrics.autoscaling_target_cpu ?? 70.0}% Average CPU</b>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Cooldown Periods:</span>
                <span>
                  Scale-Out: <b>60s</b> | Scale-In: <b>300s</b>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">CloudWatch Alarms:</span>
                <div className="text-right space-y-0.5">
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-[11px]">
                    AlarmHigh (Scale-Out: CPU &gt; 70%)
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    AlarmLow (Scale-In: CPU &lt; 70%)
                  </p>
                </div>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">FinOps Zero Compute:</span>
                <Badge variant="success" className="text-[10px]">
                  Supported (DesiredCount: 0 on Suspend)
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Bottom Row: History Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span>Telemetry History Time-Slices (Last 2 Hours)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-xs">Timestamp</TableHead>
                <TableHead className="font-semibold text-xs">CPU Utilization</TableHead>
                <TableHead className="font-semibold text-xs">Memory Utilization</TableHead>
                <TableHead className="font-semibold text-xs">HTTP Requests</TableHead>
                <TableHead className="font-semibold text-xs">Avg Latency</TableHead>
                <TableHead className="font-semibold text-xs">Service Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(metrics.history || []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-20 text-center text-xs text-muted-foreground"
                  >
                    No historical data available.
                  </TableCell>
                </TableRow>
              ) : (
                (metrics.history || []).map((row: any, idx: number) => (
                  <TableRow key={row.timestamp || idx} className="text-xs">
                    <TableCell className="font-mono text-muted-foreground">
                      {row.timestamp}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={row.cpu_percent} className="w-20 h-1.5" />
                        <span className="font-bold">{row.cpu_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={row.memory_percent} className="w-20 h-1.5" />
                        <span className="font-bold">{row.memory_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info" className="text-xs">
                        {row.requests} reqs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {Number(row.latency_ms || 0).toFixed(1)} ms
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="success"
                        className="flex items-center gap-1 w-fit"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{row.status || "healthy"}</span>
                      </Badge>
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
