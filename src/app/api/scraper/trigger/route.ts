/**
 * POST /api/scraper/trigger
 *
 * Manual scrape trigger endpoint. Accepts a competitor ID, validates the
 * authenticated user has access to that competitor's organization, and
 * runs the scraping engine.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeCompetitor } from "@/lib/scraper/engine";

export async function POST(request: NextRequest) {
  try {
    // ---- Validate authentication ----
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ---- Parse request body ----
    const body = await request.json();
    const { competitorId } = body as { competitorId?: string };

    if (!competitorId) {
      return NextResponse.json(
        { error: "Missing required field: competitorId" },
        { status: 400 }
      );
    }

    // ---- Verify user has access to this competitor ----
    // Look up the user's organization
    const { data: userRecordData, error: userError } = await supabase
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    const userRecord = userRecordData as any;
    if (userError || !userRecord) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 403 }
      );
    }

    // Verify the competitor belongs to the user's organization
    const { data: competitorData, error: compError } = await supabase
      .from("competitors")
      .select("id, organization_id")
      .eq("id", competitorId)
      .single();

    const competitor = competitorData as any;
    if (compError || !competitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    if (competitor.organization_id !== userRecord.organization_id) {
      return NextResponse.json(
        { error: "Forbidden: competitor does not belong to your organization" },
        { status: 403 }
      );
    }

    // ---- Run the scraper ----
    const result = await scrapeCompetitor(competitorId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[scraper/trigger] Error:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
