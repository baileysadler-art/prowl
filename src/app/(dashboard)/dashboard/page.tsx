import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentChanges } from "@/components/dashboard/recent-changes";
import { TopMovers } from "@/components/dashboard/top-movers";
import { CompetitorStatusCards } from "@/components/dashboard/competitor-status-cards";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, orgId } = await getOrgId();

  // Fetch KPI data
  const [
    { count: competitorCount },
    { count: activeAlertCount },
  ] = await Promise.all([
    supabase
      .from("competitors")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "active"),
    supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("is_read", false),
  ]);

  // Fetch recent changes - simplified query
  const { data: recentChanges } = await supabase
    .from("product_changes")
    .select("*, products!inner(name, url, competitor_id, competitors!inner(name, organization_id))")
    .eq("products.competitors.organization_id", orgId)
    .order("detected_at", { ascending: false })
    .limit(10);

  // Fetch competitors
  const { data: competitors } = await supabase
    .from("competitors")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your competitor intelligence"
      />

      <KpiCards
        competitorCount={competitorCount || 0}
        changeCount7d={(recentChanges || []).length}
        newProductCount7d={
          (recentChanges || []).filter((c: any) => c.change_type === "new_product").length
        }
        activeAlertCount={activeAlertCount || 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentChanges changes={(recentChanges || []) as any} />
        <TopMovers changes={(recentChanges || []) as any} />
      </div>

      <CompetitorStatusCards competitors={(competitors || []) as any} />
    </div>
  );
}
