import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomHeader } from "../Header";

const mockLogout = vi.fn();
let mockUserData: any = null;

vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => ({ data: mockUserData }),
  useLogout: () => ({ mutate: mockLogout }),
}));

describe("CustomHeader", () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockUserData = {
      name: "ADMIN",
      email: "nhphuong.code@gmail.com",
      role: "SuperAdmin",
    };
  });

  it("renders console title, AWS region and online status", () => {
    render(<CustomHeader />);

    expect(screen.getByText("Filestore Cloud Console")).toBeInTheDocument();
    expect(screen.getByText(/Region: ap-southeast-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Online/i)).toBeInTheDocument();
    expect(screen.getByText("CloudWatch Dashboard ↗")).toBeInTheDocument();
  });

  it("displays SuperAdmin role badge correctly", () => {
    mockUserData = { email: "nhphuong.code@gmail.com", role: "SuperAdmin" };
    render(<CustomHeader />);
    expect(
      screen.getByText(/SuperAdmin \(Full Control\)/i),
    ).toBeInTheDocument();
  });

  it("defaults to SuperAdmin role badge when no role is specified", () => {
    mockUserData = { email: "nhphuong.code@gmail.com" };
    render(<CustomHeader />);
    expect(
      screen.getByText(/SuperAdmin \(Full Control\)/i),
    ).toBeInTheDocument();
  });

  it("calls onToggleTheme when the theme toggle button is clicked", () => {
    const handleToggle = vi.fn();
    render(<CustomHeader isDark={false} onToggleTheme={handleToggle} />);

    const themeBtn = screen.getByText("Light");
    expect(themeBtn).toBeInTheDocument();

    fireEvent.click(themeBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("renders Dark button label when isDark is true", () => {
    const handleToggle = vi.fn();
    render(<CustomHeader isDark={true} onToggleTheme={handleToggle} />);
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });
});
