import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  RotateCw,
  AlertTriangle,
  Zap,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import { renderStatusTag } from "./helpers";

export interface TenantHeaderProps {
  tenantId: string;
  domain: string;
  adminEmail?: string;
  currentStatus: string;
  progress?: number;
  currentStep?: string;
  isLoading: boolean;
  isUpdating: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onOpenIncidentModal: () => void;
  onRestartAgent: () => void;
  onOpenCloneModal: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({
  tenantId,
  domain,
  adminEmail,
  currentStatus,
  progress,
  currentStep,
  isLoading,
  isUpdating,
  onBack,
  onRefresh,
  onOpenIncidentModal,
  onRestartAgent,
  onOpenCloneModal,
}) => {
  const [confirmRestart, setConfirmRestart] = useState(false);

  const isInFlight = [
    "PROVISIONING",
    "DELETING",
    "DEPROVISIONING",
    "SUSPENDING",
    "RESUMING",
    "SEEDING",
    "UPGRADING",
  ].includes(currentStatus);

  return (
    <Card className="border-border shadow-sm mb-5">
      <CardContent className="p-4 sm:p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        {/* Left: Back button + Title + Domain */}
        <div className="flex items-start gap-3 flex-wrap flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-9 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Fleet</span>
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {tenantId}
              </h1>
              <div>
                {renderStatusTag(currentStatus, {
                  progress,
                  current_step: currentStep,
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs">
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>https://{domain}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              {adminEmail && (
                <span className="text-muted-foreground">Admin: {adminEmail}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant={
              currentStatus === "INCIDENT" || currentStatus === "DEGRADED"
                ? "destructive"
                : "outline"
            }
            size="sm"
            onClick={onOpenIncidentModal}
            disabled={isInFlight}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Incident / Status Circuit-Breaker</span>
          </Button>

          <Button
            size="sm"
            disabled={isInFlight}
            onClick={() => setConfirmRestart(true)}
            className="h-8 text-xs bg-[#1652f0] hover:bg-[#1652f0]/90 text-white flex items-center gap-1.5"
          >
            <Zap className={`h-3.5 w-3.5 ${isUpdating && isInFlight ? "animate-spin" : ""}`} />
            <span>Restart Agent Task</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isInFlight}
            onClick={onOpenCloneModal}
            className="h-8 text-xs border-purple-300 text-purple-600 hover:bg-purple-50 flex items-center gap-1.5"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Fork to Sandbox</span>
          </Button>
        </div>
      </CardContent>

      {/* Restart Task Confirmation Dialog */}
      <Dialog open={confirmRestart} onOpenChange={setConfirmRestart}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Trigger Rolling Restart of Agent Task?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm py-2">
            This forces a new ECS task deployment for tenant &apos;{tenantId}&apos;
            with zero downtime.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmRestart(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setConfirmRestart(false);
                onRestartAgent();
              }}
              className="bg-[#1652f0] hover:bg-[#1652f0]/90 text-white"
            >
              Restart Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
