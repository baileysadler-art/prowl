/**
 * Price parsing and normalization utilities.
 * Handles multiple currency formats, separators, and common pricing patterns.
 */

/**
 * Parses a price string into a numeric value.
 * Handles currency symbols (GBP, USD, EUR), comma/dot separators,
 * "was/now" patterns, and various whitespace.
 * Returns null if the string cannot be parsed into a valid price.
 */
export function parsePrice(text: string): number | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  let cleaned = text.trim();

  // Handle "was/now" patterns - extract the "now" price
  const nowMatch = cleaned.match(/now\s*[:.]?\s*([£$€]?\s*[\d,]+\.?\d*)/i);
  if (nowMatch) {
    cleaned = nowMatch[1];
  }

  // Handle "from" patterns - extract the price after "from"
  const fromMatch = cleaned.match(/from\s*[:.]?\s*([£$€]?\s*[\d,]+\.?\d*)/i);
  if (fromMatch) {
    cleaned = fromMatch[1];
  }

  // Strip currency symbols and whitespace
  cleaned = cleaned.replace(/[£$€\s]/g, "");

  // Remove any remaining non-numeric characters except commas, dots, and minus
  cleaned = cleaned.replace(/[^\d,.\-]/g, "");

  if (!cleaned) {
    return null;
  }

  // Handle European format (1.234,56 or 1234,56)
  // If there is a comma after the last dot, treat comma as decimal separator
  const lastCommaIndex = cleaned.lastIndexOf(",");
  const lastDotIndex = cleaned.lastIndexOf(".");

  if (lastCommaIndex > lastDotIndex && lastCommaIndex !== -1) {
    // European format: dots are thousands separators, comma is decimal
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDotIndex > lastCommaIndex && lastCommaIndex !== -1) {
    // US/UK format: commas are thousands separators, dot is decimal
    cleaned = cleaned.replace(/,/g, "");
  } else if (lastCommaIndex !== -1 && lastDotIndex === -1) {
    // Only commas present - determine if thousands separator or decimal
    const afterComma = cleaned.split(",").pop() || "";
    if (afterComma.length === 2) {
      // Likely a decimal comma (e.g., "12,99")
      cleaned = cleaned.replace(",", ".");
    } else {
      // Likely thousands separator (e.g., "1,234")
      cleaned = cleaned.replace(/,/g, "");
    }
  }

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed) || parsed < 0) {
    return null;
  }

  // Round to 2 decimal places to avoid floating point issues
  return Math.round(parsed * 100) / 100;
}
