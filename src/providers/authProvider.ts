import { AuthProvider } from "@refinedev/core";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "/api";

export interface LoginParams {
  email?: string;
  password?: string;
  challenge_token?: string;
  mfa_code?: string;
}

export const authProvider: AuthProvider = {
  login: async ({
    email,
    password,
    challenge_token,
    mfa_code,
  }: LoginParams) => {
    try {
      // 1. If verifying MFA challenge
      if (challenge_token && mfa_code) {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "VERIFY_MFA",
            challenge_token,
            mfa_code,
          }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          sessionStorage.setItem("saas_admin_token", data.token);
          sessionStorage.setItem(
            "saas_admin_email",
            data.user || email || "admin@png261.dev",
          );
          sessionStorage.setItem("saas_admin_role", data.role || "SuperAdmin");
          return {
            success: true,
            redirectTo: "/tenants",
          };
        }
        return {
          success: false,
          error: {
            name: "MFA Error",
            message: data.error || "Invalid 6-digit TOTP verification code.",
          },
        };
      }

      // 2. Initial email + password login
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

      if (res.ok && data.status === "MFA_REQUIRED") {
        // Return MFA requirement payload to trigger Step 2 in LoginPage
        return {
          success: false,
          error: {
            name: "MFA_REQUIRED",
            message: data.message || "TOTP Code Required",
          },
          // Custom properties passed via error or custom return
          mfaData: {
            challenge_token: data.challenge_token,
            user: data.user,
            role: data.role,
            demo_totp_secret: data.demo_totp_secret,
          },
        } as any;
      }

      if (res.ok && data.token) {
        sessionStorage.setItem("saas_admin_token", data.token);
        sessionStorage.setItem("saas_admin_email", email || "admin@png261.dev");
        sessionStorage.setItem("saas_admin_role", data.role || "SuperAdmin");
        return {
          success: true,
          redirectTo: "/tenants",
        };
      }

      return {
        success: false,
        error: {
          name: "Login Error",
          message: data.error || "Invalid administrative credentials.",
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          name: "Network Error",
          message: err.message || "Could not reach Control Plane API.",
        },
      };
    }
  },

  logout: async () => {
    sessionStorage.removeItem("saas_admin_token");
    sessionStorage.removeItem("saas_admin_email");
    sessionStorage.removeItem("saas_admin_role");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = sessionStorage.getItem("saas_admin_token");
    if (token) {
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      redirectTo: "/login",
      logout: true,
    };
  },

  getPermissions: async () => {
    const role = sessionStorage.getItem("saas_admin_role");
    return role || "SuperAdmin";
  },

  getIdentity: async () => {
    const email = sessionStorage.getItem("saas_admin_email");
    const role = sessionStorage.getItem("saas_admin_role") || "SuperAdmin";
    if (email) {
      return {
        id: email,
        name: email.split("@")[0].toUpperCase(),
        email: email,
        role: role,
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=" + email,
      };
    }
    return null;
  },

  onError: async (error) => {
    if (error?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
        error: {
          name: "Unauthorized",
          message: "Session expired or unauthorized.",
        },
      };
    }
    return { error };
  },
};
