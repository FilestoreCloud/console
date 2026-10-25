import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Zap,
  Globe,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Tag as TagIcon,
} from "lucide-react";

export interface FinOpsTabProps {
  tenantId: string;
  tenant: any;
  finops?: any;
}

export const FinOpsTab: React.FC<FinOpsTabProps> = ({
  tenantId,
  tenant = {},
  finops,
}) => {
  const fData = finops || tenant.finops || {
    plan_tier: "Enterprise",
    monthly_subscription_usd: 499.0,
    total_infra_cost_usd: 12.85,
    gross_margin_percent: 97.4,
    breakdown: {
      s3_vault_storage_usd: 4.6,
      fargate_compute_usd: 5.18,
      bedrock_ai_tokens_usd: 1.05,
      data_transfer_usd: 2.02,
    },
    spot_savings_usd: 7.77,
    storage_used_gb: 200,
    quota_gb: 1000,
    currency: "USD",
    cost_attribution_tag: `storix:tenant-id=${tenantId}`,
  };

  const costBreakdownData = [
    {
      key: "s3",
      category: "S3 Object Vault Storage",
      desc: "Intelligent-Tiering & Primary Encrypted Vault",
      usage: `${fData.storage_used_gb || 200} GB`,
      rate: "$0.023 / GB-mo",
      monthly_cost: `$${(fData.breakdown?.s3_vault_storage_usd || 4.6).toFixed(2)}`,
    },
    {
      key: "compute",
      category: "Amazon ECS Fargate Fleet",
      desc: "1:3 Spot Capacity Provider Strategy",
      usage: "720 hours (Blended Spot)",
      rate: "$0.0144 / hr (Spot 75%)",
      monthly_cost: `$${(fData.breakdown?.fargate_compute_usd || 5.18).toFixed(2)}`,
    },
    {
      key: "ai",
      category: "Amazon Bedrock AI Engine",
      desc: "Claude 3.5 Sonnet Converse API Tokens",
      usage: "150,000 tokens",
      rate: "$0.003 / 1k in, $0.015 / 1k out",
      monthly_cost: `$${(fData.breakdown?.bedrock_ai_tokens_usd || 1.05).toFixed(2)}`,
    },
    {
      key: "network",
      category: "Data Transfer & ALB Egress",
      desc: "Client WebDAV sync & API Gateway",
      usage: "15 GB transfer",
      rate: "$0.09 / GB",
      monthly_cost: `$${(fData.breakdown?.data_transfer_usd || 2.02).toFixed(2)}`,
    },
  ];

  const customDomain = tenant.custom_domain || `${tenantId}.customer-portal.com`;
  const domainStatus = tenant.custom_domain_status || "ISSUED_MANAGED";
  const cnameTarget = tenant.cname_target || `dev-nextcloud-alb.ap-southeast-1.elb.amazonaws.com`;

  return (
    <div className="space-y-4">
      {/* 1. Top FinOps KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Monthly Subscription</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-primary">
                ${fData.monthly_subscription_usd?.toFixed(2) || "499.00"}
              </div>
              <Badge variant="outline" className="mt-1 bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 text-xs">
                Tier: {fData.plan_tier || "Enterprise"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Total AWS Infra Cost (COGS)</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                ${fData.total_infra_cost_usd?.toFixed(2) || "12.85"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Spot Savings: -${fData.spot_savings_usd?.toFixed(2) || "7.77"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Gross Profit Margin</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5" />
                {fData.gross_margin_percent || 97.4}%
              </div>
              <div className="mt-2">
                <Progress value={fData.gross_margin_percent || 97.4} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Cost Allocation Tag</div>
            <div className="mt-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 font-mono text-[11px] truncate max-w-full">
                <TagIcon className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">{fData.cost_attribution_tag}</span>
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Granular AWS CUR Attribution</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. White-Label Custom Domain & SSL Automation Card */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base font-semibold">
              White-Label Custom Domain & Automated SSL (CloudFront SaaS Manager)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Custom FQDN</div>
              <div className="font-semibold text-foreground text-sm truncate">{customDomain}</div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">SSL Status</div>
              <div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  {domainStatus}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Edge Target (CNAME)</div>
              <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] block truncate">
                {cnameTarget}
              </code>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Certificate Authority</div>
              <div className="text-foreground">AWS Certificate Manager (ACM) Managed TLS</div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Edge Distribution</div>
              <div className="text-foreground">Amazon CloudFront SaaS Multi-Tenant Distribution (2,000 SNI capacity)</div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="text-muted-foreground font-medium">Automated Validation</div>
              <div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 gap-1">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  HTTP-01 Managed Token
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Cost Attribution Breakdown Table */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 border-b">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm sm:text-base font-semibold">
              Unit Economics & AWS Infrastructure Cost Breakdown
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Cost Category</TableHead>
                  <TableHead className="text-xs">Usage Metrics</TableHead>
                  <TableHead className="text-xs">Unit Rate</TableHead>
                  <TableHead className="text-xs text-right">Monthly Cost (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costBreakdownData.map((item) => (
                  <TableRow key={item.key} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-semibold text-xs text-foreground">{item.category}</div>
                        <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.usage}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.rate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 font-mono text-xs">
                        {item.monthly_cost}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 4. FinOps Architecture Directives */}
      <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
        <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-xs font-semibold">Active FinOps Cost Optimizations</AlertTitle>
        <AlertDescription className="text-xs mt-1 text-blue-800 dark:text-blue-300">
          This tenant utilizes Amazon Fargate Spot capacity (saving 52.5% compute cost), S3 Intelligent-Tiering automatic cold data archiving, and direct-to-S3 multipart upload bypass to achieve a 97%+ gross profit margin.
        </AlertDescription>
      </Alert>
    </div>
  );
};
