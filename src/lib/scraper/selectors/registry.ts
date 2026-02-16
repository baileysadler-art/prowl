/**
 * Platform-specific CSS selector configurations for product extraction.
 * Supports Shopify, WooCommerce, Magento, and a generic fallback.
 */

export interface SelectorConfig {
  /** CSS selector for the product container/card element */
  container: string;
  /** CSS selector for the product name (relative to container) */
  name: string;
  /** CSS selector for the current/sale price (relative to container) */
  price: string;
  /** CSS selector for the original/compare-at price (relative to container) */
  originalPrice: string;
  /** CSS selector for the product image (relative to container) */
  image: string;
  /** CSS selector for the product link (relative to container) */
  link: string;
  /** CSS selector indicating the product is on sale (relative to container) */
  saleIndicator: string;
}

const SHOPIFY_SELECTORS: SelectorConfig = {
  container: ".product-card, .grid-product, .product-item, .grid__item .card",
  name: ".product-card__title, .grid-product__title, .product-item__title, .card__heading, .card-information__text h3 a",
  price: ".product-card__price .money, .grid-product__price .money, .price-item--sale, .price .money, .price-item--regular",
  originalPrice: ".product-card__price .compare, .grid-product__price--compare, .price-item--regular.price-item--last, .price .compare-at-price",
  image: ".product-card__image img, .grid-product__image img, .product-item__image img, .card__media img, .media img",
  link: "a.product-card, a.grid-product__link, .product-item a, .card a, .card__heading a",
  saleIndicator: ".badge--sale, .product-card__badge--sale, .price--on-sale, .badge.price__badge-sale",
};

const WOOCOMMERCE_SELECTORS: SelectorConfig = {
  container: ".product, li.product, .products .product",
  name: ".woocommerce-loop-product__title, h2.woocommerce-loop-product__title, .product-title",
  price: ".price ins .woocommerce-Price-amount, .price > .woocommerce-Price-amount, .price .amount",
  originalPrice: ".price del .woocommerce-Price-amount, .price del .amount",
  image: ".attachment-woocommerce_thumbnail, .wp-post-image, img.woocommerce-placeholder",
  link: "a.woocommerce-LoopProduct-link, .woocommerce-loop-product__link",
  saleIndicator: ".onsale, span.onsale",
};

const MAGENTO_SELECTORS: SelectorConfig = {
  container: ".product-item, .item.product.product-item, li.product-item",
  name: ".product-item-name, .product-item-link, .product.name a",
  price: ".price-wrapper .price, .special-price .price, .price-box .price",
  originalPrice: ".old-price .price, .price-box .old-price .price-wrapper .price",
  image: ".product-image-photo, .product-image-wrapper img",
  link: ".product-item-link, .product-item-info a.product-item-link",
  saleIndicator: ".special-price, .price-box .old-price",
};

const GENERIC_SELECTORS: SelectorConfig = {
  container: "[data-product], .product, .product-card, .product-item, .grid-item, .collection-item, article.product",
  name: "[data-product-title], .product-name, .product-title, .item-name, h2 a, h3 a, .card-title",
  price: "[data-product-price], .product-price, .price, .current-price, .sale-price, .item-price",
  originalPrice: "[data-compare-price], .original-price, .compare-price, .was-price, .list-price, del .price, s .price",
  image: ".product-image img, .product-photo img, .card-image img, .item-image img, picture img, .product img",
  link: "a[href*='/product'], a[href*='/collections/'], a.product-link, .product-name a, .product-title a, h2 a, h3 a",
  saleIndicator: ".sale-badge, .on-sale, .sale, .badge-sale, [data-sale], .discount-badge",
};

/**
 * Maps platform identifier strings to their selector configurations.
 */
const PLATFORM_REGISTRY: Record<string, SelectorConfig> = {
  shopify: SHOPIFY_SELECTORS,
  woocommerce: WOOCOMMERCE_SELECTORS,
  magento: MAGENTO_SELECTORS,
  generic: GENERIC_SELECTORS,
};

/**
 * Detects the e-commerce platform from HTML source content.
 * Returns the platform name string or "generic" if unknown.
 */
export function detectPlatform(html: string): string {
  const lower = html.toLowerCase();

  // Shopify indicators
  if (
    lower.includes("shopify.com") ||
    lower.includes("cdn.shopify.com") ||
    lower.includes("shopify-section") ||
    lower.includes("myshopify.com")
  ) {
    return "shopify";
  }

  // WooCommerce indicators
  if (
    lower.includes("woocommerce") ||
    lower.includes("wc-block") ||
    lower.includes("wp-content/plugins/woocommerce") ||
    lower.includes("add_to_cart")
  ) {
    return "woocommerce";
  }

  // Magento indicators
  if (
    lower.includes("magento") ||
    lower.includes("mage/") ||
    lower.includes("catalog-product") ||
    lower.includes("varien/") ||
    lower.includes("requirejs-config")
  ) {
    return "magento";
  }

  return "generic";
}

/**
 * Returns the CSS selector configuration for the given platform.
 * Falls back to generic selectors if the platform is not recognized.
 */
export function getSelectors(platform: string): SelectorConfig {
  return PLATFORM_REGISTRY[platform] ?? GENERIC_SELECTORS;
}
