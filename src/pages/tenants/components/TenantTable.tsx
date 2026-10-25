import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GitBranch,
  ExternalLink,
  ShieldCheck,
  Server,
  Database,
  Eye,
  LineChart,
  Sparkles,
  Pause,
  Play,
  Trash2,
  Lock,
  RotateCw,
  Zap,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { renderStatusTag } from "../helpers";
import { TenantProgressModal } from "../modals/TenantProgressModal";

export interface TenantTableProps {
  tenants: any[];
  filteredTenants: any[];
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  canDelete?: { can?: boolean; reason?: string };
  onToggleStatus: (tenantId: string, currentStatus: string) => void;
  onSeedTenant: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => void;
  onShowTenant: (tenantId: string) => void;
  onNavigate: (path: string) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  filteredTenants,
  isLoading,
  isUpdating,
  isDeleting,
  canDelete,
  onToggleStatus,
  onSeedTenant,
  onDeleteTenant,
  onShowTenant,
  onNavigate,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [batchActionType, setBatchActionType] = useState<
    "SUSPEND" | "RESUME" | "UPGRADE" | null
  >(null);
  const [batchExecuting, setBatchExecuting] = useState(false);
  const [progressModalTenant, setProgressModalTenant] = useState<any>(null);

  const [confirmDeleteTenant, setConfirmDeleteTenant] = useState<any>(null);
  const [confirmSuspendTenant, setConfirmSuspendTenant] = useState<any>(null);
  const [confirmSeedTenant, setConfirmSeedTenant] = useState<any>(null);

  const handleTriggerBatch = (type: "SUSPEND" | "RESUME" | "UPGRADE") => {
    setBatchActionType(type);
  };

  const executeBatchAction = async () => {
    if (!batchActionType || selectedRowKeys.length === 0) return;
    setBatchExecuting(true);
    try {
      for (const key of selectedRowKeys) {
        const tenant = tenants.find(
          (t) => t.id === key || t.tenant_id === key
        );
        if (tenant) {
          if (batchActionType === "SUSPEND" || batchActionType === "RESUME") {
            onToggleStatus(tenant.tenant_id || tenant.id, tenant.status);
          }
        }
      }
      toast.success(
        `Batch ${batchActionType} dispatched for ${selectedRowKeys.length} tenants`
      );
      setSelectedRowKeys([]);
      setBatchActionType(null);
    } catch (err: any) {
      toast.error(`Batch action error: ${err.message}`);
    } finally {
      setBatchExecuting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRowKeys.length === filteredTenants.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(filteredTenants.map((t) => t.id || t.tenant_id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRowKeys.includes(id)) {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== id));
    } else {
      setSelectedRowKeys([...selectedRowKeys, id]);
    }
  };

  const inFlightTenants = tenants.filter((t) =>
    [
      "PROVISIONING",
      "DELETING",
      "DEPROVISIONING",
      "SUSPENDING",
      "RESUMING",
      "SEEDING",
      "UPGRADING",
    ].includes(t.status)
  );
  const hasInFlightTenants = inFlightTenants.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Step Functions Orchestration Banner */}
        {hasInFlightTenants && (
          <Alert variant="info" className="py-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <RotateCw className="h-4 w-4 animate-spin text-blue-500" />
                <span className="font-bold">
                  AWS Step Functions Fleet Orchestration Active
                </span>
                <span className="text-muted-foreground">
                  — {inFlightTenants.length} operation(s) in progress (
                  {[
                    inFlightTenants.filter((t) => t.status === "PROVISIONING")
                      .length > 0 &&
                      `${
                        inFlightTenants.filter(
                          (t) => t.status === "PROVISIONING"
                        ).length
                      } creating`,
                    inFlightTenants.filter((t) =>
                      ["DELETING", "DEPROVISIONING"].includes(t.status)
                    ).length > 0 &&
                      `${
                        inFlightTenants.filter((t) =>
                          ["DELETING", "DEPROVISIONING"].includes(t.status)
                        ).length
                      } deleting`,
                    inFlightTenants.filter((t) => t.status === "SUSPENDING")
                      .length > 0 &&
                      `${
                        inFlightTenants.filter((t) => t.status === "SUSPENDING")
                          .length
                      } suspending`,
                    inFlightTenants.filter((t) => t.status === "RESUMING")
                      .length > 0 &&
                      `${
                        inFlightTenants.filter((t) => t.status === "RESUMING")
                          .length
                      } resuming`,
                    inFlightTenants.filter((t) => t.status === "SEEDING")
                      .length > 0 &&
                      `${
                        inFlightTenants.filter((t) => t.status === "SEEDING")
                          .length
                      } seeding`,
                    inFlightTenants.filter((t) => t.status === "UPGRADING")
                      .length > 0 &&
                      `${
                        inFlightTenants.filter((t) => t.status === "UPGRADING")
                          .length
                      } upgrading`,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  ). Real-time progress is auto-polling every 2.5s.
                </span>
              </div>
              {inFlightTenants.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProgressModalTenant(inFlightTenants[0])}
                  className="h-7 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  <span>Steps &amp; Logs ({inFlightTenants[0].tenant_id})</span>
                </Button>
              )}
            </div>
          </Alert>
        )}

        {/* Batch Selection Bar */}
        {selectedRowKeys.length > 0 && (
          <div className="flex items-center justify-between p-2.5 px-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {selectedRowKeys.length} tenant(s) selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTriggerBatch("SUSPEND")}
                className="h-7 text-xs flex items-center gap-1"
              >
                <Pause className="h-3 w-3" />
                <span>Batch Suspend</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTriggerBatch("RESUME")}
                className="h-7 text-xs flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                <span>Batch Resume</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTriggerBatch("UPGRADE")}
                className="h-7 text-xs flex items-center gap-1"
              >
                <RotateCw className="h-3 w-3" />
                <span>Batch Upgrade Image</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRowKeys([])}
              className="h-7 text-xs text-muted-foreground"
            >
              Deselect All
            </Button>
          </div>
        )}

        {/* Tenant Table Card */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all tenants"
                      checked={
                        filteredTenants.length > 0 &&
                        selectedRowKeys.length === filteredTenants.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Tenant Identifier</TableHead>
                  <TableHead className="font-semibold">Dedicated Ingress</TableHead>
                  <TableHead className="font-semibold">Admin Contact</TableHead>
                  <TableHead className="font-semibold">Quota</TableHead>
                  <TableHead className="font-semibold">Status &amp; Progress</TableHead>
                  <TableHead className="font-semibold">Isolated Infrastructure</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-muted-foreground"
                    >
                      {isLoading
                        ? "Loading tenant deployments..."
                        : "No tenants match the current filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((record) => {
                    const rowKey = record.id || record.tenant_id;
                    const isSelected = selectedRowKeys.includes(rowKey);
                    const isActive = record.status === "ACTIVE";
                    const isInFlight = [
                      "PROVISIONING",
                      "DELETING",
                      "DEPROVISIONING",
                      "SUSPENDING",
                      "RESUMING",
                      "SEEDING",
                      "UPGRADING",
                    ].includes(record.status);
                    const fullDomain =
                      record.domain || `${record.tenant_id}.png261.dev`;
                    const svc =
                      record.service_name || `service-${record.tenant_id}`;
                    const db =
                      record.database_name ||
                      `nc_${record.tenant_id.replace(/-/g, "_")}`;
                    const ap =
                      record.efs_access_point_id ||
                      `/tenants/${record.tenant_id}/config`;

                    return (
                      <TableRow
                        key={rowKey}
                        className={`hover:bg-muted/30 ${
                          isSelected ? "bg-muted/40" : ""
                        }`}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            aria-label={`Select ${record.tenant_id}`}
                            checked={isSelected}
                            onChange={() => toggleSelectRow(rowKey)}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                          />
                        </TableCell>

                        {/* Identifier */}
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onShowTenant(record.tenant_id)}
                                className="font-bold text-sm text-[#1652f0] hover:underline cursor-pointer"
                              >
                                {record.tenant_id}
                              </button>
                              {record.is_sandbox && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 flex items-center gap-0.5 py-0 px-1"
                                    >
                                      <GitBranch className="h-2.5 w-2.5" />
                                      <span>SANDBOX</span>
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {record.cloned_from
                                        ? `Forked from '${record.cloned_from}'`
                                        : "Isolated Staging Sandbox"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Partition: HASH (AWS Fargate)
                            </p>
                          </div>
                        </TableCell>

                        {/* Ingress */}
                        <TableCell>
                          <div>
                            <a
                              href={`https://${fullDomain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-xs"
                            >
                              <span>{fullDomain}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <div className="mt-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1 w-fit py-0"
                              >
                                <ShieldCheck className="h-2.5 w-2.5" />
                                <span>AWS Secrets Manager</span>
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        {/* Admin Contact */}
                        <TableCell className="text-xs">
                          {record.admin_email || "admin@acme.com"}
                        </TableCell>

                        {/* Quota */}
                        <TableCell>
                          <Badge variant="info" className="text-xs font-mono">
                            {record.quota_gb || 100} GB
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {renderStatusTag(record.status, record, (rec) =>
                            setProgressModalTenant(rec)
                          )}
                        </TableCell>

                        {/* Isolated Infra */}
                        <TableCell>
                          <div className="space-y-1">
                            <div>
                              <Badge
                                variant={isActive ? "success" : "outline"}
                                className="text-[10px] flex items-center gap-1 w-fit"
                              >
                                <Server className="h-2.5 w-2.5" />
                                <span>
                                  {svc} (
                                  {isActive ? "1 task" : "0 tasks / $0"})
                                </span>
                              </Badge>
                            </div>
                            <div>
                              <Badge
                                variant="info"
                                className="text-[10px] flex items-center gap-1 w-fit"
                              >
                                <Database className="h-2.5 w-2.5" />
                                <span>{db}</span>
                              </Badge>
                            </div>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {ap}
                            </p>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isInFlight && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProgressModalTenant(record)}
                                className="h-7 text-xs border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                              >
                                <Zap className="h-3 w-3" />
                                <span>Progress</span>
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  aria-label="More actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => onShowTenant(record.tenant_id)}
                                  className="cursor-pointer text-xs"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-2 text-primary" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (isActive) {
                                      setConfirmSuspendTenant(record);
                                    } else {
                                      onToggleStatus(record.tenant_id, record.status);
                                    }
                                  }}
                                  disabled={isInFlight}
                                  className="cursor-pointer text-xs"
                                >
                                  {isActive ? (
                                    <>
                                      <Pause className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                      <span>Suspend Tenant</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                      <span>Resume Tenant</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setConfirmDeleteTenant(record)}
                                  disabled={isInFlight || !canDelete?.can}
                                  className="cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  <span>Delete Tenant</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        {/* Batch Confirmation Dialog */}
        <Dialog
          open={!!batchActionType}
          onOpenChange={(val) => !val && setBatchActionType(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Confirm Batch {batchActionType}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              <p>
                Are you sure you want to execute <b>{batchActionType}</b> across{" "}
                <b>{selectedRowKeys.length}</b> selected tenant(s)?
              </p>
              <Alert variant="warning" className="text-xs">
                <AlertDescription>
                  This action will trigger asynchronous Step Functions Saga fleet execution.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBatchActionType(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={batchExecuting}
                onClick={executeBatchAction}
                className="bg-[#1652f0] hover:bg-[#1652f0]/90 text-white"
              >
                {batchExecuting
                  ? "Executing..."
                  : `Execute Batch ${batchActionType}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!confirmDeleteTenant}
          onOpenChange={(val) => !val && setConfirmDeleteTenant(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-red-600">
                Permanently Delete Tenant?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm py-2">
              Delete tenant &quot;{confirmDeleteTenant?.tenant_id}&quot; and tear
              down dedicated ECS service &amp; target group?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteTenant(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  const target = confirmDeleteTenant;
                  setConfirmDeleteTenant(null);
                  setProgressModalTenant({
                    ...target,
                    status: "DEPROVISIONING",
                  });
                  onDeleteTenant(target.tenant_id);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Confirmation Dialog */}
        <Dialog
          open={!!confirmSuspendTenant}
          onOpenChange={(val) => !val && setConfirmSuspendTenant(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-amber-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Confirm Tenant Suspension
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground py-2">
              Are you sure you want to suspend tenant{" "}
              <strong className="text-foreground">{confirmSuspendTenant?.tenant_id}</strong>?
              Traffic to this tenant will be blocked and compute tasks will be temporarily halted.
            </p>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmSuspendTenant(null)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  const target = confirmSuspendTenant;
                  setConfirmSuspendTenant(null);
                  onToggleStatus(target.tenant_id, target.status);
                }}
              >
                Confirm Suspend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Seed Confirmation Dialog */}
        <Dialog
          open={!!confirmSeedTenant}
          onOpenChange={(val) => !val && setConfirmSeedTenant(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-purple-600">
                Seed Demo Showcase Data?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm py-2">
              Run dedicated TenantSeedingStateMachine for &apos;
              {confirmSeedTenant?.tenant_id}&apos;?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmSeedTenant(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const tid = confirmSeedTenant.tenant_id;
                  setConfirmSeedTenant(null);
                  onSeedTenant(tid);
                }}
                className="bg-purple-600 hover:bg-purple-600/90 text-white"
              >
                Seed Demo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Progress Modal */}
        <TenantProgressModal
          visible={!!progressModalTenant}
          onClose={() => setProgressModalTenant(null)}
          tenantId={
            progressModalTenant?.tenant_id || progressModalTenant?.id || null
          }
          initialStatus={progressModalTenant?.status}
        />
      </div>
    </TooltipProvider>
  );
};
