import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { dataProvider } from "../dataProvider";

describe("dataProvider", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getList", () => {
    it("fetches tenants and maps tenant_id to id", async () => {
      localStorage.setItem("saas_admin_token", "admin-token-xyz");

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          tenants: [
            { tenant_id: "alpha", status: "HEALTHY", plan: "ENTERPRISE" },
            { tenant_id: "beta", status: "DEGRADED", plan: "PRO" },
          ],
        }),
      } as Response);

      const result = await dataProvider.getList({ resource: "tenants" });

      expect(global.fetch).toHaveBeenCalledWith("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer admin-token-xyz",
        },
        body: JSON.stringify({ action: "LIST" }),
      });

      expect(result.total).toBe(2);
      expect(result.data).toEqual([
        {
          id: "alpha",
          tenant_id: "alpha",
          status: "HEALTHY",
          plan: "ENTERPRISE",
        },
        { id: "beta", tenant_id: "beta", status: "DEGRADED", plan: "PRO" },
      ]);
    });

    it("fetches audit-logs and maps event_id to id", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          audit_logs: [
            { event_id: "evt-01", action: "PROVISION", user: "admin@corp.io" },
            { action: "CLONE", user: "ops@corp.io" },
          ],
        }),
      } as Response);

      const result = await dataProvider.getList({ resource: "audit-logs" });

      expect(result.total).toBe(2);
      expect(result.data[0].id).toBe("evt-01");
      expect(result.data[1].id).toBe("log-1");
    });

    it("throws 401 when unauthenticated", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
      } as Response);

      await expect(
        dataProvider.getList({ resource: "tenants" }),
      ).rejects.toEqual({
        status: 401,
        message: "Unauthorized",
      });
    });

    it("returns empty list for unknown resources", async () => {
      const result = await dataProvider.getList({ resource: "unknown-items" });
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe("getOne", () => {
    it("fetches tenant detail and sanitizes tenant_id", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          tenant: {
            tenant_id: "tenant-acme",
            name: "ACME Corp",
            status: "ACTIVE",
          },
          aws_topology: { ecs_cluster: "prod-cluster" },
          agent: { version: "2.0.0" },
        }),
      } as Response);

      const result = await dataProvider.getOne({
        resource: "tenants",
        id: "tenant-acme?tab=logs",
      });

      expect(global.fetch).toHaveBeenCalledWith("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "GET_TENANT_DETAIL",
          tenant_id: "tenant-acme",
        }),
      });

      expect(result.data.id).toBe("tenant-acme");
      expect(result.data.aws_topology.ecs_cluster).toBe("prod-cluster");
    });

    it("throws error when getOne fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 404,
        ok: false,
        json: async () => ({ error: "Tenant not found" }),
      } as Response);

      await expect(
        dataProvider.getOne({ resource: "tenants", id: "missing-tenant" }),
      ).rejects.toThrow("Tenant not found");
    });
  });

  describe("create", () => {
    it("provisions a new tenant successfully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          success: true,
          tenant_id: "new-corp",
          status: "PROVISIONING",
        }),
      } as Response);

      const result = await dataProvider.create({
        resource: "tenants",
        variables: { tenant_id: "new-corp", plan: "ENTERPRISE" },
      });

      expect(global.fetch).toHaveBeenCalledWith("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "PROVISION",
          tenant_id: "new-corp",
          plan: "ENTERPRISE",
        }),
      });

      expect(result.data.id).toBe("new-corp");
      expect(result.data.status).toBe("PROVISIONING");
    });

    it("throws error when provisioning fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 400,
        ok: false,
        json: async () => ({ error: "Tenant ID already exists" }),
      } as Response);

      await expect(
        dataProvider.create({
          resource: "tenants",
          variables: { tenant_id: "existing-corp" },
        }),
      ).rejects.toThrow("Tenant ID already exists");
    });
  });

  describe("update", () => {
    it("updates tenant state with custom action", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true, status: "SUSPENDED" }),
      } as Response);

      const result = await dataProvider.update({
        resource: "tenants",
        id: "corp-a",
        variables: { action: "SUSPEND" },
      });

      expect(global.fetch).toHaveBeenCalledWith("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "SUSPEND",
          tenant_id: "corp-a",
        }),
      });

      expect(result.data.id).toBe("corp-a");
      expect(result.data.status).toBe("SUSPENDED");
    });
  });

  describe("deleteOne", () => {
    it("deletes tenant successfully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true, deleted: true }),
      } as Response);

      const result = await dataProvider.deleteOne({
        resource: "tenants",
        id: "deleting-tenant",
      });

      expect(global.fetch).toHaveBeenCalledWith("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "DELETE",
          tenant_id: "deleting-tenant",
        }),
      });

      expect(result.data.id).toBe("deleting-tenant");
    });
  });

  describe("custom and helpers", () => {
    it("executes custom payload actions like clone or occ command", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ exit_code: 0, output: "Storix platform is healthy" }),
      } as Response);

      const result = await dataProvider.custom!({
        url: "/api",
        method: "post",
        payload: { action: "EXEC_OCC", command: "status" },
      });

      expect(result.data).toEqual({
        exit_code: 0,
        output: "Storix platform is healthy",
      });
    });

    it("returns correct API URL", () => {
      expect(dataProvider.getApiUrl()).toBe("/api");
    });
  });
});
