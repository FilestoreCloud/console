import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TenantShow } from "../show";

const mockTenantData = {
  id: "tenant-alpha",
  tenant_id: "tenant-alpha",
  domain: "tenant-alpha.png261.dev",
  status: "ACTIVE",
  admin_email: "admin@tenant-alpha.com",
  quota_gb: 100,
  storage_used_gb: 12.5,
  service_name: "service-tenant-alpha",
  database_name: "nc_tenant_alpha",
  release_channel: "STABLE",
  created_at: "2026-10-14T08:00:00Z",
  last_updated: "2026-10-15T10:00:00Z",
  accounts: [
    { username: "admin", display_name: "Admin User", email: "admin@tenant-alpha.com", role: "TenantAdmin", quota_gb: 50 },
  ],
  aws_topology: {
    cluster_name: "prod-storix-cluster",
    service_name: "service-tenant-alpha",
    database_endpoint: "db.internal:5432",
    efs_id: "fs-12345",
  },
  metrics: {
    current_cpu_percent: 15.2,
    current_memory_mb: 256.0,
    memory_limit_mb: 1024.0,
    active_connections: 5,
    requests_per_minute: 42,
    storage_used_gb: 12.5,
    quota_gb: 100,
  },
};

const mockRefetch = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockList = vi.fn();

vi.mock("@refinedev/core", () => ({
  useShow: () => ({
    queryResult: {
      data: { data: mockTenantData },
      isLoading: false,
      refetch: mockRefetch,
    },
  }),
  useUpdate: () => ({ mutate: mockUpdate, isLoading: false }),
  useDelete: () => ({ mutate: mockDelete, isLoading: false }),
  useNavigation: () => ({ list: mockList }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "tenant-alpha" }),
  };
});

vi.mock("../../../components/InteractiveMetricsChart", () => ({
  InteractiveMetricsChart: () => <div data-testid="interactive-metrics-chart">Interactive Metrics Chart</div>,
}));

describe("TenantShowPage — Deep Unified Single-Page Inspection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TenantShow />
      </BrowserRouter>,
    );
  };

  it("renders tenant title, domain, and status badges", () => {
    renderComponent();
    expect(screen.getAllByText("tenant-alpha")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/tenant-alpha\.png261\.dev/)[0]).toBeInTheDocument();
    expect(screen.getAllByText("ACTIVE")[0]).toBeInTheDocument();
  });

  it("renders exactly 2 header actions: Suspend Tenant and Delete Tenant", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: /Suspend Tenant/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete Tenant/i })).toBeInTheDocument();
  });

  it("prompts confirmation dialog when clicking Suspend Tenant and executes only after confirm", () => {
    renderComponent();
    const suspendBtn = screen.getByRole("button", { name: /Suspend Tenant/i });
    fireEvent.click(suspendBtn);

    // Confirmation dialog should appear
    expect(screen.getByText("Confirm Tenant Suspension")).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();

    // Click confirm in the dialog
    const confirmBtn = screen.getByRole("button", { name: "Confirm Suspend" });
    fireEvent.click(confirmBtn);

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { action: "SET_STATUS", status: "SUSPENDED" },
      }),
      expect.any(Object)
    );
  });

  it("renders unified single-page sections without tabs", () => {
    renderComponent();
    expect(screen.getByText(/Live Metrics & Telemetry/)).toBeInTheDocument();
    expect(screen.getByText(/Dedicated Architecture & Topology/)).toBeInTheDocument();
    expect(screen.getByText(/Agent Detail & Container Monitor/)).toBeInTheDocument();
    expect(screen.getByText(/Tenant Accounts Management/)).toBeInTheDocument();
    expect(screen.getByText(/FinOps & Custom Domain/)).toBeInTheDocument();
    expect(screen.getByText(/Health & Quota Limit/)).toBeInTheDocument();
    expect(screen.getByText(/Step Functions & X-Ray/)).toBeInTheDocument();
    expect(screen.getByText(/Tenant Audit Trail/)).toBeInTheDocument();
  });

  it("renders masked password in tenant accounts table and reveals full password on click", () => {
    renderComponent();

    // Default: password starts with first 3 chars followed by bullets
    const pwdBtn = screen.getByRole("button", { name: /Show password for admin/i });
    expect(pwdBtn).toBeInTheDocument();
    expect(pwdBtn.textContent).toContain("••••••••");

    // Click to reveal full password
    fireEvent.click(pwdBtn);
    expect(screen.getByRole("button", { name: /Hide password for admin/i })).toBeInTheDocument();
    expect(screen.getByText("Admin982#Storix!")).toBeInTheDocument();

    // Click again to mask
    const hideBtn = screen.getByRole("button", { name: /Hide password for admin/i });
    fireEvent.click(hideBtn);
    expect(screen.getByRole("button", { name: /Show password for admin/i })).toBeInTheDocument();
  });
});
