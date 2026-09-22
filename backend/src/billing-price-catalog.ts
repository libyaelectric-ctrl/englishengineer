/** Public USD checkout catalog. A contract test checks parity with the independent UI. */
export const BILLING_PRICE_CATALOG = {
  junior: { month: 1999, year: 19999 },
  senior: { month: 3999, year: 39999 },
  specialist: { month: 4999, year: 49999 },
  master: { month: 5999, year: 59999 },
} as const;
