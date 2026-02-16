import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, PLAN_PRICES } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organization_id;
      const planTier = session.metadata?.plan_tier || "starter";

      if (orgId && session.subscription) {
        const plan = PLAN_PRICES[planTier];
        await (supabase
          .from("subscriptions") as any)
          .update({
            stripe_subscription_id: session.subscription as string,
            plan_tier: planTier,
            status: "active",
            competitor_limit: plan?.competitorLimit || 3,
            scrape_interval_hours: plan?.scrapeInterval || 12,
          })
          .eq("organization_id", orgId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.organization_id;

      if (orgId) {
        const planTier = subscription.metadata?.plan_tier || "starter";
        const plan = PLAN_PRICES[planTier];
        const status = subscription.status === "active"
          ? "active"
          : subscription.status === "trialing"
            ? "trialing"
            : subscription.status === "past_due"
              ? "past_due"
              : "canceled";

        await (supabase
          .from("subscriptions") as any)
          .update({
            plan_tier: planTier,
            status,
            competitor_limit: plan?.competitorLimit || 3,
            scrape_interval_hours: plan?.scrapeInterval || 12,
            current_period_start: new Date(
              (subscription as any).current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              (subscription as any).current_period_end * 1000
            ).toISOString(),
          })
          .eq("organization_id", orgId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.organization_id;

      if (orgId) {
        await (supabase
          .from("subscriptions") as any)
          .update({
            status: "canceled",
            plan_tier: "starter",
            competitor_limit: 3,
            scrape_interval_hours: 12,
          })
          .eq("organization_id", orgId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

      if (subscriptionId) {
        await (supabase
          .from("subscriptions") as any)
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
