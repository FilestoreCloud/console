import { z } from "zod";

export const TenantStatusEnum = z.enum([
  "ACTIVE",
  "SUSPENDED",
  "INITIALIZING",
  "PROVISIONING",
  "DEPROVISIONING",
  "FAILED",
]);

export const TenantSchema = z.object({
  tenant_id: z
    .string()
    .min(3, "Tenant ID must have at least 3 characters")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Tenant ID must be lowercase alphanumeric with hyphens"),
  domain: z
    .string()
    .min(3)
    .refine((d) => d !== "*", "Bare wildcard '*' is strictly forbidden"),
  status: TenantStatusEnum.default("INITIALIZING"),
  quota_gb: z.coerce.number().positive("Quota must be a positive number"),
  admin_email: z.string().email("Invalid admin email format").optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type TenantModel = z.infer<typeof TenantSchema>;

export const AuditLogSchema = z.object({
  event_id: z.string().uuid().or(z.string().min(1)),
  timestamp: z.string().datetime().or(z.string().min(10)),
  actor: z.string().min(1),
  role: z.string().min(1),
  action: z.string().min(1),
  status: z.enum(["SUCCESS", "DENIED", "FAILED"]),
  target: z.string().optional(),
  details: z.string().optional(),
  ip_address: z.string().optional(),
});

export type AuditLogModel = z.infer<typeof AuditLogSchema>;

export const WebhookConfigSchema = z.object({
  endpoints: z.array(z.string().url("Endpoint must be a valid URL")),
  signing_secret: z.string().min(16, "Secret must be at least 16 characters"),
  enabled_events: z.array(z.string()).min(1, "At least one event must be subscribed"),
  active: z.boolean().default(true),
});

export type WebhookConfigModel = z.infer<typeof WebhookConfigSchema>;
