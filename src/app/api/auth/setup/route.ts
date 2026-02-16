import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { userId, email, fullName, orgName } = await request.json();

  if (!userId || !email || !fullName || !orgName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Create organization
  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data: org, error: orgError } = await (supabase
    .from("organizations") as any)
    .insert({ name: orgName, slug: `${slug}-${Date.now()}` })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }

  // Create user profile
  const { error: userError } = await (supabase.from("users") as any).insert({
    id: userId,
    organization_id: org.id,
    email,
    full_name: fullName,
    role: "owner",
  });

  if (userError) {
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    );
  }

  // Create default subscription (starter trial)
  const { error: subError } = await (supabase.from("subscriptions") as any).insert({
    organization_id: org.id,
    plan_tier: "starter",
    status: "trialing",
    competitor_limit: 3,
    scrape_interval_hours: 12,
  });

  if (subError) {
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }

  // Create default notification settings
  await (supabase.from("notification_settings") as any).insert({
    organization_id: org.id,
  });

  return NextResponse.json({ success: true, organizationId: org.id });
}
