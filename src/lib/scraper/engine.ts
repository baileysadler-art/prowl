/**
 * Main scraping engine orchestrator.
 * Loads competitor data from Supabase, scrapes pages, detects product changes,
 * and persists results (products, price_history, product_changes, scrape_jobs).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/types";
import { fetchAndParse } from "@/lib/scraper/strategies/cheerio";
import { extractProducts, type ScrapedProduct } from "@/lib/scraper/parsers/product";
import { detectPlatform, getSelectors } from "@/lib/scraper/selectors/registry";
import { randomDelay } from "@/lib/scraper/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChangeType = Tables<"product_changes">["change_type"];

interface ProductChange {
  productId: string;
  changeType: ChangeType;
  oldValue: string | null;
  newValue: string | null;
  percentageChange: number | null;
}

export interface ScrapeResult {
  competitorId: string;
  competitorName: string;
  jobId: string;
  pagesScraped: number;
  productsFound: number;
  newProducts: number;
  updatedProducts: number;
  changesDetected: number;
  changes: ProductChange[];
  errors: string[];
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the percentage change between two values.
 */
function percentChange(oldVal: number, newVal: number): number {
  if (oldVal === 0) return 0;
  return Math.round(((newVal - oldVal) / oldVal) * 10000) / 100;
}

/**
 * Detects all changes between an existing product record and a freshly scraped product.
 */
function detectChanges(
  existing: Tables<"products">,
  scraped: ScrapedProduct
): Omit<ProductChange, "productId">[] {
  const changes: Omit<ProductChange, "productId">[] = [];

  // Price changes
  if (
    existing.current_price !== null &&
    scraped.price !== null &&
    existing.current_price !== scraped.price
  ) {
    const pct = percentChange(existing.current_price, scraped.price);
    if (scraped.price > existing.current_price) {
      changes.push({
        changeType: "price_increase",
        oldValue: String(existing.current_price),
        newValue: String(scraped.price),
        percentageChange: pct,
      });
    } else {
      changes.push({
        changeType: "price_decrease",
        oldValue: String(existing.current_price),
        newValue: String(scraped.price),
        percentageChange: pct,
      });
    }
  }

  // Stock status changes
  if (existing.in_stock && !scraped.inStock) {
    changes.push({
      changeType: "out_of_stock",
      oldValue: "in_stock",
      newValue: "out_of_stock",
      percentageChange: null,
    });
  } else if (!existing.in_stock && scraped.inStock) {
    changes.push({
      changeType: "back_in_stock",
      oldValue: "out_of_stock",
      newValue: "in_stock",
      percentageChange: null,
    });
  }

  // Sale status changes
  if (!existing.is_on_sale && scraped.isOnSale) {
    changes.push({
      changeType: "sale_started",
      oldValue: null,
      newValue: scraped.originalPrice ? String(scraped.originalPrice) : null,
      percentageChange: null,
    });
  } else if (existing.is_on_sale && !scraped.isOnSale) {
    changes.push({
      changeType: "sale_ended",
      oldValue: existing.original_price ? String(existing.original_price) : null,
      newValue: null,
      percentageChange: null,
    });
  }

  return changes;
}

// ---------------------------------------------------------------------------
// Main Engine
// ---------------------------------------------------------------------------

/**
 * Runs the full scraping pipeline for a given competitor.
 *
 * 1. Creates a scrape_job record (status: running).
 * 2. Loads the competitor and its active pages from Supabase.
 * 3. For each page URL, fetches HTML, detects platform, and extracts products.
 * 4. Matches scraped products to existing DB products by URL.
 * 5. Detects changes, inserts/updates products, writes price_history and product_changes.
 * 6. Updates competitor metadata (last_scraped_at, product_count).
 * 7. Marks the scrape_job as completed (or failed).
 * 8. Returns a ScrapeResult summary.
 */
export async function scrapeCompetitor(competitorId: string): Promise<ScrapeResult> {
  const startTime = Date.now();
  const supabase = createAdminClient();
  const errors: string[] = [];
  const allChanges: ProductChange[] = [];
  let pagesScraped = 0;
  let productsFound = 0;
  let newProducts = 0;
  let updatedProducts = 0;

  // ---- Load competitor ----
  const { data: competitor, error: compError } = await supabase
    .from("competitors")
    .select("*")
    .eq("id", competitorId)
    .single();

  if (compError || !competitor) {
    throw new Error(`Competitor not found: ${competitorId}`);
  }

  // ---- Create scrape job ----
  const { data: job, error: jobError } = await supabase
    .from("scrape_jobs")
    .insert({
      competitor_id: competitorId,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (jobError || !job) {
    throw new Error(`Failed to create scrape job: ${jobError?.message}`);
  }

  const jobId = job.id;

  try {
    // ---- Load competitor pages ----
    const { data: pages, error: pagesError } = await supabase
      .from("competitor_pages")
      .select("*")
      .eq("competitor_id", competitorId)
      .eq("is_active", true);

    if (pagesError) {
      throw new Error(`Failed to load pages: ${pagesError.message}`);
    }

    if (!pages || pages.length === 0) {
      throw new Error(`No active pages configured for competitor: ${competitor.name}`);
    }

    // ---- Load existing products for matching ----
    const { data: existingProducts } = await supabase
      .from("products")
      .select("*")
      .eq("competitor_id", competitorId);

    const existingByUrl = new Map(
      (existingProducts ?? []).map((p) => [p.url, p])
    );

    // Track which existing products we've seen (to detect removed products)
    const seenProductUrls = new Set<string>();

    // ---- Scrape each page ----
    for (const page of pages) {
      try {
        // Fetch and parse the page
        const $ = await fetchAndParse(page.url);
        const rawHtml = $.html();

        // Detect platform and get selectors
        const platform = detectPlatform(rawHtml);
        const selectors = getSelectors(platform);

        // Extract products from page
        const scrapedProducts = extractProducts($, page.url, selectors);

        pagesScraped++;
        productsFound += scrapedProducts.length;

        // ---- Process each scraped product ----
        for (const scraped of scrapedProducts) {
          seenProductUrls.add(scraped.url);
          const existing = existingByUrl.get(scraped.url);

          if (existing) {
            // ---- Existing product: detect changes and update ----
            const changes = detectChanges(existing, scraped);

            // Update the product record
            const { error: updateError } = await supabase
              .from("products")
              .update({
                name: scraped.name,
                current_price: scraped.price,
                original_price: scraped.originalPrice,
                image_url: scraped.imageUrl,
                in_stock: scraped.inStock,
                is_on_sale: scraped.isOnSale,
                last_checked_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);

            if (updateError) {
              errors.push(`Failed to update product ${existing.id}: ${updateError.message}`);
              continue;
            }

            if (changes.length > 0) {
              updatedProducts++;
            }

            // Record price history if price is available
            if (scraped.price !== null) {
              await supabase.from("price_history").insert({
                product_id: existing.id,
                price: scraped.price,
                original_price: scraped.originalPrice,
                currency: existing.currency,
              });
            }

            // Record each detected change
            for (const change of changes) {
              const { data: changeRecord } = await supabase
                .from("product_changes")
                .insert({
                  product_id: existing.id,
                  change_type: change.changeType,
                  old_value: change.oldValue,
                  new_value: change.newValue,
                  percentage_change: change.percentageChange,
                })
                .select("id")
                .single();

              allChanges.push({
                productId: existing.id,
                ...change,
              });

              if (changeRecord) {
                // Change recorded successfully
              }
            }
          } else {
            // ---- New product: insert and record change ----
            const { data: newProduct, error: insertError } = await supabase
              .from("products")
              .insert({
                competitor_id: competitorId,
                name: scraped.name,
                url: scraped.url,
                image_url: scraped.imageUrl,
                current_price: scraped.price,
                original_price: scraped.originalPrice,
                currency: "GBP",
                in_stock: scraped.inStock,
                is_on_sale: scraped.isOnSale,
                last_checked_at: new Date().toISOString(),
              })
              .select("id")
              .single();

            if (insertError || !newProduct) {
              errors.push(`Failed to insert product "${scraped.name}": ${insertError?.message}`);
              continue;
            }

            newProducts++;

            // Record initial price history
            if (scraped.price !== null) {
              await supabase.from("price_history").insert({
                product_id: newProduct.id,
                price: scraped.price,
                original_price: scraped.originalPrice,
                currency: "GBP",
              });
            }

            // Record new_product change
            await supabase.from("product_changes").insert({
              product_id: newProduct.id,
              change_type: "new_product",
              old_value: null,
              new_value: scraped.price ? String(scraped.price) : null,
              percentage_change: null,
            });

            allChanges.push({
              productId: newProduct.id,
              changeType: "new_product",
              oldValue: null,
              newValue: scraped.price ? String(scraped.price) : null,
              percentageChange: null,
            });
          }
        }

        // Add a delay between pages to avoid rate limiting
        if (pages.indexOf(page) < pages.length - 1) {
          await randomDelay(1500, 3500);
        }
      } catch (pageError) {
        const message =
          pageError instanceof Error ? pageError.message : String(pageError);
        errors.push(`Error scraping page ${page.url}: ${message}`);
      }
    }

    // ---- Update product count on competitor ----
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("competitor_id", competitorId);

    await supabase
      .from("competitors")
      .update({
        last_scraped_at: new Date().toISOString(),
        product_count: totalProducts ?? 0,
        status: errors.length === 0 ? "active" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", competitorId);

    // ---- Mark scrape job as completed ----
    await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        pages_scraped: pagesScraped,
        products_found: productsFound,
        changes_detected: allChanges.length,
        completed_at: new Date().toISOString(),
        error_message: errors.length > 0 ? errors.join("; ") : null,
      })
      .eq("id", jobId);

    return {
      competitorId,
      competitorName: competitor.name,
      jobId,
      pagesScraped,
      productsFound,
      newProducts,
      updatedProducts,
      changesDetected: allChanges.length,
      changes: allChanges,
      errors,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    // ---- Mark job as failed ----
    const message = error instanceof Error ? error.message : String(error);

    await supabase
      .from("scrape_jobs")
      .update({
        status: "failed",
        pages_scraped: pagesScraped,
        products_found: productsFound,
        changes_detected: allChanges.length,
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", jobId);

    // Also mark competitor as error state
    await supabase
      .from("competitors")
      .update({
        status: "error",
        updated_at: new Date().toISOString(),
      })
      .eq("id", competitorId);

    throw error;
  }
}
