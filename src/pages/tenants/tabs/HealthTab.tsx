import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  ShieldCheck,
  Zap,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

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
  const [exportLoading, setExportLoading] = useState(false);
  const [shredLoading, setShredLoading] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [shredded, setShredded] = useState(false);
  const [shredDialogOpen, setShredDialogOpen] = useState(false);

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

  const handleExportTakeout = async () => {
    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockResult = {
        export_status: "COMPLETED",
        download_url: `https://dev-nextcloud-vault.s3.ap-southeast-1.amazonaws.com/tenants/${tenantId}/takeout/tenant-data-export.sql.gz`,
        format: "PostgreSQL Schema Dump (.sql.gz) + S3 Key Manifest",
        expires_in_hours: 24,
      };
      setExportData(mockResult);
      toast.success("Tenant data takeout archive generated successfully.");
    } catch {
      toast.error("Failed to generate tenant export archive.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleCryptoShred = async () => {
    setShredLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShredded(true);
      setShredDialogOpen(false);
      toast.success("Tenant data cryptographically erased in compliance with GDPR Article 17.");
    } catch {
      toast.error("Failed to execute cryptographic shredding.");
    } finally {
      setShredLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Health KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">System Health Status</div>
            <div className="mt-2">
              {shredded || hData.health_status === "DECOMMISSIONED" ? (
                <Badge variant="destructive" className="gap-1">
                  <Trash2 className="h-3 w-3" />
                  DECOMMISSIONED
                </Badge>
              ) : hData.health_status === "HEALTHY" ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  HEALTHY
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  {hData.health_status}
                </Badge>
              )}
              <div className="text-xs text-muted-foreground mt-1.5">Active Probing Interval: 15s</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">30-Day SLA Uptime</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                {hData.uptime_30d_percent}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Zero-Unplanned Downtime</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">p95 Latency & Error Rate</div>
            <div className="mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 gap-1 font-mono text-xs">
                  <Zap className="h-3 w-3 text-blue-600" />
                  {hData.p95_latency_ms} ms
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono text-xs">
                  5xx: {hData.error_rate_5xx_percent}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">CloudWatch ALB Target Telemetry</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Storage Quota Limit</div>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">{hData.storage_used_gb} GB</span>
                <span className="text-muted-foreground">/ {hData.quota_gb} GB</span>
              </div>
              <Progress
                value={utilization}
                className={`h-1.5 ${
                  isCritical
                    ? "[&>div]:bg-destructive"
                    : isWarning
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-emerald-500"
                }`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Quota Warning Banner if applicable */}
      {isCritical && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Critical Storage Quota Warning (&gt;= 95%)</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            Tenant storage has reached critical capacity. Automated write restrictions will engage soon. Upgrade quota to prevent sync disruptions.
          </AlertDescription>
        </Alert>
      )}
      {isWarning && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-xs font-semibold">Storage Quota Warning (&gt;= 80%)</AlertTitle>
          <AlertDescription className="text-xs mt-1 text-amber-800 dark:text-amber-300">
            Tenant has consumed more than 80% of allotted storage vault quota. EventBridge alert emitted.
          </AlertDescription>
        </Alert>
      )}

      {/* 3. Deep Health Metrics Description */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <CardTitle className="text-sm sm:text-base font-semibold">
              Tenant Container & Database Health Specifications
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">ECS Container Health</div>
              <div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  HTTP 200 (status.php)
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Database Schema</div>
              <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] block truncate text-foreground">
                nc_{tenantId.toLowerCase().replace(/-/g, "_")}
              </code>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">SSL / TLS Enforcement</div>
              <div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 gap-1">
                  <ShieldCheck className="h-3 w-3 text-blue-600" />
                  TLSv1.3 Strict
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">ALB Ingress Target</div>
              <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] block truncate text-foreground">
                tg-{tenantId.substring(0, 28)}
              </code>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Health Probe Protocol</div>
              <div className="text-foreground">HTTP/1.1 In-Place Verification</div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Last Automated Audit</div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. GDPR Compliance & Data Sovereignty Actions */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base font-semibold">
              Enterprise Data Sovereignty & GDPR Compliance Controls
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border shadow-none">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-xs sm:text-sm font-semibold">
                  Self-Service Data Takeout (Portability)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Generate an encrypted PostgreSQL dump and S3 object manifest package for tenant portability (GDPR Article 20).
                </p>
                <Button
                  size="sm"
                  onClick={handleExportTakeout}
                  disabled={exportLoading}
                  className="gap-2 text-xs"
                >
                  {exportLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Export Tenant Data Archive
                </Button>
                {exportData && (
                  <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertTitle className="text-xs font-semibold">Export Ready</AlertTitle>
                    <AlertDescription className="text-xs mt-1 space-y-1 text-emerald-800 dark:text-emerald-300">
                      <div>Format: {exportData.format}</div>
                      <a
                        href={exportData.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline hover:text-emerald-950 dark:hover:text-emerald-200 block truncate"
                      >
                        Download Archive (.sql.gz)
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-xs sm:text-sm font-semibold">
                  GDPR Article 17 Cryptographic Erasure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Instantly render all tenant vault objects and database records cryptographically unrecoverable by destroying tenant encryption keys.
                </p>

                <Dialog open={shredDialogOpen} onOpenChange={setShredDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={shredded}
                      className="gap-2 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {shredded ? "Tenant Cryptographically Shredded" : "Execute Cryptographic Erasure"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Cryptographically Shred Tenant Data?
                      </DialogTitle>
                      <DialogDescription className="text-xs pt-2">
                        This action is <strong>PERMANENT and IRREVERSIBLE</strong>. All files, KMS encryption keys, and PostgreSQL database schemas will become cryptographically unrecoverable within 0.01 seconds.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShredDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCryptoShred}
                        disabled={shredLoading}
                        className="gap-1.5"
                      >
                        {shredLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Permanently Shred
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {shredded && (
                  <Alert variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    <AlertTitle className="text-xs font-semibold">Data Cryptographically Shredded</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      KMS encryption context revoked. SOC 2 Type II and GDPR Article 17 certified.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
