import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Globe, Package, Clock, ExternalLink } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

interface CompetitorStatusCardsProps {
  competitors: Tables<"competitors">[];
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paused: "bg-slate-50 text-slate-700 border-slate-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export function CompetitorStatusCards({
  competitors,
}: CompetitorStatusCardsProps) {
  if (competitors.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        Competitor Status
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competitors.map((competitor) => (
          <Link
            key={competitor.id}
            href={`/dashboard/competitors/${competitor.id}`}
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Globe className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {competitor.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {competitor.website_url}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${statusColors[competitor.status]}`}
                  >
                    {competitor.status}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {competitor.product_count} products
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {competitor.last_scraped_at
                      ? formatDistanceToNow(
                          new Date(competitor.last_scraped_at),
                          { addSuffix: true }
                        )
                      : "Never"}
                  </span>
                  <ExternalLink className="ml-auto h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
