import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { CustomHeader } from "../components/Header";
import { LoginPage } from "../pages/login";

// Mock refine hooks for isolated component rendering
vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => ({
    data: {
      name: "ADMIN",
      email: "admin@storix.io",
      role: "SuperAdmin",
    },
  }),
  useLogout: () => ({ mutate: vi.fn() }),
  useLogin: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
}));

describe("Accessibility Standards Verification (WCAG 2.1 AA with axe-core)", () => {
  it("verifies Header component has zero critical or serious accessibility violations", async () => {
    const { container } = render(<CustomHeader />);

    const results = await axe.run(container, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(
      criticalOrSerious,
      `Detected accessibility violations: ${JSON.stringify(criticalOrSerious, null, 2)}`
    ).toEqual([]);
  });

  it("verifies LoginPage form fields and controls have accessible labels and attributes", async () => {
    const { container } = render(<LoginPage />);

    const results = await axe.run(container, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(
      criticalOrSerious,
      `Detected accessibility violations: ${JSON.stringify(criticalOrSerious, null, 2)}`
    ).toEqual([]);
  });
});
