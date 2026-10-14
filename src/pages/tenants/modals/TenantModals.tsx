import React from "react";
import { Form, message } from "antd";
import { useUpdate } from "@refinedev/core";
import { dataProvider } from "../../../providers/dataProvider";
import { IncidentModal } from "./IncidentModal";
import { CreateAccountModal } from "./CreateAccountModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { CloneModal } from "./CloneModal";

export interface TenantModalsProps {
  tenantId: string;
  domain: string;
  refetch: () => void;
  incidentModalVisible: boolean;
  setIncidentModalVisible: (v: boolean) => void;
  incidentForm: any;
  createAccountModalVisible: boolean;
  setCreateAccountModalVisible: (v: boolean) => void;
  accountForm: any;
  resetPasswordModalVisible: boolean;
  setResetPasswordModalVisible: (v: boolean) => void;
  tempPasswordInfo: { username: string; password: string } | null;
  cloneModalVisible: boolean;
  setCloneModalVisible: (v: boolean) => void;
  cloneForm: any;
  cloneLoading: boolean;
  setCloneLoading: (v: boolean) => void;
}

export const TenantModals: React.FC<TenantModalsProps> = ({
  tenantId,
  domain,
  refetch,
  incidentModalVisible,
  setIncidentModalVisible,
  incidentForm,
  createAccountModalVisible,
  setCreateAccountModalVisible,
  accountForm,
  resetPasswordModalVisible,
  setResetPasswordModalVisible,
  tempPasswordInfo,
  cloneModalVisible,
  setCloneModalVisible,
  cloneForm,
  cloneLoading,
  setCloneLoading,
}) => {
  const { mutate: updateTenant, isLoading: isUpdating } = useUpdate();

  const handleIncidentSubmit = (values: any) => {
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: { action: "UPDATE_INCIDENT_STATUS", ...values },
      },
      {
        onSuccess: () => {
          message.success(`Incident status updated for tenant ${tenantId}!`);
          setIncidentModalVisible(false);
          incidentForm.resetFields();
          refetch();
        },
        onError: (err: any) => message.error(err?.message || "Failed to update incident"),
      },
    );
  };

  const handleCreateAccount = (values: any) => {
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: { action: "CREATE_TENANT_ACCOUNT", ...values },
      },
      {
        onSuccess: () => {
          message.success(`Account '${values.username}' created successfully!`);
          setCreateAccountModalVisible(false);
          accountForm.resetFields();
          refetch();
        },
        onError: (err: any) => message.error(err?.message || "Failed to create account"),
      },
    );
  };

  const handleCloneTenant = async (values: any) => {
    setCloneLoading(true);
    try {
      const targetId = values.target_tenant_id.toLowerCase().trim();
      await dataProvider.custom({
        url: dataProvider.getApiUrl(),
        method: "post",
        payload: {
          action: "CLONE_TENANT",
          source_tenant_id: tenantId,
          target_tenant_id: targetId,
          target_domain: values.target_domain?.trim(),
          admin_email: values.admin_email?.trim(),
          quota_gb: values.quota_gb,
        },
      });
      message.success(`Tenant '${tenantId}' cloned to staging sandbox '${targetId}'!`);
      setCloneModalVisible(false);
      cloneForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.message || "Failed to clone tenant");
    } finally {
      setCloneLoading(false);
    }
  };

  return (
    <>
      <IncidentModal
        open={incidentModalVisible}
        onCancel={() => setIncidentModalVisible(false)}
        onSubmit={handleIncidentSubmit}
        confirmLoading={isUpdating}
        form={incidentForm}
      />
      <CreateAccountModal
        open={createAccountModalVisible}
        onCancel={() => setCreateAccountModalVisible(false)}
        onSubmit={handleCreateAccount}
        confirmLoading={isUpdating}
        form={accountForm}
      />
      <ResetPasswordModal
        open={resetPasswordModalVisible}
        onClose={() => setResetPasswordModalVisible(false)}
        tempPasswordInfo={tempPasswordInfo}
      />
      <CloneModal
        open={cloneModalVisible}
        onCancel={() => setCloneModalVisible(false)}
        onSubmit={handleCloneTenant}
        loading={cloneLoading}
        form={cloneForm}
        tenantId={tenantId}
        domain={domain}
      />
    </>
  );
};
