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
    sessionStorage.clear();
    mockLoginMutate.mockClear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders administrative sign-in form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Super Admin Portal")).toBeInTheDocument();
    expect(
      screen.getByText("Nextcloud Multi-Tenant SaaS Control Plane"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("admin@png261.dev")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In to Control Plane/i }),
    ).toBeInTheDocument();
  });

  it("fills demo persona credentials when quick-fill button is clicked", () => {
    render(<LoginPage />);

    const quickFillBtn = screen.getByRole("button", {
      name: /SuperAdmin \(Full Access\)/i,
    });
    expect(quickFillBtn).toBeInTheDocument();

    fireEvent.click(quickFillBtn);

    const emailInput = screen.getByPlaceholderText(
      "admin@png261.dev",
    ) as HTMLInputElement;
    expect(emailInput.value).toBe("admin@png261.dev");
  });

  it("transitions to TOTP MFA step when server responds with MFA_REQUIRED", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "MFA_REQUIRED",
        message: "Multi-Factor Authentication (TOTP) code required",
        challenge_token: "test-challenge-token-xyz",
        demo_totp_secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP",
        user: "admin@png261.dev",
        role: "SuperAdmin",
      }),
    } as Response);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@png261.dev"), {
      target: { value: "admin@png261.dev" },
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

    fireEvent.change(screen.getByPlaceholderText("admin@png261.dev"), {
      target: { value: "wrong@png261.dev" },
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
        demo_totp_secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP",
        user: "admin@png261.dev",
        role: "SuperAdmin",
      }),
    } as Response);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@png261.dev"), {
      target: { value: "admin@png261.dev" },
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
          email: "admin@png261.dev",
        },
        expect.any(Object),
      );
    });
  });
});
