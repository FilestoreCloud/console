import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuditLogList } from "../list";

const mockAuditLogs = [
  {
    event_id: "evt-001",
    timestamp: "2026-10-15T12:00:00Z",
    actor: "superadmin",
    role: "SuperAdmin",
    action: "PROVISION_TENANT",
    target: "tenant-beta",
    status: "SUCCESS",
    ip_address: "10.0.1.50",
  },
  {
    event_id: "evt-002",
    timestamp: "2026-10-15T12:05:00Z",
    actor: "superadmin",
    role: "SuperAdmin",
    action: "LOGIN_CHALLENGE",
    target: "auth",
    status: "SUCCESS",
    ip_address: "10.0.1.50",
  },
];

const mockRefetch = vi.fn();

vi.mock("@refinedev/core", () => ({
  useList: () => ({
    data: { data: mockAuditLogs },
    isLoading: false,
    refetch: mockRefetch,
  }),
}));

describe("AuditLogListPage — Enterprise Compliance & Security Log", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuditLogList />
      </BrowserRouter>,
    );
  };

  it("renders audit log table with event actions and actors", () => {
    renderComponent();
    expect(screen.getByText("Immutable Cloud Audit Trail")).toBeInTheDocument();
    expect(screen.getByText("PROVISION_TENANT")).toBeInTheDocument();
    expect(screen.getByText("LOGIN_CHALLENGE")).toBeInTheDocument();
    expect(screen.getAllByText("superadmin")[0]).toBeInTheDocument();
    expect(screen.getAllByText("SUCCESS")[0]).toBeInTheDocument();
  });
});
