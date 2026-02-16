import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceComparisonChart } from "@/components/charts/price-comparison-chart";
import { ChangeHistogram } from "@/components/charts/change-histogram";
import { CategoryBreakdown } from "@/components/charts/category-breakdown";
import { EmptyState } from "@/components/shared/empty-state";
import { DollarSign } from "lucide-react";

export const metadata = { title: "Pricing Analysis" };

export default async function PricingPage() {
  const { supabase, orgId } = await getOrgId();

  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, name")
    .eq("organization_id", orgId);

  const { data: products } = await supabase
    .from("products")
    .select("category, competitor_id, competitors!inner(organization_id)")
    .eq("competitors.organization_id", orgId);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: changes } = await supabase
    .from("product_changes")
    .select("change_type, products!inner(competitors!inner(organization_id))")
    .eq("products.competitors.organization_id", orgId)
    .gte("detected_at", thirtyDaysAgo);

  // Fetch price history for comparison chart
  const competitorData: { name: string; data: { date: string; price: number }[] }[] = [];
  if (competitors) {
    for (const comp of (competitors as any).slice(0, 5)) {
      const { data: history } = await supabase
        .from("price_history")
        .select("price, recorded_at, products!inner(competitor_id)")
        .eq("products.competitor_id", comp.id)
        .order("recorded_at", { ascending: true })
        .limit(50);

      if (history && (history as any).length > 0) {
        competitorData.push({
          name: comp.name,
          data: (history as any).map((h: any) => ({
            date: h.recorded_at,
            price: h.price,
          })),
        });
      }
    }
  }

  // Build category breakdown
  const categoryMap = new Map<string, number>();
  (products as any)?.forEach((p: any) => {
    const cat = p.category || "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });
  const categoryData = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Build change type histogram
  const changeMap = new Map<string, number>();
  (changes as any)?.forEach((c: any) => {
    changeMap.set(c.change_type, (changeMap.get(c.change_type) || 0) + 1);
  });
  const changeData = Array.from(changeMap.entries()).map(
    ([change_type, count]) => ({ change_type, count })
  );

  const hasData = products && products.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Analysis"
        description="Compare pricing across competitors and analyze trends"
      />

      {!hasData ? (
        <EmptyState
          icon={DollarSign}
          title="No pricing data yet"
          description="Add competitors and run your first scrape to see pricing analytics"
        />
      ) : (
        <>
          {competitorData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Price Trends by Competitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriceComparisonChart competitors={competitorData} />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {changeData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Changes by Type (30d)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChangeHistogram data={changeData} />
                </CardContent>
              </Card>
            )}

            {categoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Products by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBreakdown data={categoryData} />
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
