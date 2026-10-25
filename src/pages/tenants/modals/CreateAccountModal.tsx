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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

export interface CreateAccountModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  confirmLoading: boolean;
  form?: any;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  open,
  onCancel,
  onSubmit,
  confirmLoading,
}) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [quotaGb, setQuotaGb] = useState("25");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUsername("");
      setDisplayName("");
      setEmail("");
      setPassword("");
      setRole("User");
      setQuotaGb("25");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError("Username is required");
      return;
    }
    if (!displayName) {
      setError("Display name is required");
      return;
    }
    if (!email) {
      setError("Valid email is required");
      return;
    }
    setError(null);
    onSubmit({
      username,
      display_name: displayName,
      email,
      password: password || undefined,
      role,
      quota_gb: Number(quotaGb) || 25,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <span>Create Tenant User Account</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="space-y-1">
            <Label htmlFor="acc-username" className="text-xs font-semibold">
              Username *
            </Label>
            <Input
              id="acc-username"
              required
              placeholder="e.g. john.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="acc-display-name" className="text-xs font-semibold">
              Display Name *
            </Label>
            <Input
              id="acc-display-name"
              required
              placeholder="e.g. John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="acc-email" className="text-xs font-semibold">
              Email Address *
            </Label>
            <Input
              id="acc-email"
              type="email"
              required
              placeholder="e.g. john@tenant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="acc-password" className="text-xs font-semibold">
              Account Password
            </Label>
            <Input
              id="acc-password"
              type="password"
              placeholder="Enter password or leave blank to auto-generate"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank to auto-generate a secure temporary password
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="acc-role" className="text-xs font-semibold">
              Account Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="acc-role" className="h-9 text-xs">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TenantAdmin">Tenant Administrator</SelectItem>
                <SelectItem value="User">Standard User</SelectItem>
                <SelectItem value="ServiceAccount">Service Account / Machine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="acc-quota" className="text-xs font-semibold">
              Storage Quota (GB)
            </Label>
            <Select value={quotaGb} onValueChange={setQuotaGb}>
              <SelectTrigger id="acc-quota" className="h-9 text-xs">
                <SelectValue placeholder="Select quota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 GB</SelectItem>
                <SelectItem value="25">25 GB</SelectItem>
                <SelectItem value="50">50 GB</SelectItem>
                <SelectItem value="100">100 GB</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={confirmLoading}
              className="bg-[#1652f0] hover:bg-[#1652f0]/90 text-white"
            >
              {confirmLoading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
