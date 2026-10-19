import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import fs from "fs";
import path from "path";
import { CustomHeader } from "../components/Header";
import { TenantList } from "../pages/tenants/list";

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
];

vi.mock("@refinedev/core", () => ({
  useList: () => ({
    data: { data: mockTenants, total: mockTenants.length },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useGetIdentity: () => ({
    data: { name: "ADMIN", email: "admin@storix.io", role: "SuperAdmin" },
  }),
  useLogout: () => ({ mutate: vi.fn() }),
  useCreate: () => ({ mutate: vi.fn(), isLoading: false }),
  useUpdate: () => ({ mutate: vi.fn(), isLoading: false }),
  useDelete: () => ({ mutate: vi.fn(), isLoading: false }),
  useCan: () => ({ data: { can: true } }),
  useNavigation: () => ({ show: vi.fn() }),
}));

describe("Responsive Layout & CSS Audit", () => {
  it("includes all essential responsive CSS breakpoints and selectors", () => {
    const cssPath = path.resolve(__dirname, "../responsive.css");
    expect(fs.existsSync(cssPath)).toBe(true);

    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // Critical responsive breakpoint rules
    expect(cssContent).toContain(".mobile-sider-toggle");
    expect(cssContent).toContain("@media (max-width: 991px)");
    expect(cssContent).toContain("@media (max-width: 768px)");
    expect(cssContent).toContain("@media (max-width: 600px)");
    expect(cssContent).toContain("@media (max-width: 576px)");
    expect(cssContent).toContain("@media (max-width: 480px)");

    // Table and modal protections
    expect(cssContent).toContain(".ant-table-wrapper");
    expect(cssContent).toContain("-webkit-overflow-scrolling: touch");
    expect(cssContent).toContain(".ant-modal");
    expect(cssContent).toContain("max-width: 95vw");

    // Webhooks & card header wrapping
    expect(cssContent).toContain(".webhook-compact-group");
    expect(cssContent).toContain(".tenant-progress-aside");
    expect(cssContent).toContain(".ant-card-head-wrapper");
  });

  it("renders mobile drawer toggle button in CustomHeader with accessible attributes", () => {
    render(<CustomHeader />);
    const toggleBtn = screen.getByLabelText("Toggle navigation menu");
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn.className).toContain("mobile-sider-toggle");
  });

  it("renders TenantList table inside an overflow-protected ant-table container", () => {
    const { container } = render(
      <BrowserRouter>
        <TenantList />
      </BrowserRouter>,
    );

    const tableWrapper = container.querySelector(".ant-table-wrapper");
    expect(tableWrapper).toBeInTheDocument();

    const table = container.querySelector(".ant-table");
    expect(table).toBeInTheDocument();
  });
});
