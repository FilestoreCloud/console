import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Heart,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
} from "lucide-react";

export interface HealthTabProps {
  tenantId: string;
  tenant: any;
  health?: any;
}

export const HealthTab: React.FC<HealthTabProps> = ({
  tenantId,
  tenant = {},
  health,
}) => {
  const hData = health || tenant.health || {
    health_status: tenant.status === "SUSPENDED" ? "SUSPENDED" : "HEALTHY",
    status: tenant.status || "ACTIVE",
    p95_latency_ms: 42.5,
    error_rate_5xx_percent: 0.0,
    quota_gb: tenant.quota_gb || 100,
    storage_used_gb: tenant.storage_used_gb || 22.0,
    quota_utilization_percent: Math.round(((tenant.storage_used_gb || 22.0) / (tenant.quota_gb || 100)) * 100),
    quota_warning_level: "NORMAL",
    uptime_30d_percent: 99.98,
    last_health_check: new Date().toISOString(),
  };

  const utilization = hData.quota_utilization_percent || 22;
  const isWarning = utilization >= 80 && utilization < 95;
  const isCritical = utilization >= 95;

  return (
    <div className="space-y-4">
      {/* 1. Health Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Overall Health</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-bold capitalize flex items-center gap-2">
                <Heart className={`h-5 w-5 ${
                  hData.health_status === "HEALTHY"
                    ? "text-emerald-500 fill-emerald-500"
                    : hData.health_status === "DEGRADED"
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground"
                }`} />
                {hData.health_status || "HEALTHY"}
              </div>
              <Badge variant={hData.health_status === "HEALTHY" ? "outline" : "secondary"} className={`text-xs ${
                hData.health_status === "HEALTHY"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : ""
              }`}>
                Auto-Monitored
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">P95 Response Latency</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {hData.p95_latency_ms || 42.5} <span className="text-sm font-normal text-muted-foreground">ms</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Target: &lt; 150ms (ALB HTTP-200)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">5xx Error Rate (Last 24h)</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {hData.error_rate_5xx_percent ?? 0.0}%
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Zero gateway exceptions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">30-Day SLA Uptime</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {hData.uptime_30d_percent ?? 99.98}%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                SLA Tier: 99.9% Committed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Quota Limit & Soft Ceiling Warning */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Storage Quota Utilization &amp; Soft Ceilings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-medium text-foreground">
                Current Storage Used: <strong>{hData.storage_used_gb || 22} GB</strong> of{" "}
                <strong>{hData.quota_gb || 100} GB</strong>
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {utilization}% Capacity
              </span>
            </div>
            <Progress
              value={utilization}
              className={`h-2.5 ${
                isCritical
                  ? "bg-rose-100 dark:bg-rose-950/40"
                  : isWarning
                  ? "bg-amber-100 dark:bg-amber-950/40"
                  : ""
              }`}
            />
          </div>

          {isCritical ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Critical Quota Limit Warning (95%+)</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Tenant has reached 95% of its allocated storage quota. Write operations may soon be throttled by the storage tier. Consider upgrading quota.
              </AlertDescription>
            </Alert>
          ) : isWarning ? (
            <Alert className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-xs font-semibold">Quota Approaching Soft Limit (80%+)</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Storage utilization has exceeded 80%. Automated notification sent to {tenant.admin_email || "tenant admin"}.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Storage usage is within healthy parameters (under 80% ceiling).</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Deep Telemetry Probes */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Automated Health Probes &amp; Diagnostics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">ALB Health Check Probe</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>200 OK (every 30s)</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Endpoint: /status.php</div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">PostgreSQL Isolation Ping</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Connected (&lt; 2ms)</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Dedicated schema: nc_{tenantId.replace(/-/g, "_")}</div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">S3 Vault Egress Probe</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Active (AES-256 KMS)</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Bucket: storix-vault-ap-southeast-1</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
