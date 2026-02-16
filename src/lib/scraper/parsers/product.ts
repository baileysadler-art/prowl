/**
 * Product data extraction from parsed HTML using CSS selectors.
 * Converts DOM elements into structured ScrapedProduct objects.
 */

import type { CheerioAPI } from "cheerio";
import type { SelectorConfig } from "@/lib/scraper/selectors/registry";
import { parsePrice } from "@/lib/scraper/parsers/price";

export interface ScrapedProduct {
  name: string;
  price: number | null;
  originalPrice: number | null;
  url: string;
  imageUrl: string | null;
  inStock: boolean;
  isOnSale: boolean;
}

/**
 * Resolves a potentially relative URL to an absolute URL using the page's base URL.
 */
function resolveUrl(href: string | undefined, baseUrl: string): string {
  if (!href) return baseUrl;

  try {
    // If it is already absolute, return as-is
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return href;
    }

    const base = new URL(baseUrl);

    // Protocol-relative URL
    if (href.startsWith("//")) {
      return `${base.protocol}${href}`;
    }

    // Root-relative URL
    if (href.startsWith("/")) {
      return `${base.origin}${href}`;
    }

    // Relative URL
    return new URL(href, baseUrl).href;
  } catch {
    return baseUrl;
  }
}

/**
 * Extracts product data from a parsed HTML document using the provided CSS selectors.
 * Returns an array of scraped product objects with resolved absolute URLs.
 *
 * @param $ - A CheerioAPI instance loaded with the page HTML
 * @param url - The source page URL (used for resolving relative links)
 * @param selectors - Platform-specific CSS selector configuration
 */
export function extractProducts(
  $: CheerioAPI,
  url: string,
  selectors: SelectorConfig
): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];

  $(selectors.container).each((_index, element) => {
    try {
      const $el = $(element);

      // Extract product name
      const nameEl = $el.find(selectors.name).first();
      const name = nameEl.text().trim();

      if (!name) return; // Skip elements without a name

      // Extract current price
      const priceText = $el.find(selectors.price).first().text().trim();
      const price = parsePrice(priceText);

      // Extract original / compare-at price
      const originalPriceText = $el.find(selectors.originalPrice).first().text().trim();
      const originalPrice = parsePrice(originalPriceText);

      // Extract product URL
      const linkEl = $el.find(selectors.link).first();
      let productHref = linkEl.attr("href");
      // If the container itself is a link, use it
      if (!productHref && $el.is("a")) {
        productHref = $el.attr("href");
      }
      // If the name element is inside a link, grab that
      if (!productHref) {
        productHref = nameEl.closest("a").attr("href") || nameEl.find("a").first().attr("href");
      }
      const productUrl = resolveUrl(productHref, url);

      // Extract product image URL
      const imgEl = $el.find(selectors.image).first();
      const imgSrc =
        imgEl.attr("src") ||
        imgEl.attr("data-src") ||
        imgEl.attr("data-lazy-src") ||
        imgEl.attr("srcset")?.split(",")[0]?.trim().split(" ")[0];
      const imageUrl = imgSrc ? resolveUrl(imgSrc, url) : null;

      // Detect sale status
      const hasSaleIndicator = $el.find(selectors.saleIndicator).length > 0;
      const hasOriginalPrice = originalPrice !== null && originalPrice > (price ?? 0);
      const isOnSale = hasSaleIndicator || hasOriginalPrice;

      // Detect stock status (assume in stock unless explicitly marked)
      const elHtml = $.html(element).toLowerCase();
      const outOfStockPatterns = [
        "out of stock",
        "sold out",
        "out-of-stock",
        "soldout",
        "unavailable",
        "coming soon",
      ];
      const inStock = !outOfStockPatterns.some((pattern) => elHtml.includes(pattern));

      products.push({
        name,
        price,
        originalPrice: isOnSale ? originalPrice : null,
        url: productUrl,
        imageUrl,
        inStock,
        isOnSale,
      });
    } catch {
      // Skip products that fail to parse
    }
  });

  return products;
}
