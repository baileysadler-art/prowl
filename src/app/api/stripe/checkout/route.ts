import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLAN_PRICES } from "@/lib/stripe";

export async function POST(request: Request) {
  const { planTier } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileData } = await supabase
    .from("users")
    .select("organization_id, email, organizations(name, stripe_customer_id)")
    .eq("id", user.id)
    .single();

  const profile = profileData as any;
  if (!profile?.organization_id) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const plan = PLAN_PRICES[planTier];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const org = profile.organizations as { name: string; stripe_customer_id: string | null } | null;

  // Get or create Stripe customer
  let customerId = org?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: org?.name || undefined,
      metadata: { organization_id: profile.organization_id },
    });
    customerId = customer.id;

    await (supabase
      .from("organizations") as any)
      .update({ stripe_customer_id: customer.id })
      .eq("id", profile.organization_id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        organization_id: profile.organization_id,
        plan_tier: planTier,
      },
    },
    metadata: {
      organization_id: profile.organization_id,
      plan_tier: planTier,
    },
  });

  return NextResponse.json({ url: session.url });
}
