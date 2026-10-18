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

  it("verifies demo quick-fill buttons are not present for security", () => {
    render(<LoginPage />);
    expect(screen.queryByText(/DEMO QUICK-FILL/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /SuperAdmin \(Full Access\)/i }),
    ).not.toBeInTheDocument();
  });

  it("transitions to TOTP MFA step when server responds with MFA_REQUIRED", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "MFA_REQUIRED",
        message: "Multi-Factor Authentication code required",
        challenge_token: "test-challenge-token-xyz",
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
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Verify & Complete Sign In/i }),
      ).toBeInTheDocument();
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

  it("submits 6-digit MFA code on step 2 via useLogin mutation", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "MFA_REQUIRED",
        challenge_token: "challenge-token-456",
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
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("000000"), {
      target: { value: "123456" },
    });

    const mfaForm = document.querySelector("form");
    if (mfaForm) {
      fireEvent.submit(mfaForm);
    } else {
      fireEvent.click(
        screen.getByRole("button", { name: /Verify & Complete Sign In/i }),
      );
    }

    await waitFor(() => {
      expect(mockLoginMutate).toHaveBeenCalledWith(
        {
          challenge_token: "challenge-token-456",
          mfa_code: "123456",
          email: "admin@example.com",
        },
        expect.any(Object),
      );
    });
  });
});
