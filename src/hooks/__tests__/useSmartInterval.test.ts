import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSmartInterval } from "../useSmartInterval";
import { usePageVisibility } from "../usePageVisibility";

describe("usePageVisibility", () => {
  it("defaults to visible when document is not hidden", () => {
    Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
  });

  it("updates to false when document visibility changes to hidden", () => {
    Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(document, "hidden", { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current).toBe(false);
  });
});

describe("useSmartInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("fires callback periodically when visible", () => {
    const callback = vi.fn();
    renderHook(() => useSmartInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("pauses polling when document is hidden", () => {
    const callback = vi.fn();
    renderHook(() => useSmartInterval(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Tab hidden
    act(() => {
      Object.defineProperty(document, "hidden", { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Advance time while hidden - should NOT trigger callback
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Tab visible again - should trigger immediate refetch
    act(() => {
      Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
