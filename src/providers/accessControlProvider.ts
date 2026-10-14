import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  can: async () => {
    const role = sessionStorage.getItem("saas_admin_role");

    // Only SuperAdmin is authorized
    if (role === "SuperAdmin") {
      return { can: true };
    }

    return {
      can: false,
      reason: "Unauthorized: 'SuperAdmin' role is required.",
    };
  },
};
