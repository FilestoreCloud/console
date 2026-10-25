import React, { useState, useEffect } from "react";
import { useCustom } from "@refinedev/core";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RotateCw,
  ExternalLink,
  Info,
  Server,
  Activity,
  Layers,
} from "lucide-react";
import {
  InteractiveFleetEcsChart,
  InteractiveFleetAlbChart,
  InteractiveFleetLifecycleChart,
} from "../../components/InteractiveFleetCharts";
import { InteractiveMetricsChart } from "../../components/InteractiveMetricsChart";
import { dataProvider } from "../../providers/dataProvider";

export const TelemetryDashboard: React.FC = () => {
  const [intervalSec, setIntervalSec] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");
  const [selectedTenant, setSelectedTenant] = useState<string>("fleet");

  // 1. Fetch raw streaming metrics for fleet interactive charts
  const { data: rawMetricsResp, refetch: refetchRawMetrics } = useCustom({
    url: dataProvider.getApiUrl(),
    method: "post",
    config: { payload: { action: "METRICS" } },
  });

  // 2. Fetch tenant-specific full metrics if selected
  const { data: tenantMetricsResp, refetch: refetchTenantMetrics } = useCustom({
    url: dataProvider.getApiUrl(),
    method: "post",
    config: {
      payload: { action: "GET_TENANT_METRICS", tenant_id: selectedTenant },
    },
    queryOptions: {
      enabled: selectedTenant !== "fleet",
    },
  });

  const refreshAll = () => {
    refetchRawMetrics();
    if (selectedTenant !== "fleet") {
      refetchTenantMetrics();
    }
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
  const tenantMetrics = (tenantMetricsResp?.data as any) || {};

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 1. Interactive Control Bar */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📡</span>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Live CloudWatch Telemetry &amp; Metrics
                </h1>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={intervalSec > 0 ? "info" : "outline"}
                    className="text-xs font-semibold"
                  >
                    {intervalSec > 0 ? `STREAMING (${countdown}s)` : "PAUSED"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Last updated: {lastUpdate}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="info"
                        className="cursor-pointer flex items-center gap-1 text-xs"
                      >
                        <Info className="h-3 w-3" />
                        <span>Wheel Zoom &amp; Pan Enabled</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Interactive mode enables mouse wheel zoom in/out, pan
                        slider handles, crosshair tooltips, and legend series
                        toggles.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto">
              {/* Tenant Filter */}
              <div className="w-48">
                <Select
                  value={selectedTenant}
                  onValueChange={(val) => setSelectedTenant(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fleet">🌐 All Tenants (Fleet)</SelectItem>
                    <SelectItem value="acme">🏢 Acme Corp (Tenant)</SelectItem>
                    <SelectItem value="marvel">🦸 Marvel Ent (Tenant)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Streaming Interval */}
              <div className="w-40">
                <Select
                  value={String(intervalSec)}
                  onValueChange={(val) => {
                    const num = Number(val);
                    setIntervalSec(num);
                    setCountdown(num);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Every 15s (Live)</SelectItem>
                    <SelectItem value="30">Every 30s</SelectItem>
                    <SelectItem value="60">Every 60s</SelectItem>
                    <SelectItem value="0">⏸ Pause Stream</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshAll}
                className="h-9 text-xs flex items-center gap-1.5"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Sync Now</span>
              </Button>

              <Button
                size="sm"
                asChild
                className="h-9 text-xs bg-[#1652f0] hover:bg-[#1652f0]/90 text-white flex items-center gap-1.5"
              >
                <a
                  href="https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards/dashboard/prod-Storix-SaaS-Control-Plane"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>AWS Console</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Tenant-Specific Dedicated Telemetry View if selected */}
        {selectedTenant !== "fleet" && (
          <div>
            <InteractiveMetricsChart
              tenantId={selectedTenant}
              clusterName="prod-storix-cluster"
              history={
                tenantMetrics.history || tenantMetrics.metrics?.history || []
              }
              autoscalingTargetCpu={
                tenantMetrics.autoscaling_target_cpu ||
                tenantMetrics.metrics?.autoscaling_target_cpu ||
                70.0
              }
              intervalSec={intervalSec}
              countdown={countdown}
              onRefresh={refreshAll}
            />
          </div>
        )}

        {/* 3. Fleet-Wide Telemetry Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Tenant Lifecycle Status */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                <span>Tenant Lifecycle Status</span>
              </CardTitle>
              <Badge variant="info" className="text-[10px]">
                Interactive
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <InteractiveFleetLifecycleChart height={260} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Metric: Storix/SaaS &gt; TenantActiveStatus
              </p>
            </CardContent>
          </Card>

          {/* Card 2: ECS Fargate CPU & Memory */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-500" />
                <span>ECS Fargate CPU &amp; Memory</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px]">
                Wheel Zoom
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <InteractiveFleetEcsChart data={fleetMetrics} height={260} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Namespace: AWS/ECS (prod-storix-cluster)
              </p>
            </CardContent>
          </Card>

          {/* Card 3: ALB Ingress Requests & Latency */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-500" />
                <span>ALB Ingress Requests &amp; Latency</span>
              </CardTitle>
              <Badge variant="info" className="text-[10px]">
                Dual-Axis
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <InteractiveFleetAlbChart data={fleetMetrics} height={260} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Namespace: AWS/ApplicationELB (Dual-Axis)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
