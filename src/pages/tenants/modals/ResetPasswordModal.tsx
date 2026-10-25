import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  tempPasswordInfo: { username: string; password: string } | null;
  domain?: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  tempPasswordInfo,
  domain,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (tempPasswordInfo?.password) {
      navigator.clipboard.writeText(tempPasswordInfo.password);
      setCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Tenant Account Credentials
          </DialogTitle>
        </DialogHeader>

        <Alert variant="success" className="text-xs mt-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5" />
            <div>
              <AlertTitle className="font-semibold text-xs">
                Credentials Ready &amp; Configured
              </AlertTitle>
              <AlertDescription className="text-xs mt-0.5">
                Password has been generated and securely stored in AWS Secrets
                Manager for this tenant.
              </AlertDescription>
            </div>
          </div>
        </Alert>

        <div className="rounded-lg border divide-y text-xs mt-3">
          <div className="flex justify-between p-3 bg-muted/20">
            <span className="font-medium text-muted-foreground">
              Target Account:
            </span>
            <span className="font-bold text-foreground">
              {tempPasswordInfo?.username}
            </span>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="font-medium text-muted-foreground">
              Account Password:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-[#1652f0]">
                {tempPasswordInfo?.password}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-7 w-7"
                title="Copy password"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {domain && (
            <div className="flex justify-between p-3 bg-muted/20">
              <span className="font-medium text-muted-foreground">
                Nextcloud Portal:
              </span>
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#1652f0] hover:underline"
              >
                https://{domain}
              </a>
            </div>
          )}

          <div className="flex justify-between p-3">
            <span className="font-medium text-muted-foreground">Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Ready for immediate sign-in
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="bg-[#1652f0] hover:bg-[#1652f0]/90 text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
