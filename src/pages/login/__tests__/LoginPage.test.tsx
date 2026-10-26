import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "../index";

const mockLoginMutate = vi.fn();

vi.mock("@refinedev/core", () => ({
  useLogin: () => ({
    mutate: mockLoginMutate,
    isLoading: false,
  }),
}));

describe("LoginPage — SuperAdmin Authentication Flow", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    mockLoginMutate.mockClear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders administrative sign-in form correctly with empty fields", () => {
    render(<LoginPage />);

    expect(screen.getByText("Storix Super Admin Portal")).toBeInTheDocument();
    expect(
      screen.getByText("Storix Multi-Tenant SaaS Control Plane"),
    ).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText("admin@example.com") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••••••") as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    // Verify security: fields are empty by default, no pre-filled credentials
    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
    expect(
      screen.getByRole("button", { name: /Sign In to Control Plane/i }),
    ).toBeInTheDocument();
  });

  it("verifies demo quick-fill and passkey buttons are not present", () => {
    render(<LoginPage />);
    expect(screen.queryByText(/DEMO QUICK-FILL/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /SuperAdmin \(Full Access\)/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Passkey/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Two-Factor Authentication/i),
    ).not.toBeInTheDocument();
  });

  it("directly authenticates with credentials without MFA", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "OK",
        token: "jwt-token-12345",
        user: "admin@example.com",
        role: "SuperAdmin",
      }),
    } as Response);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@example.com"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "AdminPassword123!" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Sign In to Control Plane/i }),
    );

    await waitFor(() => {
      expect(localStorage.getItem("saas_admin_token")).toBe("jwt-token-12345");
      expect(localStorage.getItem("saas_admin_email")).toBe("admin@example.com");
      expect(localStorage.getItem("saas_admin_role")).toBe("SuperAdmin");
    });
  });

  it("displays error alert when invalid credentials are provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Invalid administrative credentials.",
      }),
    } as Response);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@example.com"), {
      target: { value: "wrong@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "WrongPassword" },
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(
        screen.getByRole("button", { name: /Sign In to Control Plane/i }),
      );
    }

    await waitFor(() => {
      expect(
        screen.getByText("Invalid administrative credentials."),
      ).toBeInTheDocument();
    });
  });
});
