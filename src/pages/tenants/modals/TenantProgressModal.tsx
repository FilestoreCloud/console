import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RotateCw,
  CheckCircle2,
  Clock,
  Copy,
  Search,
  Zap,
  Terminal,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { dataProvider } from "../../../providers/dataProvider";

export interface LogEntry {
  timestamp: string;
  source: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR" | string;
  message: string;
}

export interface MilestoneItem {
  id: string;
  name: string;
  description: string;
  percent: number;
  status: "completed" | "active" | "pending" | "error";
}

export interface TenantProgressModalProps {
  visible: boolean;
  onClose: () => void;
  tenantId: string | null;
  initialStatus?: string;
}

export const TenantProgressModal: React.FC<TenantProgressModalProps> = ({
  visible,
  onClose,
  tenantId,
  initialStatus = "PROVISIONING",
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    workflowType: string;
    status: string;
    progress: number;
    currentStep: string;
    currentStepDescription?: string;
    elapsedSeconds: number;
    estimatedRemainingSeconds: number;
    milestones: MilestoneItem[];
    logs: LogEntry[];
    executionArn?: string;
  } | null>(null);

  const [filterText, setFilterText] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchProgress = useCallback(async () => {
    if (!tenantId || !dataProvider.custom) return;
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "STREAM_SFN_PROGRESS",
          tenant_id: tenantId,
        },
      });
      if (res?.data) {
        setData({
          workflowType:
            res.data.workflowType ||
            (initialStatus.includes("DEL") ? "DEPROVISION" : "PROVISION"),
          status: res.data.status || initialStatus,
          progress: Number(res.data.progress ?? 15),
          currentStep: res.data.currentStep || "Workflow in progress...",
          currentStepDescription: res.data.currentStepDescription,
          elapsedSeconds: Number(res.data.elapsedSeconds || 0),
          estimatedRemainingSeconds: Number(
            res.data.estimatedRemainingSeconds || 0
          ),
          milestones: res.data.milestones || [],
          logs: res.data.logs || [],
          executionArn: res.data.executionArn,
        });
      }
    } catch (err: any) {
      console.warn("Error streaming SFN progress:", err);
    }
  }, [tenantId, initialStatus]);

  useEffect(() => {
    if (!visible || !tenantId) return;
    setLoading(true);
    fetchProgress().finally(() => setLoading(false));

    const interval = setInterval(fetchProgress, 2000);
    return () => clearInterval(interval);
  }, [visible, tenantId, fetchProgress]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data?.logs, autoScroll]);

  if (!visible) return null;

  const isDeleting =
    data?.workflowType === "DEPROVISION" ||
    ["DELETING", "DEPROVISIONING"].includes(initialStatus) ||
    data?.status?.includes("DEP") ||
    data?.status?.includes("DEL");

  const progress = data?.progress ?? (isDeleting ? 15 : 20);
  const currentStep = data?.currentStep || "Processing...";
  const currentStepDesc = data?.currentStepDescription;
  const isFinished = progress >= 100 || data?.status === "SUCCEEDED";

  const filteredLogs = (data?.logs || []).filter((l) => {
    const matchesLevel = filterLevel === "ALL" || l.level === filterLevel;
    const matchesSearch =
      !filterText ||
      l.message.toLowerCase().includes(filterText.toLowerCase()) ||
      l.source.toLowerCase().includes(filterText.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopyLogs = () => {
    const formatted = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.source}] [${l.level}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(formatted);
    toast.success("Logs copied to clipboard!");
  };

  return (
    <Dialog open={visible} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {isFinished ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <RotateCw
                  className={`h-5 w-5 animate-spin shrink-0 ${
                    isDeleting ? "text-red-500" : "text-[#1652f0]"
                  }`}
                />
              )}
              <DialogTitle className="text-sm sm:text-base font-bold truncate">
                {isDeleting
                  ? "Deprovisioning Teardown"
                  : "Provisioning Orchestration"}
                : <span className="text-[#1652f0]">{tenantId}</span>
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant={isDeleting ? "destructive" : "info"}
                className="font-bold text-[10px] sm:text-xs shrink-0"
              >
                {isDeleting ? "DEPROVISIONING" : "PROVISIONING"}
              </Badge>
              {isFinished && (
                <Badge variant="success" className="text-[10px] sm:text-xs shrink-0">
                  COMPLETED
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Progress & Timing Bar */}
          <div
            className={`rounded-lg border p-3 ${
              isDeleting
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 w-full sm:w-3/5">
                <div className="flex justify-between text-xs font-semibold flex-wrap gap-1">
                  <span>Overall Execution Progress: {progress}%</span>
                  {data && data.elapsedSeconds > 0 && (
                    <span className="text-muted-foreground flex items-center gap-1 font-normal">
                      <Clock className="h-3 w-3 shrink-0" />
                      Elapsed: <b>{data.elapsedSeconds}s</b>
                      {data.estimatedRemainingSeconds > 0 && (
                        <span>
                          (~{data.estimatedRemainingSeconds}s remaining)
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <Progress
                  value={progress}
                  className={`h-2 ${
                    isDeleting ? "bg-red-100 dark:bg-red-950" : ""
                  }`}
                />
              </div>

              <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
                <Badge
                  variant="info"
                  className="flex items-center gap-1 text-[11px] shrink-0"
                >
                  <Zap className="h-3 w-3" />
                  <span>AWS Step Functions &amp; Worker Lambda</span>
                </Badge>
                {data?.executionArn && (
                  <code
                    className="text-[10px] text-muted-foreground truncate max-w-[260px] sm:max-w-xs cursor-pointer hover:underline font-mono"
                    onClick={() => {
                      navigator.clipboard.writeText(data.executionArn!);
                      toast.success("Execution ARN copied!");
                    }}
                    title={data.executionArn}
                  >
                    {data.executionArn.split(":").pop()}
                  </code>
                )}
              </div>
            </div>
          </div>

          {/* Current Active Step Banner */}
          <Alert variant={isDeleting ? "warning" : "info"} className="py-2.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {isFinished ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
              )}
              <span className="font-bold">Active Step:</span>
              <Badge variant="secondary" className="font-semibold text-xs shrink-0">
                {currentStep}
              </Badge>
              {currentStepDesc && (
                <span className="text-muted-foreground break-words">— {currentStepDesc}</span>
              )}
            </div>
          </Alert>

          {/* Milestones Visualizer */}
          <div>
            <div className="text-xs font-semibold mb-2">
              Execution Milestones &amp; Current Phase:
            </div>
            {data?.milestones && data.milestones.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {data.milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg border p-2 text-xs transition-colors flex flex-col justify-between ${
                      m.status === "completed"
                        ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                        : m.status === "active"
                        ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold"
                        : "border-border text-muted-foreground bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate font-medium">{m.name}</span>
                      <span className="font-mono text-[10px] shrink-0">{m.percent}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1 text-muted-foreground" />
                <span>Discovering execution milestones...</span>
              </div>
            )}
          </div>

          {/* Real-Time Live Logs Terminal */}
          <div className="rounded-lg border border-slate-800 bg-[#0d1117] overflow-hidden shadow-md">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-slate-800 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-slate-200">
                  Live Execution Logs
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({filteredLogs.length} events)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                <div className="relative flex-1 sm:w-36 min-w-[110px]">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    placeholder="Filter logs..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="pl-7 h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 w-full"
                  />
                </div>

                <div className="w-28 shrink-0">
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Levels</SelectItem>
                      <SelectItem value="INFO">INFO</SelectItem>
                      <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                      <SelectItem value="WARN">WARN</SelectItem>
                      <SelectItem value="ERROR">ERROR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
                  <span>Scroll:</span>
                  <Switch
                    checked={autoScroll}
                    onCheckedChange={setAutoScroll}
                    className="scale-75"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800 shrink-0"
                  onClick={handleCopyLogs}
                  title="Copy logs"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Logs Body */}
            <div
              ref={logContainerRef}
              className="max-h-64 min-h-[160px] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed text-slate-300 divide-y divide-slate-800/40"
            >
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {filterText || filterLevel !== "ALL"
                    ? "No logs match the current filter criteria."
                    : "Streaming logs from Step Functions & CloudWatch worker..."}
                </div>
              ) : (
                filteredLogs.map((log, idx) => {
                  let lvlColor = "text-sky-400";
                  if (log.level === "SUCCESS") lvlColor = "text-emerald-400";
                  else if (log.level === "WARN") lvlColor = "text-amber-400";
                  else if (log.level === "ERROR") lvlColor = "text-red-400";

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-2 py-1 hover:bg-slate-800/20"
                    >
                      <span className="text-slate-500 shrink-0 select-none">
                        {log.timestamp.includes("T")
                          ? log.timestamp.split("T")[1].replace("Z", "")
                          : log.timestamp.split(" ")[1] || log.timestamp}
                      </span>
                      <span className="text-emerald-300 bg-white/5 px-1 rounded text-[10px] shrink-0 font-semibold">
                        {log.source}
                      </span>
                      <span className={`shrink-0 font-semibold text-[10px] ${lvlColor}`}>
                        [{log.level}]
                      </span>
                      <span className={`break-all whitespace-pre-wrap flex-1 ${log.level === "ERROR" ? "text-red-400" : "text-slate-200"}`}>
                        {log.message}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="bg-[#1652f0] hover:bg-[#1652f0]/90 text-white w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
