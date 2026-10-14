import { describe, it, expect, beforeEach } from "vitest";
import { accessControlProvider } from "../accessControlProvider";

describe("accessControlProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe("SuperAdmin role", () => {
    beforeEach(() => {
      sessionStorage.setItem("saas_admin_role", "SuperAdmin");
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

  describe("TenantOperator role", () => {
    beforeEach(() => {
      sessionStorage.setItem("saas_admin_role", "TenantOperator");
    });

    it("prohibits destructive deletion on tenants", async () => {
      const result = await accessControlProvider.can({
        resource: "tenants",
        action: "delete",
      });
      expect(result.can).toBe(false);
      expect(result.reason).toContain(
        "Destructive deletion requires the 'SuperAdmin' role",
      );
    });

    it("allows non-destructive operations on tenants", async () => {
      expect(
        await accessControlProvider.can({
          resource: "tenants",
          action: "list",
        }),
      ).toEqual({ can: true });
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
          action: "show",
        }),
      ).toEqual({ can: true });
    });

    it("allows operations on other operational resources", async () => {
      expect(
        await accessControlProvider.can({
          resource: "telemetry",
          action: "show",
        }),
      ).toEqual({ can: true });
    });
  });

  describe("SecurityAuditor role", () => {
    beforeEach(() => {
      sessionStorage.setItem("saas_admin_role", "SecurityAuditor");
    });

    it("allows strictly read-only actions (list, show, export)", async () => {
      expect(
        await accessControlProvider.can({
          resource: "tenants",
          action: "list",
        }),
      ).toEqual({ can: true });
      expect(
        await accessControlProvider.can({
          resource: "tenants",
          action: "show",
        }),
      ).toEqual({ can: true });
      expect(
        await accessControlProvider.can({
          resource: "audit-logs",
          action: "export",
        }),
      ).toEqual({ can: true });
    });

    it("prohibits all mutation actions (create, edit, delete)", async () => {
      const deleteResult = await accessControlProvider.can({
        resource: "tenants",
        action: "delete",
      });
      expect(deleteResult.can).toBe(false);
      expect(deleteResult.reason).toContain(
        "Compliance policy: 'SecurityAuditor' role has read-only access",
      );

      const createResult = await accessControlProvider.can({
        resource: "tenants",
        action: "create",
      });
      expect(createResult.can).toBe(false);

      const editResult = await accessControlProvider.can({
        resource: "tenants",
        action: "edit",
      });
      expect(editResult.can).toBe(false);
    });
  });

  describe("Default / fallback role", () => {
    it("defaults to SecurityAuditor role when no role is in session storage", async () => {
      const result = await accessControlProvider.can({
        resource: "tenants",
        action: "delete",
      });
      expect(result.can).toBe(false);
      expect(result.reason).toContain("SecurityAuditor");
    });

    it("rejects unauthorized roles", async () => {
      sessionStorage.setItem("saas_admin_role", "UnknownGuest");
      const result = await accessControlProvider.can({
        resource: "tenants",
        action: "list",
      });
      expect(result.can).toBe(false);
      expect(result.reason).toBe("Unauthorized role.");
    });
  });
});
