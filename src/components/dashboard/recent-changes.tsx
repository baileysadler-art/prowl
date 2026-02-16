import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { changeTypeLabels, changeTypeColors } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Package, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Change {
  id: string;
  change_type: string;
  old_value: string | null;
  new_value: string | null;
  percentage_change: number | null;
  detected_at: string;
  products: {
    name: string;
    url: string;
    competitors: {
      name: string;
    };
  };
}

function ChangeIcon({ type }: { type: string }) {
  switch (type) {
    case "price_increase":
      return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    case "price_decrease":
      return <ArrowDownRight className="h-4 w-4 text-emerald-600" />;
    case "new_product":
      return <Package className="h-4 w-4 text-blue-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
  }
}

export function RecentChanges({ changes }: { changes: Change[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Changes</CardTitle>
        <Link
          href="/dashboard/alerts"
          className="text-xs text-blue-600 hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No changes detected yet
          </p>
        ) : (
          <div className="space-y-4">
            {changes.slice(0, 5).map((change) => (
              <div key={change.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <ChangeIcon type={change.change_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {change.products.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${changeTypeColors[change.change_type] || ""}`}
                    >
                      {changeTypeLabels[change.change_type] || change.change_type}
                    </Badge>
                    {change.old_value && change.new_value && (
                      <span className="text-xs text-slate-500">
                        {change.old_value} → {change.new_value}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {change.products.competitors.name} &middot;{" "}
                    {formatDistanceToNow(new Date(change.detected_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {change.percentage_change !== null && (
                  <span
                    className={`text-sm font-medium ${
                      change.percentage_change > 0
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {change.percentage_change > 0 ? "+" : ""}
                    {change.percentage_change.toFixed(1)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
