import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { Package, TrendingUp, Clock, Globe } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

interface CompetitorOverviewProps {
  competitor: Tables<"competitors">;
  productCount: number;
  changeCount: number;
  pages: Tables<"competitor_pages">[];
}

export function CompetitorOverview({
  competitor,
  productCount,
  changeCount,
  pages,
}: CompetitorOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {productCount}
                </p>
                <p className="text-xs text-slate-500">Products Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {changeCount}
                </p>
                <p className="text-xs text-slate-500">Changes Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {competitor.last_scraped_at
                    ? formatDistanceToNow(
                        new Date(competitor.last_scraped_at),
                        { addSuffix: true }
                      )
                    : "Never"}
                </p>
                <p className="text-xs text-slate-500">Last Scraped</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Website</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {competitor.website_url}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">
                Scrape Frequency
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {competitor.scrape_frequency}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Added</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {format(new Date(competitor.created_at), "MMM d, yyyy")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Status</dt>
              <dd className="mt-1">
                <Badge variant="secondary">{competitor.status}</Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monitored Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center gap-3 rounded-md border border-slate-100 p-3"
                >
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">
                      {page.url}
                    </p>
                    <p className="text-xs text-slate-500">{page.page_type}</p>
                  </div>
                  <Badge variant={page.is_active ? "default" : "secondary"}>
                    {page.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
