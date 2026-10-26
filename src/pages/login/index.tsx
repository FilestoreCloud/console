import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
  Key,
  AlertCircle,
  X,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "/api";

export const LoginPage: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  // Step 2 MFA Challenge State
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [pendingMfa, setPendingMfa] = useState<{
    challenge_token: string;
    user: string;
    role: string;
  } | null>(null);
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
      if (data.status === "MFA_REQUIRED") {
        setPendingMfa({
          challenge_token: data.challenge_token,
          user: data.user,
          role: data.role,
        });
        setStep("mfa");
        setMfaCode("");
      } else if (data.token) {
        localStorage.setItem("saas_admin_token", data.token);
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

  const handlePasskeySignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        setErrorMessage("WebAuthn / Passkeys is not supported on this browser.");
        return;
      }
      const challengeRes = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "WEBAUTHN_CHALLENGE" }),
      });
      const challengeData = await challengeRes.json();
      if (!challengeRes.ok || !challengeData.challenge) {
        throw new Error(
          challengeData.error || "Could not initiate Passkey authentication."
        );
      }

      // Convert challenge base64 to Uint8Array
      const challengeBytes = Uint8Array.from(
        atob(challengeData.challenge),
        (c) => c.charCodeAt(0)
      );
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: challengeBytes,
          timeout: 60000,
          userVerification: "preferred",
          rpId: window.location.hostname || "localhost",
        },
      })) as any;

      if (!credential) {
        throw new Error("No Passkey credentials received.");
      }

      const verifyRes = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "WEBAUTHN_LOGIN",
          credential_id: credential.id,
          raw_id: credential.id,
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.token) {
        localStorage.setItem("saas_admin_token", verifyData.token);
        localStorage.setItem("saas_admin_email", verifyData.user || "admin@storix.io");
        localStorage.setItem("saas_admin_role", verifyData.role || "SuperAdmin");
        window.location.href = "/tenants";
      } else {
        setErrorMessage(verifyData.error || "Passkey verification failed.");
      }
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        setErrorMessage(
          err.message || "Passkey authentication encountered an error."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingMfa) return;
    setErrorMessage(null);
    login(
      {
        challenge_token: pendingMfa.challenge_token,
        mfa_code: mfaCode,
        email: pendingMfa.user,
      },
      {
        onError: (err: any) => {
          setErrorMessage(err?.message || "Invalid 6-digit verification code.");
        },
      }
    );
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

          {step === "credentials" ? (
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
                  Authenticated securely via AWS Cognito User Pool
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold bg-[#1652f0] hover:bg-[#1652f0]/90 text-white mt-2"
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting
                  ? "Authenticating..."
                  : "Sign In to Control Plane"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 font-medium flex items-center justify-center gap-2"
                onClick={handlePasskeySignIn}
                disabled={isSubmitting}
              >
                <Key className="h-4 w-4" />
                <span>Sign In with Passkey / WebAuthn</span>
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <Badge
                  variant="info"
                  className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Two-Factor Authentication</span>
                </Badge>
                <h2 className="text-lg font-semibold mt-3 text-foreground">
                  Enter Verification Code
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  A 6-digit verification code has been sent to{" "}
                  <strong>
                    {pendingMfa?.user || "nhphuong.code@gmail.com"}
                  </strong>
                  . Please check your email inbox and enter the code below.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mfa-code" className="font-semibold text-foreground">
                  6-Digit Verification Code
                </Label>
                <Input
                  id="mfa-code"
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="h-12 text-center tracking-[0.3em] font-mono text-xl font-bold"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold bg-[#1652f0] hover:bg-[#1652f0]/90 text-white mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Complete Sign In"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-9 flex items-center justify-center gap-2"
                onClick={() => setStep("credentials")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Credentials</span>
              </Button>
            </form>
          )}

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
