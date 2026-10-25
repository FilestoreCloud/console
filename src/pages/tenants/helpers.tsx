import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  RotateCw,
  XCircle,
} from "lucide-react";

export const renderStatusTag = (
  status: string,
  record?: any,
  onProgressClick?: (record: any) => void
): React.ReactNode => {
  const isClickable = !!onProgressClick;
  const wrapClickable = (node: React.ReactNode, tooltipTitle: string) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={(e) => {
                if (onProgressClick && record) {
                  e.stopPropagation();
                  onProgressClick(record);
                }
              }}
              className={`w-full ${isClickable ? "cursor-pointer" : "cursor-default"}`}
            >
              {node}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipTitle}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" className="flex items-center gap-1 font-semibold">
          <CheckCircle2 className="h-3 w-3" />
          <span>ACTIVE</span>
        </Badge>
      );
    case "PROVISIONING": {
      const progress = Number(record?.progress || 20);
      const step = record?.current_step || "Provisioning AWS resources...";
      return wrapClickable(
        <div className="space-y-1 w-full min-w-[150px]">
          <Badge variant="info" className="flex items-center gap-1 font-semibold">
            <RotateCw className="h-3 w-3 animate-spin" />
            <span>PROVISIONING ({progress}%)</span>
          </Badge>
          <Progress value={progress} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
            {step}
          </p>
        </div>,
        `Click to view live steps & execution logs (${step})`
      );
    }
    case "DELETING":
    case "DEPROVISIONING": {
      const progress = Number(record?.progress || 15);
      const step = record?.current_step || "Tearing down dedicated AWS resources...";
      return wrapClickable(
        <div className="space-y-1 w-full min-w-[150px]">
          <Badge variant="destructive" className="flex items-center gap-1 font-semibold">
            <RotateCw className="h-3 w-3 animate-spin" />
            <span>DELETING ({progress}%)</span>
          </Badge>
          <Progress value={progress} className="h-1.5 bg-red-100 dark:bg-red-950" />
          <p className="text-[11px] text-red-500 truncate max-w-[180px]">
            {step}
          </p>
        </div>,
        `Click to view live steps & execution logs (${step})`
      );
    }
    case "SUSPENDING": {
      const progress = Number(record?.progress || 30);
      const step = record?.current_step || "Scaling tasks to 0 & draining traffic...";
      return wrapClickable(
        <div className="space-y-1 w-full min-w-[150px]">
          <Badge variant="warning" className="flex items-center gap-1 font-semibold">
            <RotateCw className="h-3 w-3 animate-spin" />
            <span>SUSPENDING ({progress}%)</span>
          </Badge>
          <Progress value={progress} className="h-1.5" />
          <p className="text-[11px] text-amber-600 dark:text-amber-400 truncate max-w-[180px]">
            {step}
          </p>
        </div>,
        `Click to view live steps & execution logs (${step})`
      );
    }
    case "RESUMING": {
      const progress = Number(record?.progress || 25);
      const step = record?.current_step || "Scaling tasks to 1 & verifying container health...";
      return wrapClickable(
        <div className="space-y-1 w-full min-w-[150px]">
          <Badge variant="info" className="flex items-center gap-1 font-semibold">
            <RotateCw className="h-3 w-3 animate-spin" />
            <span>RESUMING ({progress}%)</span>
          </Badge>
          <Progress value={progress} className="h-1.5" />
          <p className="text-[11px] text-teal-600 dark:text-teal-400 truncate max-w-[180px]">
            {step}
          </p>
        </div>,
        `Click to view live steps & execution logs (${step})`
      );
    }
    case "SEEDING": {
      const progress = Number(record?.progress || 20);
      const step = record?.current_step || "Seeding demo accounts and files...";
      return wrapClickable(
        <div className="space-y-1 w-full min-w-[150px]">
          <Badge variant="secondary" className="flex items-center gap-1 font-semibold">
            <RotateCw className="h-3 w-3 animate-spin" />
            <span>SEEDING ({progress}%)</span>
          </Badge>
          <Progress value={progress} className="h-1.5" />
          <p className="text-[11px] text-purple-600 dark:text-purple-400 truncate max-w-[180px]">
            {step}
          </p>
        </div>,
        `Click to view live steps & execution logs (${step})`
      );
    }
    case "UPGRADING": {
      const progress = Number(record?.progress || 25);
      const step = record?.current_step || "Rolling ECS container image upgrade in progress...";
      return wrapClickable(
        <div className="space-y-1 w-full min-w-[150px]">
          <Badge variant="info" className="flex items-center gap-1 font-semibold">
            <RotateCw className="h-3 w-3 animate-spin" />
            <span>UPGRADING ({progress}%)</span>
          </Badge>
          <Progress value={progress} className="h-1.5" />
          <p className="text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-[180px]">
            {step}
          </p>
        </div>,
        `Click to view live steps & execution logs (${step})`
      );
    }
    case "FAILED":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1">
                <Badge variant="destructive" className="flex items-center gap-1 font-semibold">
                  <XCircle className="h-3 w-3" />
                  <span>FAILED</span>
                </Badge>
                <p className="text-[10px] text-red-500 truncate max-w-[160px]">
                  {record?.last_error || "Saga rollback completed"}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{record?.last_error || "Provisioning failed and Saga rollback completed"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    case "DEGRADED":
      return (
        <Badge variant="warning" className="flex items-center gap-1 font-semibold">
          <AlertTriangle className="h-3 w-3" />
          <span>DEGRADED</span>
        </Badge>
      );
    case "INCIDENT":
      return (
        <Badge variant="destructive" className="flex items-center gap-1 font-semibold">
          <AlertOctagon className="h-3 w-3" />
          <span>INCIDENT / OUTAGE</span>
        </Badge>
      );
    case "MAINTENANCE":
      return (
        <Badge variant="info" className="flex items-center gap-1 font-semibold">
          <Clock className="h-3 w-3" />
          <span>MAINTENANCE</span>
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge variant="outline" className="font-semibold text-muted-foreground">
          SUSPENDED ($0 FINOPS)
        </Badge>
      );
    case "DELETED":
      return (
        <Badge variant="outline" className="font-semibold text-muted-foreground">
          DELETED
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-semibold">
          {status}
        </Badge>
      );
  }
};

export const renderSeverityTag = (sev: string): React.ReactNode => {
  switch (sev) {
    case "SEV-1":
      return (
        <Badge variant="destructive" className="font-bold">
          SEV-1 CRITICAL
        </Badge>
      );
    case "SEV-2":
      return (
        <Badge variant="warning" className="font-bold">
          SEV-2 MAJOR
        </Badge>
      );
    case "SEV-3":
      return (
        <Badge variant="info" className="font-semibold">
          SEV-3 MINOR
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-semibold">
          {sev || "NOTICE"}
        </Badge>
      );
  }
};
