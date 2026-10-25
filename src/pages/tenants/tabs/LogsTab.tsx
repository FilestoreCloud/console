import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FileText, Search, RotateCw } from "lucide-react";
import { dataProvider } from "../../../providers/dataProvider";
import { useSmartInterval } from "../../../hooks/useSmartInterval";

export interface LogsTabProps {
  tenantId: string;
  awsTopology: any;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  tenantId,
  awsTopology = {},
}) => {
  const [logsContainer, setLogsContainer] = useState("all");
  const [logsLevel, setLogsLevel] = useState("ALL");
  const [logsFilter, setLogsFilter] = useState("");
  const [logsAutoRefresh, setLogsAutoRefresh] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [containerLogs, setContainerLogs] = useState<any[]>([]);

  const handleFetchLogs = useCallback(async () => {
    if (!dataProvider.custom) return;
    setLogsLoading(true);
    try {
      const res = await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "GET_CONTAINER_LOGS",
          tenant_id: tenantId,
          container: logsContainer,
          limit: 100,
          filter: logsFilter || undefined,
        },
      });
      setContainerLogs(res.data?.events || []);
    } catch (err: any) {
      console.warn("Notice fetching logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }, [tenantId, logsContainer, logsFilter]);

  useEffect(() => {
    handleFetchLogs();
  }, [handleFetchLogs]);

  useSmartInterval(handleFetchLogs, logsAutoRefresh ? 5000 : null, {
    maxIdleSeconds: 120,
    backoffFactor: 1.5,
    maxDelay: 30000,
    immediateOnVisible: true,
  });

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="py-4 px-5 border-b flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-sky-500" />
          <CardTitle className="text-sm font-semibold">
            Container Log Stream
          </CardTitle>
          <Badge variant="info" className="text-[10px] font-mono">
            Log Group: /ecs/
            {awsTopology.cluster_name ? "prod-storix" : "storix"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-36">
            <Select value={logsContainer} onValueChange={setLogsContainer}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Container" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="storix-app">Storix 30 App</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-28">
            <Select value={logsLevel} onValueChange={setLogsLevel}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-36">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter pattern..."
              value={logsFilter}
              onChange={(e) => setLogsFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchLogs()}
              className="pl-7 h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Switch
              checked={logsAutoRefresh}
              onCheckedChange={setLogsAutoRefresh}
              className="scale-75"
            />
            <span>Auto 5s</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchLogs}
            disabled={logsLoading}
            className="h-8 text-xs flex items-center gap-1"
          >
            <RotateCw className={`h-3 w-3 ${logsLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="rounded-lg border border-slate-800 bg-[#090d16] p-3 text-slate-300 font-mono text-xs max-h-[520px] overflow-y-auto space-y-1.5">
          {logsLoading && containerLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <RotateCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-400" />
              <p>Streaming logs from CloudWatch for tenant &apos;{tenantId}&apos;...</p>
            </div>
          ) : containerLogs.filter(
              (l) => logsLevel === "ALL" || l.level === logsLevel
            ).length === 0 ? (
            <div className="text-center py-8 text-slate-500 italic">
              No container logs match current filter criteria.
            </div>
          ) : (
            containerLogs
              .filter((l) => logsLevel === "ALL" || l.level === logsLevel)
              .map((l, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-1 border-b border-slate-900/60 flex-wrap"
                >
                  <span className="text-[11px] text-slate-500 min-w-[130px]">
                    {l.timestamp}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] py-0 px-1 font-mono"
                  >
                    {l.container}
                  </Badge>
                  <Badge
                    variant={
                      l.level === "ERROR"
                        ? "destructive"
                        : l.level === "WARN"
                        ? "warning"
                        : "info"
                    }
                    className="text-[10px] py-0 px-1 font-mono"
                  >
                    {l.level}
                  </Badge>
                  <span className="flex-1 whitespace-pre-wrap break-all text-slate-200">
                    {l.message}
                  </span>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
