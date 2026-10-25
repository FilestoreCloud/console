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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Rocket, Info, Sparkles } from "lucide-react";

interface CreateTenantModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [tenantId, setTenantId] = useState("");
  const [domain, setDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [quotaGb, setQuotaGb] = useState("100");
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTenantId("");
      setDomain("");
      setAdminEmail("");
      setQuotaGb("100");
      setIsDemo(false);
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
    setError(null);
    await onSubmit({
      tenant_id: tenantId,
      domain: domain || `${tenantId}.png261.dev`,
      admin_email: adminEmail,
      quota_gb: Number(quotaGb) || 100,
      is_demo: isDemo,
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
            <Label htmlFor="create-quota" className="text-xs font-semibold">
              Storage Quota (GB) *
            </Label>
            <div className="flex">
              <Input
                id="create-quota"
                type="number"
                min={10}
                max={5000}
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
          </div>

          <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Provision Mode: Demo Tenant (Auto-Seed Showcase Data)</span>
              </div>
              <Switch checked={isDemo} onCheckedChange={setIsDemo} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              When enabled, runs the dedicated Tenant Seeding Step Function immediately after infrastructure provisioning completes.
            </p>
          </div>

          <Alert variant="info" className="text-xs">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <div>
                <AlertTitle className="font-semibold text-xs">
                  AWS Multi-Tenant Isolation
                </AlertTitle>
                <AlertDescription className="text-xs mt-0.5">
                  Provisions dedicated ECS Fargate task, dedicated database schema in RDS PostgreSQL, dedicated EFS configuration access point, and registers instance in DynamoDB.
                </AlertDescription>
              </div>
            </div>
          </Alert>

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
