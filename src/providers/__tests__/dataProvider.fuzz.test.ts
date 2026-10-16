import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { dataProvider } from "../dataProvider";

describe("dataProvider — Property-Based Fuzzing with fast-check", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("safely handles arbitrary corrupted server response payloads without unhandled runtime exceptions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 200, max: 299 }),
        fc.anything(),
        async (statusCode, randomPayload) => {
          // Mock fetch returning arbitrary random payloads
          globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: statusCode,
            json: vi.fn().mockResolvedValue(randomPayload),
          });

          // Must safely resolve or return data structure without throwing TypeError
          const result = await dataProvider.custom({
            url: "/api/tenants",
            method: "get",
          });

          expect(result).toBeDefined();
          expect("data" in result).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("safely throws structured HttpError on arbitrary 4xx/5xx HTTP error statuses and responses", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        fc.string(),
        async (errorCode, errorMsg) => {
          globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: errorCode,
            statusText: "Error",
            json: vi.fn().mockResolvedValue({ error: errorMsg }),
          });

          await expect(
            dataProvider.custom({
              url: "/api/tenants/invalid-id",
              method: "get",
            })
          ).rejects.toMatchObject({
            statusCode: errorCode,
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});
