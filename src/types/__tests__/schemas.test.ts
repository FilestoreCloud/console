import { describe, it, expect } from "vitest";
import {
  TenantSchema,
  AuditLogSchema,
  WebhookConfigSchema,
} from "../schemas";

describe("Runtime API Contracts & Zod Schema Validation", () => {
  it("validates well-formed tenant records cleanly", () => {
    const rawTenant = {
      tenant_id: "acme-corp",
      domain: "acme.storix.io",
      status: "ACTIVE",
      quota_gb: "250", // Coerced to number
      admin_email: "admin@acme.com",
    };

    const parsed = TenantSchema.parse(rawTenant);
    expect(parsed.tenant_id).toBe("acme-corp");
    expect(parsed.quota_gb).toBe(250);
    expect(parsed.status).toBe("ACTIVE");
  });

  it("strictly rejects bare wildcard '*' domain in tenant payload", () => {
    const invalidTenant = {
      tenant_id: "malicious-tenant",
      domain: "*",
      quota_gb: 50,
    };

    expect(() => TenantSchema.parse(invalidTenant)).toThrow(
      /Bare wildcard '\*' is strictly forbidden/
    );
  });

  it("strictly rejects negative or non-positive quotas", () => {
    const invalidTenant = {
      tenant_id: "tenant-neg",
      domain: "neg.storix.io",
      quota_gb: -10,
    };

    expect(() => TenantSchema.parse(invalidTenant)).toThrow(
      /Quota must be a positive number/
    );
  });

  it("validates immutable audit log schema and flags missing required fields", () => {
    const validLog = {
      event_id: "123e4567-e89b-12d3-a456-426614174000",
      timestamp: "2026-10-16T10:00:00.000Z",
      actor: "admin@storix.io",
      role: "SuperAdmin",
      action: "PROVISION_TENANT",
      status: "SUCCESS" as const,
    };

    expect(AuditLogSchema.parse(validLog).actor).toBe("admin@storix.io");

    const invalidLog = {
      event_id: "123",
      timestamp: "2026-10-16T10:00:00.000Z",
      actor: "admin",
      // missing role and action
      status: "SUCCESS",
    };

    expect(() => AuditLogSchema.parse(invalidLog)).toThrow();
  });

  it("validates webhook endpoints require valid URLs and strong signing secret", () => {
    const validWebhook = {
      endpoints: ["https://hooks.slack.com/services/T00/B00/X00"],
      signing_secret: "super-secure-webhook-secret-at-least-16-chars",
      enabled_events: ["tenant.provisioned", "incident.alert"],
    };

    expect(WebhookConfigSchema.parse(validWebhook).active).toBe(true);

    const invalidWebhook = {
      endpoints: ["not-a-valid-url"],
      signing_secret: "short",
      enabled_events: [],
    };

    expect(() => WebhookConfigSchema.parse(invalidWebhook)).toThrow();
  });
});
