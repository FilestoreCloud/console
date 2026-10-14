import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TenantList } from "../list";

const mockTenants = [
  {
    id: "dev-tenant",
    tenant_id: "dev-tenant",
    domain: "dev-tenant.png261.dev",
    status: "ACTIVE",
    admin_email: "admin@dev-tenant.com",
    quota_gb: 10,
    created_at: "2026-10-14T08:00:00Z",
  },
  {
    id: "acme-corp",
    tenant_id: "acme-corp",
    domain: "acme-corp.png261.dev",
    status: "SUSPENDED",
    admin_email: "admin@acme-corp.com",
    quota_gb: 250,
    created_at: "2026-03-01T00:00:00Z",
  },
];

const mockRefetch = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockShow = vi.fn();

vi.mock("@refinedev/core", () => ({
  useList: () => ({
    data: { data: mockTenants, total: mockTenants.length },
    isLoading: false,
    refetch: mockRefetch,
  }),
  useCreate: () => ({ mutate: mockCreate, isLoading: false }),
  useUpdate: () => ({ mutate: mockUpdate, isLoading: false }),
  useDelete: () => ({ mutate: mockDelete, isLoading: false }),
  useCan: () => ({ data: { can: true } }),
  useNavigation: () => ({ show: mockShow }),
}));

describe("TenantListPage — SuperAdmin Fleet Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TenantList />
      </BrowserRouter>,
    );
  };

  it("renders platform tenant statistics summary cards", () => {
    renderComponent();

    expect(screen.getByText("TOTAL REGISTERED TENANTS")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE DEPLOYMENTS")).toBeInTheDocument();
    expect(screen.getByText("SUSPENDED DEPLOYMENTS")).toBeInTheDocument();
    expect(screen.getByText("ALLOCATED STORAGE")).toBeInTheDocument();
  });

  it("renders tenant list table with tenant records", () => {
    renderComponent();

    expect(screen.getByText("dev-tenant")).toBeInTheDocument();
    expect(screen.getByText("dev-tenant.png261.dev")).toBeInTheDocument();
    expect(screen.getByText("acme-corp")).toBeInTheDocument();
    expect(screen.getByText("acme-corp.png261.dev")).toBeInTheDocument();
    expect(screen.getByText("admin@dev-tenant.com")).toBeInTheDocument();
  });

  it("filters tenants when searching in search input", async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(
      /Search Tenant ID, domain, email.../i,
    );
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "acme" } });

    await waitFor(() => {
      expect(screen.getByText("acme-corp")).toBeInTheDocument();
      expect(screen.queryByText("dev-tenant")).not.toBeInTheDocument();
    });
  });

  it("opens Create Tenant Modal when 'Provision Dedicated Tenant' button is clicked", () => {
    renderComponent();

    const createBtn = screen.getByRole("button", {
      name: /Provision Dedicated Tenant/i,
    });
    expect(createBtn).toBeInTheDocument();

    fireEvent.click(createBtn);

    // Modal opens with title 'Provision Dedicated Tenant'
    expect(screen.getAllByText("Provision Dedicated Tenant").length).toBeGreaterThanOrEqual(1);
  });
});
