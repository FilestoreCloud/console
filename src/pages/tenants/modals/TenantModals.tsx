import React from "react";
import { useUpdate } from "@refinedev/core";
import { toast } from "sonner";
import { CreateAccountModal } from "./CreateAccountModal";
import { ResetPasswordModal } from "./ResetPasswordModal";

export interface TenantModalsProps {
  tenantId: string;
  domain: string;
  refetch: () => void;
  createAccountModalVisible: boolean;
  setCreateAccountModalVisible: (v: boolean) => void;
  resetPasswordModalVisible: boolean;
  setResetPasswordModalVisible: (v: boolean) => void;
  tempPasswordInfo: { username: string; password: string } | null;
  setTempPasswordInfo: (v: { username: string; password: string } | null) => void;
}

export const TenantModals: React.FC<TenantModalsProps> = ({
  tenantId,
  domain,
  refetch,
  createAccountModalVisible,
  setCreateAccountModalVisible,
  resetPasswordModalVisible,
  setResetPasswordModalVisible,
  tempPasswordInfo,
  setTempPasswordInfo,
}) => {
  const { mutate: updateTenant, isLoading: isUpdating } = useUpdate();

  const handleCreateAccount = (values: any) => {
    updateTenant(
      {
        resource: "tenants",
        id: tenantId,
        values: {
          action: "CREATE_TENANT_ACCOUNT",
          username: values.username,
          display_name: values.display_name,
          email: values.email,
          role: values.role,
          password: values.password,
          quota_gb: values.quota_gb,
        },
      },
      {
        onSuccess: (res: any) => {
          toast.success(`Account '${values.username}' created successfully!`);
          setCreateAccountModalVisible(false);
          const pwd =
            res?.data?.temporary_password ||
            res?.data?.password ||
            values.password;
          if (pwd) {
            setTempPasswordInfo({ username: values.username, password: pwd });
            setResetPasswordModalVisible(true);
          }
          refetch();
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to create account"),
      }
    );
  };

  return (
    <>
      <CreateAccountModal
        open={createAccountModalVisible}
        onCancel={() => setCreateAccountModalVisible(false)}
        onSubmit={handleCreateAccount}
        confirmLoading={isUpdating}
      />
      <ResetPasswordModal
        open={resetPasswordModalVisible}
        onClose={() => setResetPasswordModalVisible(false)}
        tempPasswordInfo={tempPasswordInfo}
        domain={domain}
      />
    </>
  );
};
