import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GitBranch,
  Workflow,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Zap,
  LayoutDashboard,
  FileText,
  Loader2,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { dataProvider } from "../../../providers/dataProvider";

export interface ObservabilityTabProps {
  tenantId: string;
}

export const ObservabilityTab: React.FC<ObservabilityTabProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [workflowFilter, setWorkflowFilter] = useState<string>("ALL");
  const [selectedExecutionArn, setSelectedExecutionArn] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState("");
  const [logLevel, setLogLevel] = useState("ALL");
  const [copiedArn, setCopiedArn] = useState(false);

  const [obsData, setObsData] = useState<any>({
    region: "ap-southeast-1",
    environment: "prod",
    log_group: "/aws/vendedlogs/states/prod-storix-sfn",
    tracing_enabled: true,
    state_machines: [],
    executions: [],
    selected_execution: null,
    execution_history: [],
    logs: [],
    traces: [],
    console_links: {},
  });

  const [liveStream, setLiveStream] = useState<any>(null);

  const fetchLiveStream = useCallback(
    async (execArn?: string) => {
      if (!dataProvider.custom) return;
      try {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "STREAM_SFN_PROGRESS",
            tenant_id: tenantId,
            execution_arn: execArn || selectedExecutionArn || undefined,
          },
        });
        if (res.data) {
          setLiveStream(res.data);
        }
      } catch {
        // Fallback gracefully
      }
    },
    [tenantId, selectedExecutionArn]
  );

  const fetchData = useCallback(
    async (execArn?: string) => {
      if (!dataProvider.custom) return;
      setLoading(true);
      try {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "GET_SFN_OBSERVABILITY",
            tenant_id: tenantId,
            execution_arn: execArn || selectedExecutionArn || undefined,
            limit: 30,
          },
        });
        if (res.data) {
          setObsData(res.data);
          if (!selectedExecutionArn && res.data.executions?.length > 0) {
            setSelectedExecutionArn(res.data.executions[0].executionArn);
          }
        }
      } catch (err: any) {
        console.warn("Notice fetching Step Functions observability:", err);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, selectedExecutionArn]
  );

  useEffect(() => {
    fetchData();
    fetchLiveStream();
  }, [fetchData, fetchLiveStream]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
      fetchLiveStream();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData, fetchLiveStream]);

  const handleSelectExecution = (arn: string) => {
    setSelectedExecutionArn(arn);
    fetchData(arn);
    fetchLiveStream(arn);
  };

  const handleCopyArn = (arn: string) => {
    navigator.clipboard?.writeText(arn);
    setCopiedArn(true);
    setTimeout(() => setCopiedArn(false), 2000);
  };

  const executions = (obsData.executions || []).filter((ex: any) => {
    if (workflowFilter === "ALL") return true;
    return ex.workflowType === workflowFilter;
  });

  const logs = (obsData.logs || []).filter((l: any) => {
    if (logLevel !== "ALL" && l.level !== logLevel) return false;
    if (logFilter && !l.message?.toLowerCase().includes(logFilter.toLowerCase())) return false;
    return true;
  });

  const renderStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCEEDED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            SUCCEEDED
          </Badge>
        );
      case "RUNNING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 gap-1">
            <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
            RUNNING
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3.5 w-3.5" />
            FAILED
          </Badge>
        );
      case "TIMED_OUT":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            TIMED_OUT
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "UNKNOWN"}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Overview & Deep Links Banner */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/20 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Workflow className="h-5 w-5 text-primary shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  Step Functions Orchestration & X-Ray Distributed Tracing
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Telemetry
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Live state transitions, execution step timeline, CloudWatch structured logs, and AWS
                X-Ray service traces for tenant <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-foreground">{tenantId}</code>.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end lg:self-center">
              <div className="flex items-center gap-2">
                <Switch
                  id="sfn-auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <label htmlFor="sfn-auto-refresh" className="text-xs text-muted-foreground cursor-pointer select-none">
                  {autoRefresh ? "Auto 4s" : "Auto Off"}
                </label>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchData()}
                disabled={loading}
                className="gap-1.5 h-8 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* 1-Click AWS Deep Link Shortcuts */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground">AWS Management Console Links:</span>
            {obsData.console_links?.step_functions && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-dashed"
                asChild
              >
                <a href={obsData.console_links.step_functions} target="_blank" rel="noreferrer">
                  <Workflow className="h-3 w-3" />
                  Step Functions State Machines
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </Button>
            )}
            {obsData.console_links?.cloudwatch_log_group && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-dashed"
                asChild
              >
                <a href={obsData.console_links.cloudwatch_log_group} target="_blank" rel="noreferrer">
                  <FileText className="h-3 w-3" />
                  CloudWatch SFN Log Group
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </Button>
            )}
            {obsData.console_links?.cloudwatch_insights && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-dashed"
                asChild
              >
                <a href={obsData.console_links.cloudwatch_insights} target="_blank" rel="noreferrer">
                  <LayoutDashboard className="h-3 w-3" />
                  CloudWatch Log Insights
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </Button>
            )}
            {obsData.console_links?.xray_traces && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-dashed text-amber-600 dark:text-amber-400"
                asChild
              >
                <a href={obsData.console_links.xray_traces} target="_blank" rel="noreferrer">
                  <Zap className="h-3 w-3" />
                  AWS X-Ray Trace Map
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time State Machine Lifecycle Visualizer */}
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm sm:text-base text-foreground">
                State Machine Lifecycle Visualizer
              </span>
              {liveStream?.status === "RUNNING" ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 gap-1 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                  Live Stream Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Synchronized
                </Badge>
              )}
            </div>
            {liveStream && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {liveStream.elapsedSeconds !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Elapsed: <strong className="text-foreground">{liveStream.elapsedSeconds}s</strong>
                  </span>
                )}
                {liveStream.estimatedRemainingSeconds > 0 && (
                  <span>
                    Est. Remaining: <strong className="text-foreground">~{liveStream.estimatedRemainingSeconds}s</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-foreground">
                Current Active Step:{" "}
                <span className="text-primary font-bold">
                  {liveStream?.currentStep || "Workflow Completed & Operational"}
                </span>
              </div>
              {liveStream?.currentStepDescription && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Info className="h-3 w-3" />
                  {liveStream.currentStepDescription}
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">
                {liveStream?.progress ?? 100}%
              </span>
            </div>
          </div>

          <Progress value={liveStream?.progress ?? 100} className="h-2" />

          {/* Milestones grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
            {(
              liveStream?.milestones || [
                { id: "VALIDATE", name: "Validation", percent: 15, status: "completed", description: "Validate tenant parameters & initialize DynamoDB" },
                { id: "DATABASE", name: "Postgres Isolation", percent: 35, status: "completed", description: "Create isolated database schema" },
                { id: "STORAGE", name: "EFS Storage", percent: 55, status: "completed", description: "Provision dedicated EFS access point" },
                { id: "COMPUTE", name: "ECS Task", percent: 75, status: "completed", description: "Register container task definition & service" },
                { id: "HEALTH_CHECK", name: "Health Probe", percent: 90, status: "completed", description: "Verify container health check probe" },
                { id: "ACTIVE", name: "Ready & Active", percent: 100, status: "completed", description: "Tenant operational and ready for use" },
              ]
            ).map((m: any) => {
              const isDone = m.status === "completed";
              const isActive = m.status === "active";
              const isError = m.status === "error";

              let badgeClasses = "bg-muted/40 border-muted text-muted-foreground";
              if (isDone) {
                badgeClasses = "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400";
              } else if (isActive) {
                badgeClasses = "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 ring-2 ring-blue-400";
              } else if (isError) {
                badgeClasses = "bg-destructive/10 border-destructive/30 text-destructive";
              }

              return (
                <TooltipProvider key={m.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`border rounded-lg p-2.5 text-center transition-all cursor-default ${badgeClasses}`}>
                        <div className="text-xs font-medium flex items-center justify-center gap-1 truncate">
                          {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          {isActive && <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin shrink-0" />}
                          {isError && <Info className="h-3.5 w-3.5 text-destructive shrink-0" />}
                          <span className="truncate">{m.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">{m.percent}%</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs max-w-xs">{m.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Step Functions Workflow Executions Table */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Step Functions Workflow Executions ({executions.length})
              </CardTitle>
            </div>
            <div className="w-56">
              <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Workflows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Workflows</SelectItem>
                  <SelectItem value="PROVISION">Tenant Provisioning</SelectItem>
                  <SelectItem value="SEED">Tenant Seeding</SelectItem>
                  <SelectItem value="DEMO">Demo Provision & Seed</SelectItem>
                  <SelectItem value="SUSPEND">Tenant Suspend</SelectItem>
                  <SelectItem value="RESUME">Tenant Resume</SelectItem>
                  <SelectItem value="DEPROVISION">Tenant Deprovision</SelectItem>
                  <SelectItem value="FLEET_UPGRADE">Fleet Rolling Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[360px] overflow-auto">
            <Table>
              <TableHeader className="bg-card sticky top-0 z-10 border-b">
                <TableRow>
                  <TableHead className="text-xs">Execution Name</TableHead>
                  <TableHead className="text-xs">Workflow</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-xs">Started</TableHead>
                  <TableHead className="text-xs text-right">Console Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                      No executions match the selected filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  executions.map((record: any) => {
                    const isSelected = record.executionArn === selectedExecutionArn;
                    return (
                      <TableRow
                        key={record.executionArn}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectExecution(record.executionArn)}
                      >
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className={`font-semibold text-xs ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {record.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {record.stateMachineName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                            {record.workflowType}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.durationSeconds ? `${record.durationSeconds}s` : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.startDate ? new Date(record.startDate).toLocaleTimeString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-primary hover:text-primary"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={record.deepLinks?.sfnConsole || obsData.console_links?.step_functions}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Console
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
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

      {/* 3. Selected Execution Detail & State Transition Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <Card className="h-full shadow-sm">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Execution Timeline & State Graph
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {obsData.execution_history?.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                  {obsData.execution_history.map((step: any, idx: number) => {
                    const isErr = step.type?.includes("Failed") || step.type?.includes("Error");
                    const isSucc = step.type === "ExecutionSucceeded";

                    let dotColor = "bg-blue-500";
                    if (isErr) dotColor = "bg-destructive";
                    else if (isSucc) dotColor = "bg-emerald-500";

                    return (
                      <div key={idx} className="relative">
                        <span
                          className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-background ${dotColor}`}
                        />
                        <div className="text-xs font-semibold text-foreground">
                          {step.stepName || step.type}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {step.type} {step.timestamp ? `• ${new Date(step.timestamp).toLocaleTimeString()}` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Alert className="bg-muted/50 border-muted">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <AlertDescription className="text-xs text-muted-foreground ml-2">
                    Select an execution from the table above to view state transition history.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="h-full shadow-sm">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Execution I/O & X-Ray Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {obsData.selected_execution ? (
                <>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Execution ARN:</div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-muted/60 font-mono text-[11px] text-foreground">
                      <span className="truncate">{obsData.selected_execution.executionArn}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleCopyArn(obsData.selected_execution.executionArn)}
                      >
                        {copiedArn ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  {obsData.selected_execution.traceHeader && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">AWS X-Ray Trace Header:</div>
                      <div className="p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[11px] truncate">
                        {obsData.selected_execution.traceHeader}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Input Payload:</div>
                    <pre className="bg-slate-900 text-sky-400 p-2.5 rounded text-[11px] font-mono max-h-32 overflow-y-auto">
                      {(() => {
                        try {
                          return JSON.stringify(
                            JSON.parse(obsData.selected_execution.input || "{}"),
                            null,
                            2
                          );
                        } catch {
                          return obsData.selected_execution.input || "{}";
                        }
                      })()}
                    </pre>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Output Result:</div>
                    <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded text-[11px] font-mono max-h-32 overflow-y-auto">
                      {(() => {
                        try {
                          return JSON.stringify(
                            JSON.parse(obsData.selected_execution.output || "{}"),
                            null,
                            2
                          );
                        } catch {
                          return obsData.selected_execution.output || "{}";
                        }
                      })()}
                    </pre>
                  </div>
                </>
              ) : (
                <Alert className="bg-muted/50 border-muted">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <AlertDescription className="text-xs text-muted-foreground ml-2">
                    No execution selected.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Live CloudWatch Execution Logs */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm sm:text-base font-semibold">
                Step Functions CloudWatch Structured Logs ({logs.length})
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-44">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              <div className="w-28">
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Levels</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="ERROR">ERROR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-xs max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
            {logs.length > 0 ? (
              logs.map((log: any, idx: number) => {
                const isError = log.level === "ERROR";
                return (
                  <div key={idx} className="flex gap-3 mb-1.5 hover:bg-slate-900/60 p-0.5 rounded">
                    <span className="text-slate-500 shrink-0">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "-"}
                    </span>
                    <span
                      className={`font-semibold shrink-0 w-12 ${
                        isError ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      [{log.level}]
                    </span>
                    <span className={`break-all ${isError ? "text-rose-200" : "text-slate-200"}`}>
                      {log.structured
                        ? `${log.structured.type || ""} - ${JSON.stringify(log.structured.details || log.structured)}`
                        : log.message}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500 text-center py-6">
                No CloudWatch log events found for current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. AWS X-Ray Tracing Telemetry */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm sm:text-base font-semibold">
              AWS X-Ray Distributed Traces
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[360px] overflow-auto">
            <Table>
              <TableHeader className="bg-card sticky top-0 z-10 border-b">
                <TableRow>
                  <TableHead className="text-xs">Trace ID</TableHead>
                  <TableHead className="text-xs">Latency / Duration</TableHead>
                  <TableHead className="text-xs">Response Time</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Service Nodes Traversed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(obsData.traces || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                      No distributed trace records available.
                    </TableCell>
                  </TableRow>
                ) : (
                  obsData.traces.map((trace: any) => (
                    <TableRow key={trace.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        <a
                          href={trace.url || obsData.console_links?.xray_traces}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {trace.id}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {trace.duration ? `${trace.duration}s` : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {trace.responseTime ? `${trace.responseTime}s` : "-"}
                      </TableCell>
                      <TableCell>
                        {trace.status === "FAULT" ? (
                          <Badge variant="destructive" className="text-xs">FAULT</Badge>
                        ) : trace.status === "ERROR" ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 text-xs">
                            ERROR
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs">
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(trace.services || []).map((s: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] font-mono">
                              {s.replace("AWS::", "")}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
