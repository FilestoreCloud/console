import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rocket } from "lucide-react";

interface CreateTenantModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
}

const MAX_STORAGE_QUOTA_GB = 5000;

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [tenantId, setTenantId] = useState("");
  const [domain, setDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [quotaGb, setQuotaGb] = useState("100");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTenantId("");
      setDomain("");
      setAdminEmail("");
      setAdminPassword("");
      setQuotaGb("100");
      setError(null);
    }
  }, [visible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      setError("Please input tenant slug");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(tenantId)) {
      setError("Lowercase letters, numbers, and hyphens only");
      return;
    }
    if (!adminEmail) {
      setError("Please enter tenant admin email");
      return;
    }

    const quotaNum = Number(quotaGb) || 100;
    if (quotaNum < 10) {
      setError("Minimum storage quota is 10 GB");
      return;
    }
    if (quotaNum > MAX_STORAGE_QUOTA_GB) {
      setError(`Maximum storage quota allowed is ${MAX_STORAGE_QUOTA_GB} GB`);
      return;
    }

    setError(null);
    await onSubmit({
      tenant_id: tenantId,
      domain: domain || `${tenantId}.png261.dev`,
      admin_email: adminEmail,
      admin_password: adminPassword.trim() || undefined,
      quota_gb: quotaNum,
    });
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Rocket className="h-5 w-5 text-[#1652f0]" />
            <span>Provision Dedicated Tenant</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <div className="space-y-1">
            <Label htmlFor="create-tenant-id" className="text-xs font-semibold">
              Tenant Identifier (Slug) *
            </Label>
            <Input
              id="create-tenant-id"
              required
              placeholder="e.g. acme-corp"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Unique identifier used for ECS task service and DynamoDB partition key.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="create-domain" className="text-xs font-semibold">
              Custom Ingress Domain
            </Label>
            <Input
              id="create-domain"
              placeholder="acme.png261.dev"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank to default to [tenant-id].png261.dev
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="create-admin-email" className="text-xs font-semibold">
              Tenant Admin Email *
            </Label>
            <Input
              id="create-admin-email"
              type="email"
              required
              placeholder="admin@acme.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="create-admin-password" className="text-xs font-semibold">
              Default Admin Password (Optional)
            </Label>
            <Input
              id="create-admin-password"
              type="password"
              placeholder="Leave blank to use default (StorixAdmin2026!Secure)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              User <strong>admin</strong> is automatically created in Nextcloud. The web installer is permanently disabled.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="create-quota" className="text-xs font-semibold">
                Storage Quota (GB) *
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Max Quota: <strong>{MAX_STORAGE_QUOTA_GB.toLocaleString()} GB (5 TB)</strong>
              </span>
            </div>
            <div className="flex">
              <Input
                id="create-quota"
                type="number"
                min={10}
                max={MAX_STORAGE_QUOTA_GB}
                required
                placeholder="100"
                value={quotaGb}
                onChange={(e) => setQuotaGb(e.target.value)}
                className="rounded-r-none h-9 text-xs"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-xs text-muted-foreground">
                GB
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Configure initial storage limit (Min: 10 GB, Max: {MAX_STORAGE_QUOTA_GB.toLocaleString()} GB).
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-[#1652f0] hover:bg-[#1652f0]/90 text-white flex items-center gap-1.5"
            >
              <Rocket className="h-4 w-4" />
              <span>Launch Tenant Instance</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
