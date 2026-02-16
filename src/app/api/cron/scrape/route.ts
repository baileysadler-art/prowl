/**
 * GET /api/cron/scrape
 *
 * Cron-triggered endpoint that scrapes all active competitors that are due
 * for a refresh based on their organization's subscription scrape_interval_hours.
 *
 * Validates a CRON_SECRET header when the env var is set to prevent
 * unauthorized invocations.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scrapeCompetitor, type ScrapeResult } from "@/lib/scraper/engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // ---- Validate cron secret (if configured) ----
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const supabase = createAdminClient();

    // ---- Fetch all active competitors with their organization's subscription ----
    const { data: competitorsRaw, error: compError } = await supabase
      .from("competitors")
      .select(`
        id,
        name,
        organization_id,
        last_scraped_at
      `)
      .eq("status", "active");

    const competitors = competitorsRaw as any[] | null;

    if (compError) {
      throw new Error(`Failed to fetch competitors: ${compError.message}`);
    }

    if (!competitors || competitors.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active competitors to scrape",
        results: [],
      });
    }

    // ---- Get subscription scrape intervals for each organization ----
    const orgIds = [...new Set(competitors.map((c) => c.organization_id))];
    const { data: subscriptionsRaw, error: subError } = await supabase
      .from("subscriptions")
      .select("organization_id, scrape_interval_hours, status")
      .in("organization_id", orgIds)
      .in("status", ["active", "trialing"]);

    const subscriptions = subscriptionsRaw as any[] | null;

    if (subError) {
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    const intervalByOrg = new Map(
      (subscriptions ?? []).map((s) => [s.organization_id, s.scrape_interval_hours])
    );

    // ---- Filter competitors that are due for scraping ----
    const now = new Date();
    const dueCompetitors = competitors.filter((competitor) => {
      const intervalHours = intervalByOrg.get(competitor.organization_id);
      // Skip competitors whose organization has no active subscription
      if (intervalHours === undefined) return false;

      // If never scraped, it is due
      if (!competitor.last_scraped_at) return true;

      const lastScraped = new Date(competitor.last_scraped_at);
      const msSinceLastScrape = now.getTime() - lastScraped.getTime();
      const msInterval = intervalHours * 60 * 60 * 1000;

      return msSinceLastScrape >= msInterval;
    });

    if (dueCompetitors.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No competitors are due for scraping",
        results: [],
      });
    }

    // ---- Scrape each due competitor sequentially ----
    const results: (ScrapeResult | { competitorId: string; error: string })[] = [];

    for (const competitor of dueCompetitors) {
      try {
        const result = await scrapeCompetitor(competitor.id);
        results.push(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[cron/scrape] Failed to scrape competitor ${competitor.name} (${competitor.id}):`,
          message
        );
        results.push({
          competitorId: competitor.id,
          error: message,
        });
      }
    }

    const succeeded = results.filter((r) => !("error" in r)).length;
    const failed = results.filter((r) => "error" in r).length;

    return NextResponse.json({
      success: true,
      message: `Scraped ${succeeded} competitor(s) successfully, ${failed} failed`,
      totalDue: dueCompetitors.length,
      succeeded,
      failed,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[cron/scrape] Error:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
