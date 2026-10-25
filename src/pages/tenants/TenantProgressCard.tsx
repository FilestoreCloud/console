import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RotateCw,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  Loader2,
} from "lucide-react";
import { dataProvider } from "../../providers/dataProvider";
import { TenantProgressModal } from "./modals/TenantProgressModal";

export interface MilestoneItem {
  id: string;
  name: string;
  description: string;
  percent: number;
  status: "completed" | "active" | "pending" | "error";
}

export interface TenantProgressCardProps {
  currentStatus: string;
  progress?: number | string;
  currentStep?: string;
  tenantId?: string;
}

export const TenantProgressCard: React.FC<TenantProgressCardProps> = ({
  currentStatus,
  progress = 15,
  currentStep,
  tenantId,
}) => {
  const activeStatuses = [
    "PROVISIONING",
    "DELETING",
    "DEPROVISIONING",
    "SUSPENDING",
    "RESUMING",
    "SEEDING",
    "UPGRADING",
  ];

  const [liveData, setLiveData] = useState<{
    progress: number;
    currentStep: string;
    currentStepDescription?: string;
    elapsedSeconds: number;
    estimatedRemainingSeconds: number;
    milestones: MilestoneItem[];
    executionArn?: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLiveStream = useCallback(async () => {
    if (!dataProvider.custom) return;
    if (!tenantId || !activeStatuses.includes(currentStatus)) return;
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "STREAM_SFN_PROGRESS",
          tenant_id: tenantId,
        },
      });
      if (res.data) {
        setLiveData({
          progress: Number(res.data.progress ?? progress),
          currentStep: res.data.currentStep || currentStep || "In progress",
          currentStepDescription: res.data.currentStepDescription,
          elapsedSeconds: Number(res.data.elapsedSeconds || 0),
          estimatedRemainingSeconds: Number(
            res.data.estimatedRemainingSeconds || 0
          ),
          milestones: res.data.milestones || [],
          executionArn: res.data.executionArn,
        });
      }
    } catch {
      // Fallback gracefully
    }
  }, [tenantId, currentStatus, progress, currentStep]);

  useEffect(() => {
    if (!activeStatuses.includes(currentStatus) || !tenantId) return;
    fetchLiveStream();
    const timer = setInterval(fetchLiveStream, 3000);
    return () => clearInterval(timer);
  }, [fetchLiveStream, currentStatus, tenantId]);

  if (!activeStatuses.includes(currentStatus)) {
    return null;
  }

  const effectiveProgress = liveData ? liveData.progress : Number(progress);
  const effectiveStep =
    liveData?.currentStep ||
    currentStep ||
    "Step Functions Workflow in progress...";

  const isDeleting = ["DELETING", "DEPROVISIONING"].includes(currentStatus);
  const isSuspending = currentStatus === "SUSPENDING";
  const isResuming = currentStatus === "RESUMING";
  const isSeeding = currentStatus === "SEEDING";
  const isUpgrading = currentStatus === "UPGRADING";

  let title = `Tenant Provisioning in Progress (${effectiveProgress}%)`;
  if (isDeleting) {
    title = `Tenant Teardown & Deprovisioning in Progress (${effectiveProgress}%)`;
  } else if (isSuspending) {
    title = `Tenant Suspension (FinOps Scale-to-Zero) in Progress (${effectiveProgress}%)`;
  } else if (isResuming) {
    title = `Tenant Resumption & Container Rehydration in Progress (${effectiveProgress}%)`;
  } else if (isSeeding) {
    title = `Tenant Demo Data Seeding in Progress (${effectiveProgress}%)`;
  } else if (isUpgrading) {
    title = `Rolling Container Image Upgrade in Progress (${effectiveProgress}%)`;
  }

  const displayMilestones: MilestoneItem[] =
    liveData?.milestones && liveData.milestones.length > 0
      ? liveData.milestones
      : [
          {
            id: "VALIDATE",
            name: "Validation & Registry",
            description:
              "Validate tenant parameters & initialize DynamoDB registry record",
            percent: 15,
            status: effectiveProgress >= 15 ? "completed" : "active",
          },
          {
            id: "DATABASE",
            name: "Postgres Isolation",
            description: "Create isolated database schema and credentials",
            percent: 35,
            status:
              effectiveProgress > 35
                ? "completed"
                : effectiveProgress >= 35
                ? "active"
                : "pending",
          },
          {
            id: "STORAGE",
            name: "EFS Storage",
            description: "Provision dedicated EFS access point & permissions",
            percent: 55,
            status:
              effectiveProgress > 55
                ? "completed"
                : effectiveProgress >= 55
                ? "active"
                : "pending",
          },
          {
            id: "COMPUTE",
            name: "ECS Task",
            description: "Register container task definition & service",
            percent: 75,
            status:
              effectiveProgress > 75
                ? "completed"
                : effectiveProgress >= 75
                ? "active"
                : "pending",
          },
          {
            id: "HEALTH_CHECK",
            name: "Health Probe",
            description: "Verify Storix container health check probe",
            percent: 90,
            status:
              effectiveProgress > 90
                ? "completed"
                : effectiveProgress >= 90
                ? "active"
                : "pending",
          },
          {
            id: "ACTIVE",
            name: "Ready & Active",
            description: "Tenant operational and ready for use",
            percent: 100,
            status: effectiveProgress >= 100 ? "completed" : "pending",
          },
        ];

  return (
    <TooltipProvider>
      <Card
        className={`border shadow-sm mb-5 ${
          isDeleting
            ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
            : isSuspending
            ? "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
            : "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <RotateCw className="h-4 w-4 animate-spin text-primary" />
                <h3 className="font-bold text-sm text-foreground">{title}</h3>
                {liveData && (
                  <Badge variant="info" className="text-[10px] py-0 px-1.5">
                    <Zap className="h-2.5 w-2.5 mr-0.5" /> Real-Time Live Streaming
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                <span>
                  Current Step: <b>{effectiveStep}</b>
                </span>
                {liveData && liveData.elapsedSeconds > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Elapsed: <b>{liveData.elapsedSeconds}s</b>
                    {liveData.estimatedRemainingSeconds > 0 && (
                      <span>
                        (est. ~{liveData.estimatedRemainingSeconds}s remaining)
                      </span>
                    )}
                  </span>
                )}
              </div>

              {liveData?.currentStepDescription && (
                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {liveData.currentStepDescription}
                </p>
              )}

              <Progress
                value={effectiveProgress}
                className={`h-2 ${isDeleting ? "bg-red-200 dark:bg-red-950" : ""}`}
              />
            </div>

            <div className="tenant-progress-aside flex flex-col items-end gap-1.5 w-full md:w-auto">
              <Badge
                variant={
                  isDeleting
                    ? "destructive"
                    : isSuspending
                    ? "warning"
                    : "info"
                }
                className="text-xs"
              >
                AWS Step Functions Orchestrated
              </Badge>
              {liveData?.executionArn && (
                <code className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                  {liveData.executionArn.split(":").pop()}
                </code>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="h-7 text-xs border-blue-400 text-blue-600 hover:bg-blue-50 mt-1"
              >
                <Zap className="h-3 w-3 mr-1" />
                <span>View Live Steps &amp; Logs</span>
              </Button>
            </div>
          </div>

          {/* Stepper Milestones */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Execution Milestones:
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-xs text-[#1652f0] hover:underline"
              >
                Click step to inspect live execution logs &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {displayMilestones.map((m) => {
                const isDone = m.status === "completed";
                const isActive = m.status === "active";
                const isError = m.status === "error";

                return (
                  <Tooltip key={m.id}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => setModalOpen(true)}
                        className={`rounded-lg border p-2 text-center cursor-pointer transition-colors ${
                          isDone
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : isActive
                            ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 font-semibold"
                            : isError
                            ? "border-red-500 bg-red-500/15 text-red-700 dark:text-red-400"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-xs truncate">
                          {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          {isActive && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
                          {isError && <Info className="h-3 w-3 text-red-600" />}
                          <span className="truncate">{m.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          {m.percent}%
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {m.description} (Click to inspect live steps &amp; logs)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </CardContent>

        <TenantProgressModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          tenantId={tenantId || null}
          initialStatus={currentStatus}
        />
      </Card>
    </TooltipProvider>
  );
};
