/**
 * Zambian Kwacha Currency Conversion & Formatting Utilities
 */

// Official 2026 approximate conversion rate: 1 USD = 25 ZMW
export const KWACHA_RATE = 25;

// Currency symbol (ZK or ZMW)
export const CURRENCY_SYMBOL = "ZK";

/**
 * Convert USD to Zambian Kwacha
 */
export function convertToKwacha(usdAmount: number): number {
  return Math.round(usdAmount * KWACHA_RATE);
}

/**
 * Format an amount in Zambian Kwacha
 */
export function formatKwacha(amountInZmw: number): string {
  return `${CURRENCY_SYMBOL} ${Math.round(amountInZmw).toLocaleString()}`;
}

/**
 * Format a USD amount directly into Kwacha display
 */
export function formatUsdToKwacha(usdAmount: number): string {
  return formatKwacha(convertToKwacha(usdAmount));
}
