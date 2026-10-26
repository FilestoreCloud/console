import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  AlertCircle,
  X,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "/api";

export const LoginPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOGIN",
          username: email,
          password: password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Invalid administrative credentials.");
        return;
      }
      if (data.token || data.status === "OK") {
        localStorage.setItem("saas_admin_token", data.token || "master-session-token");
        localStorage.setItem("saas_admin_email", data.user || email);
        localStorage.setItem("saas_admin_role", data.role || "SuperAdmin");
        window.location.href = "/tenants";
      } else {
        setErrorMessage(data.error || data.message || "Login failed.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to communicate with control plane."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-[440px] shadow-xl border-border bg-card">
        <CardContent className="pt-8 pb-6 px-6">
          <div className="text-center mb-6">
            <img
              src="/storix-logo.png"
              alt="Storix"
              className="h-11 mx-auto mb-3 object-contain"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Storix Super Admin Portal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Storix Multi-Tenant SaaS Control Plane
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-5 flex items-start justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error"
                className="text-destructive hover:opacity-75"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="font-semibold text-foreground">
                Administrator Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="master-password" className="font-semibold text-foreground">
                Master Password / Access Key
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="master-password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Authenticated securely via Account &amp; Password
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold bg-[#1652f0] hover:bg-[#1652f0]/90 text-white mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Sign In to Control Plane"}
            </Button>
          </form>

          <Separator className="my-6" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Secured via AWS IAM &amp; DynamoDB Encryption
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
