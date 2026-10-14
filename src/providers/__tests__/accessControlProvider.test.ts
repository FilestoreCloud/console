import { describe, it, expect, beforeEach } from "vitest";
import { accessControlProvider } from "../accessControlProvider";

describe("accessControlProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("SuperAdmin role", () => {
    beforeEach(() => {
      localStorage.setItem("saas_admin_role", "SuperAdmin");
    });

    it("allows full access to tenants creation, editing, and deletion", async () => {
      expect(
        await accessControlProvider.can({
          resource: "tenants",
          action: "create",
        }),
      ).toEqual({ can: true });
      expect(
        await accessControlProvider.can({
          resource: "tenants",
          action: "edit",
        }),
      ).toEqual({ can: true });
      expect(
        await accessControlProvider.can({
          resource: "tenants",
          action: "delete",
        }),
      ).toEqual({ can: true });
      expect(
        await accessControlProvider.can({
          resource: "tenants",
          action: "list",
        }),
      ).toEqual({ can: true });
    });

    it("allows access to any custom resources and actions", async () => {
      expect(
        await accessControlProvider.can({
          resource: "audit-logs",
          action: "list",
        }),
      ).toEqual({ can: true });
      expect(
        await accessControlProvider.can({
          resource: "settings",
          action: "update",
        }),
      ).toEqual({ can: true });
    });
  });

  describe("Non-SuperAdmin and missing roles", () => {
    it("rejects when no role is in session storage", async () => {
      const result = await accessControlProvider.can({
        resource: "tenants",
        action: "list",
      });
      expect(result.can).toBe(false);
      expect(result.reason).toBe(
        "Unauthorized: 'SuperAdmin' role is required.",
      );
    });

    it("rejects unauthorized roles", async () => {
      localStorage.setItem("saas_admin_role", "Guest");
      const result = await accessControlProvider.can({
        resource: "tenants",
        action: "list",
      });
      expect(result.can).toBe(false);
      expect(result.reason).toBe(
        "Unauthorized: 'SuperAdmin' role is required.",
      );
    });

    it("rejects deprecated roles (TenantOperator, SecurityAuditor)", async () => {
      localStorage.setItem("saas_admin_role", "TenantOperator");
      const opsResult = await accessControlProvider.can({
        resource: "tenants",
        action: "list",
      });
      expect(opsResult.can).toBe(false);
      expect(opsResult.reason).toBe(
        "Unauthorized: 'SuperAdmin' role is required.",
      );

      localStorage.setItem("saas_admin_role", "SecurityAuditor");
      const auditResult = await accessControlProvider.can({
        resource: "tenants",
        action: "list",
      });
      expect(auditResult.can).toBe(false);
      expect(auditResult.reason).toBe(
        "Unauthorized: 'SuperAdmin' role is required.",
      );
    });
  });
});
