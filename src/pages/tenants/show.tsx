import React, { useState, useEffect } from "react";
import { useShow, useUpdate, useNavigation } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  LineChart,
  Server,
  Bot,
  Users,
  AlertTriangle,
  ShieldCheck,
  Terminal,
  FileText,
  GitBranch,
  DollarSign,
  Heart,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dataProvider } from "../../providers/dataProvider";
import { usePageVisibility } from "../../hooks/usePageVisibility";
import { useSmartInterval } from "../../hooks/useSmartInterval";
import {
  MetricsTab,
  TopologyTab,
  AgentTab,
  AccountsTab,
  IncidentsTab,
  AuditTab,
  TerminalTab,
  LogsTab,
  ObservabilityTab,
  FinOpsTab,
  HealthTab,
} from "./tabs";
import { TenantModals } from "./modals";
import { TenantHeader } from "./TenantHeader";
import { TenantIncidentAlert } from "./TenantIncidentAlert";
import { TenantProgressCard } from "./TenantProgressCard";
import { renderStatusTag, renderSeverityTag } from "./helpers";

export const TenantShow: React.FC = () => {
  const { id: rawRouteId } = useParams<{ id: string }>();
  const decodedRouteParam = decodeURIComponent(rawRouteId || "");
  const cleanTenantId = decodedRouteParam.split("?")[0].trim();

  const { queryResult } = useShow({
    resource: "tenants",
    id: cleanTenantId || undefined,
  });
  const { data, isLoading, refetch } = queryResult;
  const tenantData = data?.data as any;

  const { list } = useNavigation();
  const { mutate: updateTenant, isLoading: isUpdating } = useUpdate();

  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ username: string; password: string } | null>(null);
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);

  const isPageVisible = usePageVisibility();
  const [metricsIntervalSec, setMetricsIntervalSec] = useState(15);
  const [metricsCountdown, setMetricsCountdown] = useState(15);

  const initialTab = (() => {
    const searchTab = new URLSearchParams(window.location.search).get("tab");
    if (searchTab) return searchTab;
    if (decodedRouteParam.includes("tab=")) {
      const m = decodedRouteParam.match(/tab=([^&]+)/);
      if (m) return m[1];
    }
    return "metrics";
  })();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (metricsIntervalSec === 0 || !isPageVisible) return;
    const timer = setInterval(() => {
      setMetricsCountdown((prev) => (prev <= 1 ? (refetch(), metricsIntervalSec) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [metricsIntervalSec, isPageVisible, refetch]);

  // Live smart auto-polling while tenant lifecycle operation is in progress
  const status = tenantData?.tenant?.status || tenantData?.status;
  const isTransitioning = [
    "PROVISIONING",
    "DELETING",
    "DEPROVISIONING",
    "SUSPENDING",
    "RESUMING",
    "SEEDING",
    "UPGRADING",
  ].includes(status);

  useSmartInterval(
    () => {
      refetch();
    },
    isTransitioning ? 2500 : null,
    {
      maxIdleSeconds: 60,
      backoffFactor: 1.5,
      maxDelay: 10000,
      immediateOnVisible: true,
    }
  );

  if (isLoading || !tenantData) {
    return (
      <Card className="m-6 text-center border-dashed shadow-sm">
        <CardContent className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading tenant configuration & agent telemetry...</p>
        </CardContent>
      </Card>
    );
  }

  const tenant = tenantData.tenant || tenantData;
  const awsTopology = tenantData.aws_topology || {};
  const agent = tenantData.agent || {};
  const accounts = tenantData.accounts || [];
  const incident = tenantData.incident || null;
  const incidentsHistory = tenantData.incidents_history || [];
  const auditLogs = tenantData.audit_logs || [];
  const metrics = tenantData.metrics || {};

  const tenantId = tenant.tenant_id;
  const domain = tenant.domain || `${tenantId}.png261.dev`;
  const currentStatus = tenant.status || "ACTIVE";

  const handleRestartAgent = () => {
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action: "RESTART_AGENT" } },
      {
        onSuccess: () => {
          toast.success(`ECS Agent rolling deployment initiated for ${tenantId}!`);
          refetch();
        },
        onError: (err: any) => toast.error(err?.message || "Failed to restart agent"),
      }
    );
  };

  const handleResetPassword = (username: string) => {
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action: "RESET_TENANT_ACCOUNT_PASSWORD", username } },
      {
        onSuccess: (res: any) => {
          const tempPwd = res?.data?.temporary_password || res?.data?.password || "Tmp_Secret987!";
          setTempPasswordInfo({ username, password: tempPwd });
          setResetPasswordModalVisible(true);
          toast.success(`Password reset generated for '${username}'`);
        },
        onError: (err: any) => toast.error(err?.message || "Failed to reset password"),
      }
    );
  };

  const handleToggleAccountStatus = (username: string, currentAccountStatus: string) => {
    const nextStatus = currentAccountStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action: "UPDATE_TENANT_ACCOUNT", username, status: nextStatus } },
      {
        onSuccess: () => {
          toast.success(`Account '${username}' status changed to ${nextStatus}`);
          refetch();
        },
        onError: (err: any) => toast.error(err?.message || "Failed to update account status"),
      }
    );
  };

  const openIncidentModal = () => {
    setIncidentModalVisible(true);
  };

  const currentApiUrl = dataProvider.getApiUrl();

  return (
    <div className="pb-10 space-y-4" data-api-url={currentApiUrl}>
      <TenantHeader
        tenantId={tenantId}
        domain={domain}
        adminEmail={tenant.admin_email}
        currentStatus={currentStatus}
        progress={tenant.progress}
        currentStep={tenant.current_step}
        isLoading={isLoading}
        isUpdating={isUpdating}
        onBack={() => list("tenants")}
        onRefresh={() => refetch()}
        onOpenIncidentModal={openIncidentModal}
        onRestartAgent={handleRestartAgent}
        onOpenCloneModal={() => setCloneModalVisible(true)}
      />

      <TenantProgressCard
        tenantId={tenantId}
        currentStatus={currentStatus}
        progress={tenant.progress}
        currentStep={tenant.current_step}
      />

      <TenantIncidentAlert
        currentStatus={currentStatus}
        incident={incident}
        lastUpdated={tenant.last_updated}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto p-1 bg-muted/60 text-muted-foreground rounded-lg gap-1">
            <TabsTrigger value="metrics" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <LineChart className="h-3.5 w-3.5 text-primary" />
              <span>Live Metrics & Telemetry</span>
            </TabsTrigger>
            <TabsTrigger value="topology" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Server className="h-3.5 w-3.5" />
              <span>Dedicated Architecture & Topology</span>
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Bot className="h-3.5 w-3.5" />
              <span>Agent Detail & Container Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5" />
              <span>Tenant Accounts Management</span>
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Accidents & Incident History</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Tenant Audit Trail</span>
            </TabsTrigger>
            <TabsTrigger value="terminal" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Terminal className="h-3.5 w-3.5" />
              <span>OCC Terminal & Diagnostics</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <FileText className="h-3.5 w-3.5" />
              <span>Live Container Logs</span>
            </TabsTrigger>
            <TabsTrigger value="observability" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <GitBranch className="h-3.5 w-3.5" />
              <span>Step Functions & X-Ray</span>
            </TabsTrigger>
            <TabsTrigger value="finops" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <span>FinOps & Custom Domain</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <span>Health & Quota Limit</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="metrics" className="focus-visible:outline-none">
          <MetricsTab
            tenantId={tenantId}
            metrics={metrics}
            metricsIntervalSec={metricsIntervalSec}
            metricsCountdown={metricsCountdown}
            setMetricsCountdown={setMetricsCountdown}
            refetch={refetch}
          />
        </TabsContent>

        <TabsContent value="topology" className="focus-visible:outline-none">
          <TopologyTab
            awsTopology={awsTopology}
            tenantId={tenantId}
            domain={domain}
            quotaGb={tenant.quota_gb}
          />
        </TabsContent>

        <TabsContent value="agent" className="focus-visible:outline-none">
          <AgentTab agent={agent} awsTopology={awsTopology} />
        </TabsContent>

        <TabsContent value="accounts" className="focus-visible:outline-none">
          <AccountsTab
            accounts={accounts}
            onAddAccount={() => setCreateAccountModalVisible(true)}
            onResetPassword={handleResetPassword}
            onToggleAccountStatus={handleToggleAccountStatus}
          />
        </TabsContent>

        <TabsContent value="incidents" className="focus-visible:outline-none">
          <IncidentsTab
            currentStatus={currentStatus}
            incident={incident}
            incidentsHistory={incidentsHistory}
            renderStatusTag={renderStatusTag}
            renderSeverityTag={renderSeverityTag}
            onDeclareIncident={openIncidentModal}
          />
        </TabsContent>

        <TabsContent value="audit" className="focus-visible:outline-none">
          <AuditTab auditLogs={auditLogs} tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="terminal" className="focus-visible:outline-none">
          <TerminalTab tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="logs" className="focus-visible:outline-none">
          <LogsTab tenantId={tenantId} awsTopology={awsTopology} />
        </TabsContent>

        <TabsContent value="observability" className="focus-visible:outline-none">
          <ObservabilityTab tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="finops" className="focus-visible:outline-none">
          <FinOpsTab tenantId={tenantId} tenant={tenant} finops={tenantData.finops} />
        </TabsContent>

        <TabsContent value="health" className="focus-visible:outline-none">
          <HealthTab tenantId={tenantId} tenant={tenant} health={tenantData.health} />
        </TabsContent>
      </Tabs>

      <TenantModals
        tenantId={tenantId}
        domain={domain}
        refetch={refetch}
        incidentModalVisible={incidentModalVisible}
        setIncidentModalVisible={setIncidentModalVisible}
        createAccountModalVisible={createAccountModalVisible}
        setCreateAccountModalVisible={setCreateAccountModalVisible}
        resetPasswordModalVisible={resetPasswordModalVisible}
        setResetPasswordModalVisible={setResetPasswordModalVisible}
        tempPasswordInfo={tempPasswordInfo}
        setTempPasswordInfo={setTempPasswordInfo}
        cloneModalVisible={cloneModalVisible}
        setCloneModalVisible={setCloneModalVisible}
        cloneLoading={cloneLoading}
        setCloneLoading={setCloneLoading}
      />
    </div>
  );
};
