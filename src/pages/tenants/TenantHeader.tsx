import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { renderStatusTag } from "./helpers";

export interface TenantHeaderProps {
  tenantId: string;
  domain: string;
  adminEmail?: string;
  currentStatus: string;
  progress?: number;
  currentStep?: string;
  isLoading?: boolean;
  isUpdating?: boolean;
  onBack: () => void;
  onToggleStatus: () => void;
  onDeleteTenant: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({
  tenantId,
  domain,
  adminEmail,
  currentStatus,
  progress,
  currentStep,
  onBack,
  onToggleStatus,
  onDeleteTenant,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isInFlight = [
    "PROVISIONING",
    "DELETING",
    "DEPROVISIONING",
    "SUSPENDING",
    "RESUMING",
    "SEEDING",
    "UPGRADING",
  ].includes(currentStatus);

  const isSuspended = currentStatus === "SUSPENDED";

  return (
    <Card className="border-border shadow-sm mb-5">
      <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                className="font-semibold text-primary hover:underline flex items-center gap-1"
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

        {/* Right: Exactly 2 Actions: Suspend and Delete */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStatus}
            disabled={isInFlight}
            className="h-8 text-xs flex items-center gap-1.5 font-medium"
          >
            {isSuspended ? (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-600" />
                <span>Resume Tenant</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                <span>Suspend Tenant</span>
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            disabled={isInFlight}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Tenant</span>
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Tenant Deletion
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              Are you sure you want to permanently decommission and delete tenant{" "}
              <strong className="text-foreground">{tenantId}</strong>? This action initiates Step Functions
              deprovisioning and destroys isolated databases and storage volumes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmDelete(false);
                onDeleteTenant();
              }}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
