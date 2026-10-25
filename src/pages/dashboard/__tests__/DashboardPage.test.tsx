import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { DashboardPage } from "../index";

const mockTenants = [
  { id: "tenant-alpha", tenant_id: "tenant-alpha", status: "ACTIVE" },
  { id: "tenant-beta", tenant_id: "tenant-beta", status: "SUSPENDED" },
];

const mockAuditLogs = [
  {
    event_id: "evt-001",
    timestamp: "2026-10-15T12:00:00Z",
    actor: "superadmin",
    role: "SuperAdmin",
    action: "PROVISION_TENANT",
    target: "tenant-alpha",
    status: "SUCCESS",
    ip_address: "10.0.1.50",
  },
];

vi.mock("@refinedev/core", () => ({
  useCustom: () => ({
    data: {
      data: {
        metrics: {
          current_cpu_percent: 18.4,
          active_connections: 124,
        },
      },
    },
    refetch: vi.fn(),
    isLoading: false,
  }),
  useList: ({ resource }: { resource: string }) => {
    if (resource === "tenants") {
      return {
        data: { data: mockTenants },
        refetch: vi.fn(),
        isLoading: false,
      };
    }
    return {
      data: { data: mockAuditLogs },
      refetch: vi.fn(),
      isLoading: false,
    };
  },
}));

vi.mock("../../../components/InteractiveMetricsChart", () => ({
  InteractiveMetricsChart: () => (
    <div data-testid="interactive-metrics-chart">Interactive Metrics Chart</div>
  ),
}));

describe("DashboardPage — SuperAdmin Control Plane Overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  it("renders dashboard title and platform KPI cards", () => {
    renderComponent();
    expect(
      screen.getByText("SuperAdmin Control Plane Dashboard")
    ).toBeInTheDocument();
    expect(screen.getByText("Registered Tenants")).toBeInTheDocument();
    expect(screen.getByText("Fleet CPU Utilization")).toBeInTheDocument();
    expect(screen.getByText("Active Database Connections")).toBeInTheDocument();
    expect(screen.getByText("Audit Events Recorded")).toBeInTheDocument();
  });

  it("renders live interactive telemetry chart and immutable cloud audit trail", () => {
    renderComponent();
    expect(
      screen.getByText("Fleet Telemetry & Real-Time Performance")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("interactive-metrics-chart")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cloud Audit Trail (Recent Activity)")
    ).toBeInTheDocument();
    expect(screen.getByText("PROVISION_TENANT")).toBeInTheDocument();
    expect(screen.getByText("tenant-alpha")).toBeInTheDocument();
  });
});
