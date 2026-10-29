import React, { useState, useEffect } from "react";
import { useShow, useUpdate, useDelete, useNavigation } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  LineChart,
  Server,
  Users,
  ShieldCheck,
  Heart,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dataProvider } from "../../providers/dataProvider";
import { usePageVisibility } from "../../hooks/usePageVisibility";
import { useSmartInterval } from "../../hooks/useSmartInterval";
import {
  MetricsTab,
  TopologyTab,
  AccountsTab,
  AuditTab,
  HealthTab,
} from "./tabs";
import { TenantModals } from "./modals";
import { TenantHeader } from "./TenantHeader";
import { TenantProgressCard } from "./TenantProgressCard";
import { getTenantAdminEmail } from "./helpers";

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
  const { mutate: deleteTenant, isLoading: isDeleting } = useDelete();

  const [createAccountModalVisible, setCreateAccountModalVisible] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<string | null>(null);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ username: string; password: string } | null>(null);

  const isPageVisible = usePageVisibility();
  const [metricsIntervalSec] = useState(15);
  const [metricsCountdown, setMetricsCountdown] = useState(15);

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
          <p className="text-sm text-muted-foreground">Loading tenant configuration & telemetry...</p>
        </CardContent>
      </Card>
    );
  }

  const tenant = tenantData.tenant || tenantData;
  const awsTopology = tenantData.aws_topology || {};
  const rawAccounts = tenantData.accounts || [];
  const auditLogs = tenantData.audit_logs || [];
  const metrics = tenantData.metrics || {};

  const tenantId = tenant.tenant_id;
  const domain = tenant.domain || `${tenantId}.png261.dev`;
  const currentStatus = tenant.status || "ACTIVE";
  const resolvedAdminEmail = getTenantAdminEmail({ ...tenant, accounts: rawAccounts });

  // Ensure accounts has at least the admin account with the consistent resolved email
  const accounts = rawAccounts.length > 0 ? rawAccounts.map((acc: any) => {
    const isAdm = acc.username === "admin" || acc.role === "TenantAdmin";
    const email = isAdm ? (acc.email || resolvedAdminEmail) : acc.email;
    const pwd = acc.password || (isAdm ? (tenant.default_admin?.password || "StorixAdmin2026!Secure") : undefined);
    return { ...acc, email, password: pwd };
  }) : [
    {
      username: "admin",
      display_name: `${(tenantId || "Tenant").charAt(0).toUpperCase() + (tenantId || "Tenant").slice(1)} Administrator`,
      email: resolvedAdminEmail,
      role: "TenantAdmin",
      password: tenant.default_admin?.password || "StorixAdmin2026!Secure",
      quota_gb: tenant.quota_gb || 100,
      storage_used_gb: 0,
      status: "ACTIVE",
      mfa_enabled: false,
      last_login: "Never",
      created_at: tenant.created_at || new Date().toISOString(),
    }
  ];

  const handleToggleStatus = () => {
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: { action: "SET_STATUS", status: nextStatus },
      },
      {
        onSuccess: () => {
          toast.success(`Tenant '${tenantId}' status updated to ${nextStatus}`);
          refetch();
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to update tenant status"),
      }
    );
  };

  const handleDeleteTenant = () => {
    deleteTenant(
      { resource: "tenants", id: tenantId },
      {
        onSuccess: () => {
          toast.success(`Tenant '${tenantId}' deprovisioning initiated`);
          list("tenants");
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to delete tenant"),
      }
    );
  };

  const handleResetPassword = (username: string) => {
    setResetTargetUser(username);
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

  const currentApiUrl = dataProvider.getApiUrl();

  return (
    <div className="pb-16 space-y-8" data-api-url={currentApiUrl}>
      {/* 1. Header with exactly 2 actions: Suspend & Delete */}
      <TenantHeader
        tenantId={tenantId}
        domain={domain}
        adminEmail={resolvedAdminEmail}
        currentStatus={currentStatus}
        progress={tenant.progress}
        currentStep={tenant.current_step}
        isLoading={isLoading}
        isUpdating={isUpdating || isDeleting}
        onBack={() => list("tenants")}
        onToggleStatus={handleToggleStatus}
        onDeleteTenant={handleDeleteTenant}
      />

      {/* 2. Lifecycle Progress Alert (when provisioning or migrating) */}
      <TenantProgressCard
        tenantId={tenantId}
        currentStatus={currentStatus}
        progress={tenant.progress}
        currentStep={tenant.current_step}
      />

      {/* 3. Section: Live Metrics & Telemetry */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <LineChart className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Live Metrics & Telemetry
          </h2>
        </div>
        <MetricsTab
          tenantId={tenantId}
          metrics={metrics}
          metricsIntervalSec={metricsIntervalSec}
          metricsCountdown={metricsCountdown}
          setMetricsCountdown={setMetricsCountdown}
          refetch={refetch}
        />
      </section>

      {/* 4. Section: Dedicated Architecture & Topology */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <Server className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Dedicated Architecture & Topology
          </h2>
        </div>
        <TopologyTab
          awsTopology={awsTopology}
          tenantId={tenantId}
          domain={domain}
          quotaGb={tenant.quota_gb}
        />
      </section>

      {/* 5. Section: Tenant Accounts Management */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Tenant Accounts Management
          </h2>
        </div>
        <AccountsTab
          accounts={accounts}
          onAddAccount={() => setCreateAccountModalVisible(true)}
          onResetPassword={handleResetPassword}
          onToggleAccountStatus={handleToggleAccountStatus}
        />
      </section>

      {/* 6. Section: Health & Quota Limit */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Health & Quota Limit
          </h2>
        </div>
        <HealthTab tenantId={tenantId} tenant={tenant} health={tenantData.health} />
      </section>

      {/* 7. Section: Tenant Audit Trail */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Tenant Audit Trail
          </h2>
        </div>
        <AuditTab auditLogs={auditLogs} tenantId={tenantId} />
      </section>

      {/* Modals for Account creation & password reset */}
      <TenantModals
        tenantId={tenantId}
        domain={domain}
        refetch={refetch}
        createAccountModalVisible={createAccountModalVisible}
        setCreateAccountModalVisible={setCreateAccountModalVisible}
        resetTargetUser={resetTargetUser}
        setResetTargetUser={setResetTargetUser}
        resetPasswordModalVisible={resetPasswordModalVisible}
        setResetPasswordModalVisible={setResetPasswordModalVisible}
        tempPasswordInfo={tempPasswordInfo}
        setTempPasswordInfo={setTempPasswordInfo}
      />
    </div>
  );
};
