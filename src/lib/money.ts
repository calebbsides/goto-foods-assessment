export function lineTotalCents(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity;
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function taxCents(subtotalCents: number, taxRateBps: number): number {
  return Math.round((subtotalCents * taxRateBps) / 10000);
}

export function grandTotalCents(subtotalCents: number, taxRateBps: number): number {
  return subtotalCents + taxCents(subtotalCents, taxRateBps);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
