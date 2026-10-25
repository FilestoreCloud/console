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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GitBranch, Info } from "lucide-react";

export interface CloneModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading: boolean;
  form?: any;
  tenantId: string;
  domain: string;
}

export const CloneModal: React.FC<CloneModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading,
  tenantId,
  domain,
}) => {
  const [targetTenantId, setTargetTenantId] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [quotaGb, setQuotaGb] = useState("50");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTargetTenantId("");
      setTargetDomain("");
      setAdminEmail("");
      setQuotaGb("50");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTenantId) {
      setError("Sandbox tenant ID is required");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(targetTenantId)) {
      setError("Lowercase letters, numbers, and hyphens only");
      return;
    }
    setError(null);
    onSubmit({
      target_tenant_id: targetTenantId,
      target_domain: targetDomain || `${targetTenantId}.png261.dev`,
      admin_email: adminEmail,
      quota_gb: Number(quotaGb) || 50,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <GitBranch className="h-5 w-5 text-purple-500" />
            <span>Fork Tenant to Isolated Staging Sandbox</span>
          </DialogTitle>
        </DialogHeader>

        <Alert variant="info" className="text-xs">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5" />
            <div>
              <AlertTitle className="font-semibold text-xs">
                Multi-Tenant Isolation Guarantees
              </AlertTitle>
              <AlertDescription className="text-xs mt-0.5">
                Cloning &apos;{tenantId}&apos; provisions an isolated staging
                sandbox with dedicated PostgreSQL database
                &apos;nc_&lt;target&gt;&apos;, dedicated S3 prefix, dedicated
                EFS mount path, and container service.
              </AlertDescription>
            </div>
          </div>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground">
              Source Tenant Template
            </Label>
            <div className="mt-1">
              <Badge variant="info" className="text-xs font-mono py-1 px-2.5">
                {tenantId} ({domain})
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="clone-target-id" className="text-xs font-semibold">
              Sandbox Tenant Identifier (Slug) *
            </Label>
            <Input
              id="clone-target-id"
              required
              placeholder="e.g. acme-staging, marvel-sandbox"
              value={targetTenantId}
              onChange={(e) => setTargetTenantId(e.target.value)}
              className="h-9 text-xs"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="clone-target-domain" className="text-xs font-semibold">
              Dedicated Host-Header Ingress Domain
            </Label>
            <Input
              id="clone-target-domain"
              placeholder="e.g. acme-staging.png261.dev"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="clone-admin-email" className="text-xs font-semibold">
              Sandbox Admin Contact Email
            </Label>
            <Input
              id="clone-admin-email"
              type="email"
              placeholder="e.g. admin@acme-staging.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="clone-quota" className="text-xs font-semibold">
              Storage Quota (GB)
            </Label>
            <Input
              id="clone-quota"
              type="number"
              placeholder="50"
              value={quotaGb}
              onChange={(e) => setQuotaGb(e.target.value)}
              className="h-9 text-xs"
            />
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
              className="bg-purple-600 hover:bg-purple-600/90 text-white flex items-center gap-1.5"
            >
              <GitBranch className="h-4 w-4" />
              <span>Provision Staging Sandbox</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
