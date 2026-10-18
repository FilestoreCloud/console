import { DataProvider } from "@refinedev/core";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "/api";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("saas_admin_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const dataProvider: DataProvider = {
  getList: async ({ resource }) => {
    if (resource === "tenants") {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ action: "LIST" }),
      });
      if (res.status === 401) throw { status: 401, message: "Unauthorized" };
      const data = await res.json();
      const rawTenants = data.tenants || data.items || data.data || [];
      const tenants = rawTenants.map((t: any) => ({
        id: t.tenant_id,
        ...t,
      }));
      return {
        data: tenants,
        total: data.total || data.count || tenants.length,
      };
    }

    if (resource === "audit-logs") {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ action: "AUDIT_LOGS" }),
      });
      if (res.status === 401) throw { status: 401, message: "Unauthorized" };
      const data = await res.json();
      const logs = (data.audit_logs || []).map((l: any, idx: number) => ({
        id: l.event_id || `log-${idx}`,
        ...l,
      }));
      return {
        data: logs,
        total: logs.length,
      };
    }

    return { data: [], total: 0 };
  },

  getOne: async ({ resource, id }) => {
    if (resource === "tenants") {
      const decodedId = decodeURIComponent(String(id || ""));
      const cleanId = decodedId.split("?")[0].trim();
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({
          action: "GET_TENANT_DETAIL",
          tenant_id: cleanId,
        }),
      });
      if (res.status === 401) throw { status: 401, message: "Unauthorized" };
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load tenant details");
      }
      return {
        data: {
          id: data.tenant?.tenant_id || id,
          ...data.tenant,
          aws_topology: data.aws_topology,
          agent: data.agent,
          accounts: data.accounts,
          incident: data.incident,
          incidents_history: data.incidents_history,
          audit_logs: data.audit_logs,
          metrics: data.metrics,
        },
      } as any;
    }
    return { data: null } as any;
  },

  create: async ({ resource, variables }) => {
    if (resource === "tenants") {
      const isDemo = (variables as any).is_demo;
      const action = (variables as any).action || (isDemo ? "PROVISION_DEMO" : "PROVISION");
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({
          action,
          ...variables,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Provisioning failed");
      }
      return {
        data: { id: (variables as any).tenant_id, ...data },
      };
    }
    return { data: variables } as any;
  },

  update: async ({ resource, id, variables }) => {
    if (resource === "tenants") {
      const { action = "SUSPEND", ...rest } = variables as any;
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({
          action,
          tenant_id: id,
          ...rest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Operation failed");
      }
      return {
        data: { id, ...data },
      };
    }
    return { data: variables } as any;
  },

  deleteOne: async ({ resource, id }) => {
    if (resource === "tenants") {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({
          action: "DELETE",
          tenant_id: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Delete action failed");
      }
      return {
        data: { id, ...data },
      };
    }
    return { data: { id } } as any;
  },

  getApiUrl(): string {
    return API_BASE;
  },

  custom: async ({ url, method, payload }) => {
    const res = await fetch(url || API_BASE, {
      method: method || "POST",
      headers: getHeaders(),
      credentials: "include",
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      const errorMsg =
        data && typeof data === "object" && "error" in data
          ? (data as any).error
          : res.statusText || "Request failed";
      const err = new Error(errorMsg || "Request failed") as any;
      err.statusCode = res.status;
      throw err;
    }
    return { data };
  },
};

export const CACHE_CONFIG = {
  staleTime: 30 * 1000,
  cacheTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

export const queryClientConfig = {
  defaultOptions: {
    queries: CACHE_CONFIG,
  },
};

