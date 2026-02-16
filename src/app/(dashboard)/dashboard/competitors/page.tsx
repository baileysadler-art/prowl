import Link from "next/link";
import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CompetitorsList } from "@/components/competitors/competitors-list";
import { Plus, Users } from "lucide-react";

export const metadata = { title: "Competitors" };

export default async function CompetitorsPage() {
  const { supabase, orgId } = await getOrgId();

  const { data: competitors } = await supabase
    .from("competitors")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("competitor_limit, plan_tier")
    .eq("organization_id", orgId)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitors"
        description="Monitor your competitors' pricing and product strategies"
      >
        <Link href="/dashboard/competitors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Competitor
          </Button>
        </Link>
      </PageHeader>

      {(!competitors || competitors.length === 0) ? (
        <EmptyState
          icon={Users}
          title="No competitors yet"
          description="Start tracking your competitors to monitor their pricing and product changes."
        >
          <Link href="/dashboard/competitors/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Competitor
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <CompetitorsList
          competitors={competitors as any}
          competitorLimit={(subscription as any)?.competitor_limit || 3}
          planTier={(subscription as any)?.plan_tier || "starter"}
        />
      )}
    </div>
  );
}
