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
import { Key, Eye, EyeOff, Sparkles } from "lucide-react";

export interface ResetPasswordFormModalProps {
  open: boolean;
  username: string | null;
  onCancel: () => void;
  onSubmit: (username: string, newPassword: string) => void;
  confirmLoading: boolean;
}

export const ResetPasswordFormModal: React.FC<ResetPasswordFormModalProps> = ({
  open,
  username,
  onCancel,
  onSubmit,
  confirmLoading,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setShowPassword(false);
      setError(null);
    }
  }, [open]);

  const handleGenerateRandom = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let rand = "";
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Storix_${rand}!9`;
    setPassword(generated);
    setShowPassword(true);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    if (!password || password.trim().length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    setError(null);
    onSubmit(username, password.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Key className="h-5 w-5 text-amber-500" />
            <span>Reset Password: {username}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reset-new-password" className="text-xs font-semibold">
                New Password *
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateRandom}
                className="h-6 text-[11px] px-2 text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Generate Random</span>
              </Button>
            </div>

            <div className="relative">
              <Input
                id="reset-new-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter new password for user"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="h-9 text-xs pr-10 font-mono"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enter a custom password or click &quot;Generate Random&quot; to auto-generate a secure password.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={confirmLoading}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={confirmLoading || !password}
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {confirmLoading ? "Saving..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
