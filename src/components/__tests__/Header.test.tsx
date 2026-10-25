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

    expect(screen.getByText("Storix Console")).toBeInTheDocument();
    expect(screen.getByText(/Region: ap-southeast-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Online/i)).toBeInTheDocument();
  });

  it("renders responsive mobile drawer toggle button with accessible aria-label", () => {
    render(<CustomHeader />);
    const toggleBtn = screen.getByLabelText("Toggle navigation menu");
    expect(toggleBtn).toBeInTheDocument();
  });

  it("renders user avatar and name in the header", () => {
    render(<CustomHeader />);
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByLabelText("User account menu")).toBeInTheDocument();
  });

  it("opens user menu and displays email and role details", async () => {
    render(<CustomHeader />);
    const userMenuBtn = screen.getByLabelText("User account menu");
    fireEvent.pointerDown(userMenuBtn, { pointerId: 1 });

    expect(await screen.findByText("nhphuong.code@gmail.com")).toBeInTheDocument();
    expect(screen.getByText(/Role: SuperAdmin/i)).toBeInTheDocument();
    expect(screen.getByText(/MFA: Verified/i)).toBeInTheDocument();
  });

  it("requires confirmation before executing logout", async () => {
    render(<CustomHeader />);
    const userMenuBtn = screen.getByLabelText("User account menu");
    expect(userMenuBtn).toBeInTheDocument();

    // Radix dropdown opens on pointerDown in jsdom
    fireEvent.pointerDown(userMenuBtn, { pointerId: 1 });

    const signOutItem = await screen.findByText("Sign Out");
    expect(signOutItem).toBeInTheDocument();
    fireEvent.click(signOutItem);

    // Logout should not be called immediately
    expect(mockLogout).not.toHaveBeenCalled();

    // Confirmation dialog should appear
    expect(screen.getByText("Confirm Sign Out")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to end your SuperAdmin control plane session?")
    ).toBeInTheDocument();

    // Click confirm in the dialog
    const confirmBtn = screen.getByRole("button", { name: "Sign Out" });
    fireEvent.click(confirmBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
