import React, { useState, useEffect } from "react";
import {
  useList,
  useCreate,
  useUpdate,
  useDelete,
  useCan,
  useNavigation,
} from "@refinedev/core";
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { CreateTenantModal } from "./create-modal";
import { dataProvider } from "../../providers/dataProvider";
import { TenantKpiCards } from "./components/TenantKpiCards";
import { TenantFilterBar } from "./components/TenantFilterBar";
import { TenantTable } from "./components/TenantTable";
import { TenantForkModal } from "./components/TenantForkModal";

export const TenantList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalVisible, setModalVisible] = useState(false);
  const [forkModalVisible, setForkModalVisible] = useState(false);
  const [forkSourceTenant, setForkSourceTenant] = useState<any>(null);
  const [forkLoading, setForkLoading] = useState(false);
  const [forkForm] = Form.useForm();

  const { show } = useNavigation();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useList({ resource: "tenants" });
  const { mutate: createTenant, isLoading: isCreating } = useCreate();
  const { mutate: updateTenant, isLoading: isUpdating } = useUpdate();
  const { mutate: deleteTenant, isLoading: isDeleting } = useDelete();

  const { data: canCreate } = useCan({ resource: "tenants", action: "create" });
  const { data: canDelete } = useCan({ resource: "tenants", action: "delete" });

  const tenants = (data?.data || []) as any[];
  const hasInFlightTenants = tenants.some((t) =>
    [
      "PROVISIONING",
      "DELETING",
      "DEPROVISIONING",
      "SUSPENDING",
      "RESUMING",
      "SEEDING",
      "UPGRADING",
    ].includes(t.status),
  );

  useEffect(() => {
    if (!hasInFlightTenants) return;
    const interval = setInterval(() => refetch(), 2500);
    return () => clearInterval(interval);
  }, [hasInFlightTenants, refetch]);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
  const suspendedTenants = tenants.filter(
    (t) => t.status === "SUSPENDED",
  ).length;
  const totalQuota = tenants.reduce(
    (acc, t) => acc + (parseInt(t.quota_gb) || 0),
    0,
  );

  const filteredTenants = tenants.filter((t) => {
    const s = searchText.toLowerCase();
    const matchesSearch =
      !s ||
      t.tenant_id?.toLowerCase().includes(s) ||
      t.domain?.toLowerCase().includes(s) ||
      t.admin_email?.toLowerCase().includes(s);
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (tenantId: string, currentStatus: string) => {
    const action = currentStatus === "ACTIVE" ? "SUSPEND" : "RESUME";
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action } },
      {
        onSuccess: () => {
          message.success(
            `Tenant ${tenantId} ${action === "SUSPEND" ? "suspended" : "resumed"} successfully!`,
          );
          refetch();
        },
        onError: (err: any) => message.error(err?.message || "Action failed"),
      },
    );
  };

  const handleSeedTenant = (tenantId: string) => {
    updateTenant(
      { resource: "tenants", id: tenantId, values: { action: "SEED" } },
      {
        onSuccess: () => {
          message.success(`Tenant ${tenantId} seeding workflow initiated!`);
          refetch();
        },
        onError: (err: any) => message.error(err?.message || "Seeding failed"),
      },
    );
  };

  const handleDelete = (tenantId: string) => {
    deleteTenant(
      { resource: "tenants", id: tenantId },
      {
        onSuccess: () => {
          message.success(`Tenant ${tenantId} deleted successfully!`);
          refetch();
        },
        onError: (err: any) => message.error(err?.message || "Deletion failed"),
      },
    );
  };

  const handleCreateSubmit = async (values: any) => {
    createTenant(
      {
        resource: "tenants",
        values: {
          tenant_id: values.tenant_id.toLowerCase().trim(),
          domain: values.domain?.trim() || `${values.tenant_id}.png261.dev`,
          admin_email: values.admin_email.trim(),
          quota_gb: values.quota_gb,
          is_demo: !!values.is_demo,
        },
      },
      {
        onSuccess: () => {
          message.success(
            `Tenant ${values.tenant_id} successfully provisioned!`,
          );
          setModalVisible(false);
          refetch();
        },
        onError: (err: any) =>
          message.error(err?.message || "Provisioning failed"),
      },
    );
  };

  const handleOpenForkModal = (record: any) => {
    setForkSourceTenant(record);
    forkForm.setFieldsValue({
      target_tenant_id: `${record.tenant_id}-staging`,
      target_domain: `${record.tenant_id}-staging.png261.dev`,
      admin_email: record.admin_email || `admin@${record.tenant_id}.com`,
      quota_gb: record.quota_gb || 50,
    });
    setForkModalVisible(true);
  };

  const handleForkSubmit = async (values: any) => {
    if (!dataProvider.custom) return;
    setForkLoading(true);
    try {
      const targetId = values.target_tenant_id.toLowerCase().trim();
      await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "CLONE_TENANT",
          source_tenant_id: forkSourceTenant?.tenant_id,
          target_tenant_id: targetId,
          target_domain: values.target_domain?.trim(),
          admin_email: values.admin_email?.trim(),
          quota_gb: values.quota_gb,
        },
      });
      message.success(
        `Tenant '${forkSourceTenant?.tenant_id}' cloned to sandbox '${targetId}'!`,
      );
      setForkModalVisible(false);
      forkForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.message || "Failed to clone tenant");
    } finally {
      setForkLoading(false);
    }
  };

  return (
    <div>
      <TenantKpiCards
        totalTenants={totalTenants}
        activeTenants={activeTenants}
        suspendedTenants={suspendedTenants}
        totalQuota={totalQuota}
      />
      <TenantFilterBar
        searchText={searchText}
        onSearchChange={setSearchText}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => refetch()}
        isLoading={isLoading}
        canCreate={canCreate?.can}
        onOpenCreateModal={() => setModalVisible(true)}
      />
      <TenantTable
        tenants={tenants}
        filteredTenants={filteredTenants}
        isLoading={isLoading}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        canDelete={canDelete}
        onToggleStatus={handleToggleStatus}
        onSeedTenant={handleSeedTenant}
        onDeleteTenant={handleDelete}
        onOpenForkModal={handleOpenForkModal}
        onShowTenant={(tid) => show("tenants", tid)}
        onNavigate={(path) => navigate(path)}
      />
      <CreateTenantModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleCreateSubmit}
        loading={isCreating}
      />
      <TenantForkModal
        visible={forkModalVisible}
        sourceTenant={forkSourceTenant}
        loading={forkLoading}
        form={forkForm}
        onCancel={() => setForkModalVisible(false)}
        onSubmit={handleForkSubmit}
      />
    </div>
  );
};
