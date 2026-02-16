"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PRICING_TIERS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function BillingPage() {
  const [subscription, setSubscription] = useState<{
    plan_tier: string;
    status: string;
    competitor_limit: number;
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [competitorCount, setCompetitorCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("users")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      const profile = profileData as any;
      if (!profile?.organization_id) return;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .single();

      const { count } = await supabase
        .from("competitors")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id);

      setSubscription(sub as any);
      setCompetitorCount(count || 0);
    }
    load();
  }, [supabase]);

  async function handleUpgrade(planTier: string) {
    setLoading(planTier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier }),
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(null);
  }

  async function handleManageBilling() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      } else {
        toast.error("Failed to open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(null);
  }

  const currentPlan = subscription?.plan_tier || "starter";

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Manage your subscription and billing" />

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {currentPlan}
              </p>
              <p className="text-sm text-slate-500">
                {competitorCount} / {subscription?.competitor_limit || 3} competitors used
              </p>
            </div>
            <Badge
              variant="secondary"
              className={
                subscription?.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }
            >
              {subscription?.status || "trialing"}
            </Badge>
            <Button
              variant="outline"
              className="ml-auto"
              onClick={handleManageBilling}
              disabled={loading === "portal"}
            >
              {loading === "portal" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage Billing
            </Button>
          </div>

          {/* Usage bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Competitor Usage</span>
              <span>
                {competitorCount} / {subscription?.competitor_limit || 3}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (competitorCount / (subscription?.competitor_limit || 3)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing tiers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRICING_TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.name.toLowerCase();
          return (
            <Card
              key={tier.name}
              className={`relative ${
                tier.popular ? "border-blue-600 shadow-md" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base">{tier.name}</CardTitle>
                <CardDescription className="text-xs">
                  {tier.description}
                </CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">
                    £{tier.price}
                  </span>
                  <span className="text-slate-500">/{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full ${
                    isCurrent ? "" : tier.popular ? "bg-blue-600 hover:bg-blue-700" : ""
                  }`}
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || loading !== null}
                  onClick={() => handleUpgrade(tier.name.toLowerCase())}
                >
                  {loading === tier.name.toLowerCase() && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isCurrent ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
