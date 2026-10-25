import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, Database } from "lucide-react";

export interface TopologyTabProps {
  awsTopology: any;
  tenantId: string;
  domain: string;
  quotaGb?: number;
}

export const TopologyTab: React.FC<TopologyTabProps> = ({
  awsTopology = {},
  tenantId,
  domain,
  quotaGb = 100,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Compute & ALB Ingress */}
      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-[#1652f0]" />
            <span>Container-per-Tenant Compute &amp; Ingress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">ECS Fargate Cluster:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.cluster_name || "prod-storix-cluster"}
            </code>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Dedicated ECS Service:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.service_name || `service-${tenantId}`}
            </code>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Task Definition Family:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.task_family || `prod-storix-${tenantId}`}
            </code>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">ALB Target Group:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.alb_target_group_name || `tg-${tenantId}`}
            </code>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Host-Header Routing Rule:</span>
            <Badge variant="info" className="text-[10px] font-mono">
              {awsTopology.alb_routing_rule || `HostHeader: ${domain}`}
            </Badge>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Health Check Path:</span>
            <Badge variant="success" className="text-[10px] font-mono">
              {awsTopology.health_check_path || "/status.php"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Storage & Database Tiers */}
      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-sky-500" />
            <span>3-Tier Storage &amp; Database Isolation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">PostgreSQL Physical DB:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.database_name || `nc_${tenantId.replace(/-/g, "_")}`}
            </code>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">RDS Engine:</span>
            <Badge variant="info" className="text-[10px]">
              {awsTopology.database_engine || "PostgreSQL 16.3"}
            </Badge>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">EFS Access Point:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.efs_access_point_id || `/tenants/${tenantId}/access-point`}
            </code>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">EFS Posix Mount Path:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.efs_mount_path || `/tenants/${tenantId}/config`} (UID 33)
            </code>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">S3 Vault Prefix:</span>
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              {awsTopology.s3_vault_prefix || `s3://storix-vault/tenants/${tenantId}/`}
            </code>
          </div>
          <div className="py-1.5 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage Quota:</span>
              <span>18 GB used of {quotaGb} GB</span>
            </div>
            <Progress value={18} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
