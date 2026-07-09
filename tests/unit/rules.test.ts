import { describe, expect, it } from "vitest";
import { canAddParticipant, isOrderClosed, normalizeEmail } from "@/lib/orders/rules";

describe("canAddParticipant", () => {
  it("allows up to three participants including the host", () => {
    expect(canAddParticipant(0)).toBe(true);
    expect(canAddParticipant(1)).toBe(true);
    expect(canAddParticipant(2)).toBe(true);
  });

  it("rejects the fourth participant", () => {
    expect(canAddParticipant(3)).toBe(false);
    expect(canAddParticipant(4)).toBe(false);
  });
});

describe("isOrderClosed", () => {
  it("treats non-open statuses as closed", () => {
    expect(isOrderClosed({ status: "closed", closesAt: null }, 100)).toBe(true);
    expect(isOrderClosed({ status: "checked_out", closesAt: null }, 100)).toBe(true);
  });

  it("stays open when no timer is set", () => {
    expect(isOrderClosed({ status: "open", closesAt: null }, 100)).toBe(false);
  });

  it("closes once the timer passes", () => {
    expect(isOrderClosed({ status: "open", closesAt: 1000 }, 999)).toBe(false);
    expect(isOrderClosed({ status: "open", closesAt: 1000 }, 1000)).toBe(true);
    expect(isOrderClosed({ status: "open", closesAt: 1000 }, 1500)).toBe(true);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Ash@Example.COM ")).toBe("ash@example.com");
  });
});
