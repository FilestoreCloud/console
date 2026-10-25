import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Terminal, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { dataProvider } from "../../../providers/dataProvider";

export interface TerminalTabProps {
  tenantId: string;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({ tenantId }) => {
  const [occCommand, setOccCommand] = useState("status");
  const [occLoading, setOccLoading] = useState(false);
  const [isAsync, setIsAsync] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<
    Array<{
      cmd: string;
      output: string;
      exit_code: number;
      duration_ms: number;
      timestamp: string;
    }>
  >([
    {
      cmd: "occ status",
      output: `  - installed: true\n  - version: 30.0.1.3\n  - versionstring: 30.0.1\n  - edition: Enterprise AI\n  - maintenance: false\n  - needsDbUpgrade: false\n  - productname: Storix\n  - extendedSupport: true`,
      exit_code: 0,
      duration_ms: 182,
      timestamp: new Date().toISOString(),
    },
  ]);

  const pollJobStatus = async (jobId: string, cmd: string, startTime: number) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await dataProvider.custom!({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "CHECK_OCC_JOB",
            tenant_id: tenantId,
            job_id: jobId,
          },
        });
        const job = res.data?.job || res.data;
        if (job.status === "COMPLETED" || job.status === "FAILED") {
          const duration = Math.round(Date.now() - startTime);
          setTerminalOutput((prev) => [
            ...prev,
            {
              cmd: `occ ${cmd} (Async Job ${jobId})`,
              output:
                job.output ||
                (job.status === "COMPLETED"
                  ? "Async job finished successfully."
                  : "Job failed."),
              exit_code: job.exit_code ?? (job.status === "COMPLETED" ? 0 : 1),
              duration_ms: duration,
              timestamp: new Date().toISOString(),
            },
          ]);
          setOccLoading(false);
          toast.success(`Async job 'occ ${cmd}' completed!`);
          return;
        }
      } catch (_) {
        // continue polling
      }
    }
    setOccLoading(false);
    toast.warning(`Async job ${jobId} is taking longer than expected.`);
  };

  const handleExecuteOcc = async (cmdToRun?: string) => {
    if (!dataProvider.custom) return;
    const cmd = (cmdToRun || occCommand).trim();
    if (!cmd) return;
    setOccLoading(true);
    const startTime = Date.now();
    try {
      if (isAsync) {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "EXECUTE_OCC_ASYNC",
            tenant_id: tenantId,
            command: cmd,
          },
        });
        const jobId = res.data?.job_id || `job-${Date.now()}`;
        setTerminalOutput((prev) => [
          ...prev,
          {
            cmd: `occ ${cmd}`,
            output: `[ASYNC DISPATCH] Job ${jobId} submitted to Step Functions state engine. Polling output in background...`,
            exit_code: 0,
            duration_ms: 50,
            timestamp: new Date().toISOString(),
          },
        ]);
        toast.info(`Dispatched async OCC job: ${jobId}`);
        pollJobStatus(jobId, cmd, startTime);
      } else {
        const res = await dataProvider.custom({
          url: dataProvider.getApiUrl(),
          method: "post",
          payload: {
            action: "EXECUTE_OCC_COMMAND",
            tenant_id: tenantId,
            command: cmd,
          },
        });
        const data = res.data;
        setTerminalOutput((prev) => [
          ...prev,
          {
            cmd: data.command || `occ ${cmd}`,
            output: data.output || "Execution completed.",
            exit_code: data.exit_code ?? 0,
            duration_ms: data.duration_ms ?? 240,
            timestamp: data.executed_at || new Date().toISOString(),
          },
        ]);
        toast.success(`Command 'occ ${cmd}' executed successfully!`);
        setOccLoading(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "OCC execution failed");
      setOccLoading(false);
    }
  };

  const quickCommands = [
    "status",
    "files:scan --all",
    "db:add-missing-indices",
    "maintenance:mode --status",
    "app:list",
    "check",
    "user:list",
  ];

  return (
    <div className="space-y-4">
      {/* Control Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#1652f0]" />
            <CardTitle className="text-sm font-semibold">
              Interactive Storix `occ` CLI Diagnostic Runner
            </CardTitle>
            <Badge variant="info" className="text-[10px]">
              service-{tenantId}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Async Mode:</span>
              <Switch
                checked={isAsync}
                onCheckedChange={setIsAsync}
                className="scale-75"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTerminalOutput([])}
              className="h-7 text-xs flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Screen</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {/* Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-muted-foreground">
              Quick Diagnostic Commands:
            </span>
            {quickCommands.map((c) => (
              <Button
                key={c}
                variant="outline"
                size="sm"
                onClick={() => handleExecuteOcc(c)}
                disabled={occLoading}
                className="h-6 text-xs font-mono"
              >
                {c}
              </Button>
            ))}
          </div>

          {/* Command Input Bar */}
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-slate-900 text-emerald-400 font-mono text-xs font-bold">
              occ
            </span>
            <Input
              placeholder="e.g. status, config:system:get version, db:convert-filecache-bigint"
              value={occCommand}
              onChange={(e) => setOccCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecuteOcc()}
              className="rounded-none font-mono text-xs h-9 flex-1"
            />
            <Button
              type="button"
              size="sm"
              disabled={occLoading}
              onClick={() => handleExecuteOcc()}
              className="rounded-l-none h-9 text-xs bg-[#1652f0] hover:bg-[#1652f0]/90 text-white flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Execute</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Terminal Screen Card */}
      <Card className="border border-slate-800 bg-[#0f172a] shadow-md overflow-hidden text-slate-200">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="ml-2 font-mono text-slate-400 text-[11px]">
            www-data@fargate-task: /var/www/html
          </span>
        </div>

        <div className="min-h-[280px] max-h-[500px] overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-4">
          {terminalOutput.length === 0 ? (
            <div className="text-slate-500 italic">
              Terminal output buffer empty. Execute a command above to inspect
              Storix platform internals.
            </div>
          ) : (
            terminalOutput.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
                  <div>
                    <span className="text-sky-400">storix@{tenantId}</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-purple-400">/var/www/html</span>
                    <span className="text-slate-500">$ </span>
                    <strong className="text-emerald-400">{item.cmd}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Badge
                      variant={item.exit_code === 0 ? "success" : "destructive"}
                      className="text-[10px] py-0 px-1 font-mono"
                    >
                      exit {item.exit_code}
                    </Badge>
                    <span className="text-slate-500 font-mono">
                      {item.duration_ms}ms
                    </span>
                    <span className="text-slate-500">
                      {item.timestamp.slice(11, 19)}
                    </span>
                  </div>
                </div>

                <pre
                  className={`p-3 rounded bg-[#090d16] text-slate-200 text-[11px] whitespace-pre-wrap break-all border-l-2 ${
                    item.exit_code === 0
                      ? "border-l-emerald-500"
                      : "border-l-red-500"
                  }`}
                >
                  {item.output}
                </pre>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
