import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Package, Bell } from "lucide-react";

interface KpiCardsProps {
  competitorCount: number;
  changeCount7d: number;
  newProductCount7d: number;
  activeAlertCount: number;
}

const kpis = [
  {
    key: "competitors",
    label: "Competitors Tracked",
    icon: Users,
    color: "text-blue-600 bg-blue-50",
  },
  {
    key: "changes",
    label: "Price Changes (7d)",
    icon: TrendingUp,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "products",
    label: "New Products (7d)",
    icon: Package,
    color: "text-purple-600 bg-purple-50",
  },
  {
    key: "alerts",
    label: "Active Alerts",
    icon: Bell,
    color: "text-amber-600 bg-amber-50",
  },
] as const;

export function KpiCards({
  competitorCount,
  changeCount7d,
  newProductCount7d,
  activeAlertCount,
}: KpiCardsProps) {
  const values = {
    competitors: competitorCount,
    changes: changeCount7d,
    products: newProductCount7d,
    alerts: activeAlertCount,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.key}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}
              >
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {values[kpi.key]}
                </p>
                <p className="text-xs text-slate-500">{kpi.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
