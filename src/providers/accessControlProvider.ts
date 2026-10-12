import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const role = sessionStorage.getItem("saas_admin_role") || "SecurityAuditor";

    // 1. SuperAdmin: Full access to all resources and mutations
    if (role === "SuperAdmin") {
      return { can: true };
    }

    // 2. TenantOperator: Operational fleet control, but DELETE is prohibited
    if (role === "TenantOperator") {
      if (resource === "tenants" && action === "delete") {
        return {
          can: false,
          reason: "Destructive deletion requires the 'SuperAdmin' role.",
        };
      }
      return { can: true };
    }

    // 3. SecurityAuditor: Strictly read-only; all mutations prohibited
    if (role === "SecurityAuditor") {
      if (action === "list" || action === "show" || action === "export") {
        return { can: true };
      }
      return {
        can: false,
        reason:
          "Compliance policy: 'SecurityAuditor' role has read-only access.",
      };
    }

    return { can: false, reason: "Unauthorized role." };
  },
};
