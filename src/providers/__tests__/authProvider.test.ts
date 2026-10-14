import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { authProvider } from "../authProvider";

describe("authProvider", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("login", () => {
    it("logs in successfully with valid credentials and sets session storage", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: "mock-jwt-token-12345",
          user: "admin@png261.dev",
          role: "SuperAdmin",
        }),
      } as Response);

      const result = await authProvider.login({
        email: "admin@png261.dev",
        password: "SuperSecretPassword123!",
      });

      expect(global.fetch).toHaveBeenCalledWith("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOGIN",
          username: "admin@png261.dev",
          password: "SuperSecretPassword123!",
        }),
      });

      expect(result).toEqual({
        success: true,
        redirectTo: "/tenants",
      });
      expect(sessionStorage.getItem("saas_admin_token")).toBe(
        "mock-jwt-token-12345",
      );
      expect(sessionStorage.getItem("saas_admin_email")).toBe(
        "admin@png261.dev",
      );
      expect(sessionStorage.getItem("saas_admin_role")).toBe("SuperAdmin");
    });

    it("handles MFA_REQUIRED challenge when 2FA is enforced", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "MFA_REQUIRED",
          message: "TOTP Code Required",
          challenge_token: "mfa-challenge-xyz",
          user: "sec-admin@png261.dev",
          role: "SecurityAuditor",
        }),
      } as Response);

      const result: any = await authProvider.login({
        email: "sec-admin@png261.dev",
        password: "ValidPassword123!",
      });

      expect(result.success).toBe(false);
      expect(result.error.name).toBe("MFA_REQUIRED");
      expect(result.mfaData.challenge_token).toBe("mfa-challenge-xyz");
      expect(sessionStorage.getItem("saas_admin_token")).toBeNull();
    });

    it("verifies MFA code successfully and completes login", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: "verified-mfa-token",
          user: "sec-admin@png261.dev",
          role: "TenantOperator",
        }),
      } as Response);

      const result = await authProvider.login({
        challenge_token: "mfa-challenge-xyz",
        mfa_code: "123456",
      });

      expect(global.fetch).toHaveBeenCalledWith("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_MFA",
          challenge_token: "mfa-challenge-xyz",
          mfa_code: "123456",
        }),
      });

      expect(result).toEqual({
        success: true,
        redirectTo: "/tenants",
      });
      expect(sessionStorage.getItem("saas_admin_token")).toBe(
        "verified-mfa-token",
      );
      expect(sessionStorage.getItem("saas_admin_role")).toBe("TenantOperator");
    });

    it("returns error on invalid MFA verification code", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "Invalid TOTP code supplied",
        }),
      } as Response);

      const result = await authProvider.login({
        challenge_token: "mfa-challenge-xyz",
        mfa_code: "000000",
      });

      expect(result).toEqual({
        success: false,
        error: {
          name: "MFA Error",
          message: "Invalid TOTP code supplied",
        },
      });
      expect(sessionStorage.getItem("saas_admin_token")).toBeNull();
    });

    it("returns error on invalid administrative credentials", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "Invalid username or password",
        }),
      } as Response);

      const result = await authProvider.login({
        email: "bad@example.com",
        password: "wrong",
      });

      expect(result.success).toBe(false);
      expect(result.error.name).toBe("Login Error");
      expect(result.error.message).toBe("Invalid username or password");
    });

    it("handles network failure gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

      const result = await authProvider.login({
        email: "admin@png261.dev",
        password: "pwd",
      });

      expect(result.success).toBe(false);
      expect(result.error.name).toBe("Network Error");
      expect(result.error.message).toBe("Connection refused");
    });
  });

  describe("logout", () => {
    it("clears all session storage tokens and redirects to /login", async () => {
      sessionStorage.setItem("saas_admin_token", "test-token");
      sessionStorage.setItem("saas_admin_email", "admin@example.com");
      sessionStorage.setItem("saas_admin_role", "SuperAdmin");

      const result = await authProvider.logout({});

      expect(sessionStorage.getItem("saas_admin_token")).toBeNull();
      expect(sessionStorage.getItem("saas_admin_email")).toBeNull();
      expect(sessionStorage.getItem("saas_admin_role")).toBeNull();
      expect(result).toEqual({
        success: true,
        redirectTo: "/login",
      });
    });
  });

  describe("check", () => {
    it("returns authenticated: true when token is present", async () => {
      sessionStorage.setItem("saas_admin_token", "valid-token");
      const result = await authProvider.check();
      expect(result).toEqual({ authenticated: true });
    });

    it("returns authenticated: false and redirects when token is absent", async () => {
      const result = await authProvider.check();
      expect(result).toEqual({
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      });
    });
  });

  describe("getPermissions", () => {
    it("returns stored role from sessionStorage", async () => {
      sessionStorage.setItem("saas_admin_role", "TenantOperator");
      const role = await authProvider.getPermissions!();
      expect(role).toBe("TenantOperator");
    });

    it("falls back to SecurityAuditor when role is not stored", async () => {
      const role = await authProvider.getPermissions!();
      expect(role).toBe("SecurityAuditor");
    });
  });

  describe("getIdentity", () => {
    it("returns identity object with formatted name and dicebear avatar", async () => {
      sessionStorage.setItem("saas_admin_email", "jane.doe@enterprise.io");
      sessionStorage.setItem("saas_admin_role", "TenantOperator");

      const identity = await authProvider.getIdentity!();
      expect(identity).toEqual({
        id: "jane.doe@enterprise.io",
        name: "JANE.DOE",
        email: "jane.doe@enterprise.io",
        role: "TenantOperator",
        avatar:
          "https://api.dicebear.com/7.x/identicon/svg?seed=jane.doe@enterprise.io",
      });
    });

    it("returns null if user email is not set", async () => {
      const identity = await authProvider.getIdentity!();
      expect(identity).toBeNull();
    });
  });

  describe("onError", () => {
    it("forces logout and redirection on 401 status", async () => {
      const result = await authProvider.onError!({ status: 401 });
      expect(result).toEqual({
        logout: true,
        redirectTo: "/login",
        error: {
          name: "Unauthorized",
          message: "Session expired or unauthorized.",
        },
      });
    });

    it("passes through non-401 errors", async () => {
      const error = { status: 500, message: "Internal Server Error" };
      const result = await authProvider.onError!(error);
      expect(result).toEqual({ error });
    });
  });
});
