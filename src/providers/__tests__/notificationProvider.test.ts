import { describe, it, expect, vi, beforeEach } from "vitest";
import { notificationProvider } from "../notificationProvider";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

describe("notificationProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles success notifications", () => {
    notificationProvider.open?.({
      message: "Operation succeeded",
      description: "Everything worked well",
      type: "success",
    });

    expect(toast.success).toHaveBeenCalledWith("Operation succeeded", {
      description: "Everything worked well",
    });
  });

  it("handles error notifications", () => {
    notificationProvider.open?.({
      message: "Operation failed",
      description: "Something went wrong",
      type: "error",
    });

    expect(toast.error).toHaveBeenCalledWith("Operation failed", {
      description: "Something went wrong",
    });
  });

  it("handles progress notifications", () => {
    notificationProvider.open?.({
      message: "Loading data",
      description: "Please wait",
      type: "progress",
    });

    expect(toast.loading).toHaveBeenCalledWith("Loading data", {
      description: "Please wait",
    });
  });

  it("handles default notifications", () => {
    notificationProvider.open?.({
      message: "General notification",
      description: "Informational info",
      type: "default" as any,
    });

    expect(toast).toHaveBeenCalledWith("General notification", {
      description: "Informational info",
    });
  });

  it("handles close with specific key", () => {
    notificationProvider.close?.("toast-id-123");
    expect(toast.dismiss).toHaveBeenCalledWith("toast-id-123");
  });

  it("handles close without key", () => {
    notificationProvider.close?.(undefined as any);
    expect(toast.dismiss).toHaveBeenCalledWith();
  });
});
