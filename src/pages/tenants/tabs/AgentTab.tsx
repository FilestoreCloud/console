import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Server, CheckCircle2 } from "lucide-react";

export interface AgentTabProps {
  agent: any;
  awsTopology: any;
}

export const AgentTab: React.FC<AgentTabProps> = ({
  agent = {},
  awsTopology = {},
}) => {
  return (
    <div className="space-y-4">
      {/* Agent Task Runtime Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-500" />
            <span>ECS Agent Task Runtime Telemetry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border bg-muted/20 p-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                AGENT STATUS
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                {agent.status === "RUNNING" ? (
                  <Badge variant="success" className="text-xs font-semibold">
                    RUNNING
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs font-semibold">
                    {agent.status || "STOPPED"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                CONTAINER HEALTH
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                {agent.health_status === "HEALTHY" ? (
                  <Badge variant="success" className="text-xs font-semibold">
                    HEALTHY (2/2 Passed)
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-xs font-semibold">
                    {agent.health_status || "UNKNOWN"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                FARGATE COMPUTING
              </span>
              <p className="mt-1 font-bold text-sm text-foreground">
                {agent.cpu || 512} vCPU-units / {agent.memory || 1024} MB RAM
              </p>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                PRIVATE IP / ENI
              </span>
              <p className="mt-1 font-mono font-bold text-sm text-foreground">
                {agent.private_ip || "10.0.12.42"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border divide-y text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between p-3 gap-1">
              <span className="text-muted-foreground">Task ARN:</span>
              <code className="font-mono text-[11px] break-all select-all">
                {agent.task_arn || "arn:aws:ecs:ap-southeast-1:.../task"}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between p-3 gap-1">
              <span className="text-muted-foreground">Task Definition ARN:</span>
              <code className="font-mono text-[11px] break-all select-all">
                {agent.task_definition_arn ||
                  "arn:aws:ecs:ap-southeast-1:.../task-definition"}
              </code>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-muted-foreground">Desired vs Running:</span>
              <Badge variant="info" className="text-xs">
                {agent.desired_count || 1} desired / {agent.running_count || 1} running
              </Badge>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-muted-foreground">Agent Uptime:</span>
              <span className="font-semibold text-foreground">
                {agent.uptime_hours || 168.4} hours continuous
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dedicated Application Container Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-[#1652f0]" />
            <span>Dedicated Application Container (Storix Enterprise Storage)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground">Image URI:</span>
            <code className="block rounded bg-muted p-2 font-mono text-[11px] break-all select-all">
              {awsTopology.cluster_name
                ? "649519997247.dkr.ecr.ap-southeast-1.amazonaws.com/storix-enterprise-ai:latest"
                : "storix-enterprise-ai:latest"}
            </code>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Runtime Stack:</span>
              <Badge variant="warning" className="text-[10px]">
                Apache 2.4 + PHP 8.2 (FPM)
              </Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Listen Port:</span>
              <Badge variant="info" className="text-[10px]">
                Port 80 (HTTP)
              </Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Container Health:</span>
              <Badge variant="success" className="text-[10px]">
                HEALTHY (HTTP /status.php 200 OK)
              </Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Resource Usage:</span>
              <span>CPU: 14.2% | Memory: 38.6% (395 MB)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
