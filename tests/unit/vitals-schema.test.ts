import { describe, expect, it } from "vitest";
import { vitalsSchema } from "@/app/api/vitals/schema";

describe("vitalsSchema", () => {
  it("accepts a web vitals metric", () => {
    const parsed = vitalsSchema.parse({ name: "LCP", value: 1234.5, rating: "good", id: "v1-1" });
    expect(parsed).toMatchObject({ name: "LCP", value: 1234.5 });
  });

  it("accepts a route error beacon", () => {
    const parsed = vitalsSchema.parse({ name: "route_error", message: "boom", digest: "abc" });
    expect(parsed).toMatchObject({ name: "route_error", message: "boom" });
  });

  it("rejects a metric with a non-numeric value", () => {
    expect(() => vitalsSchema.parse({ name: "LCP", value: "fast" })).toThrow();
  });

  it("rejects an unknown payload shape", () => {
    expect(() => vitalsSchema.parse({ foo: "bar" })).toThrow();
  });

  it("rejects an over-long error message", () => {
    expect(() =>
      vitalsSchema.parse({ name: "route_error", message: "x".repeat(1_001) }),
    ).toThrow();
  });
});
