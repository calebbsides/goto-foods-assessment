import { describe, expect, it } from "vitest";
import {
  dollarsToCents,
  formatCents,
  grandTotalCents,
  lineTotalCents,
  sumCents,
  taxCents,
} from "@/lib/money";

describe("money", () => {
  it("multiplies unit price by quantity", () => {
    expect(lineTotalCents(1050, 3)).toBe(3150);
  });

  it("sums cent values", () => {
    expect(sumCents([100, 250, 75])).toBe(425);
    expect(sumCents([])).toBe(0);
  });

  it("computes tax with banker-free rounding to the nearest cent", () => {
    expect(taxCents(10000, 875)).toBe(875);
    expect(taxCents(9999, 875)).toBe(875);
    expect(taxCents(1, 875)).toBe(0);
  });

  it("adds tax into the grand total", () => {
    expect(grandTotalCents(10000, 875)).toBe(10875);
  });

  it("converts dollars to integer cents without float drift", () => {
    expect(dollarsToCents(6.65)).toBe(665);
    expect(dollarsToCents(728.31)).toBe(72831);
    expect(dollarsToCents(0.1 + 0.2)).toBe(30);
  });

  it("formats cents as US currency", () => {
    expect(formatCents(72831)).toBe("$728.31");
    expect(formatCents(0)).toBe("$0.00");
  });
});
