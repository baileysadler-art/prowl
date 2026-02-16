import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Calendar, TrendingUp, Package, DollarSign, AlertCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

interface ReportSummary {
  total_products?: number;
  total_changes?: number;
  price_increases?: number;
  price_decreases?: number;
  new_products?: number;
  out_of_stock?: number;
  avg_price_change?: number;
  top_movers?: {
    product: string;
    competitor: string;
    change: number;
  }[];
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await getOrgId();

  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  const report = data as any;
  if (!report) {
    notFound();
  }

  const summary = (report.summary as ReportSummary) || {};

  return (
    <div className="space-y-6">
      <PageHeader title={report.title}>
        <Link href="/dashboard/reports">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Calendar className="h-4 w-4" />
        {format(new Date(report.period_start), "MMM d")} -{" "}
        {format(new Date(report.period_end), "MMM d, yyyy")}
        <Badge variant="outline" className="capitalize">
          {report.report_type}
        </Badge>
      </div>

      {report.status === "generating" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-500">
              This report is still being generated. Check back shortly.
            </p>
          </CardContent>
        </Card>
      ) : report.status === "failed" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-2 text-sm text-slate-500">
              This report failed to generate. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{summary.total_products || 0}</p>
                    <p className="text-xs text-slate-500">Products Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold">{summary.total_changes || 0}</p>
                    <p className="text-xs text-slate-500">Total Changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{summary.price_increases || 0}</p>
                    <p className="text-xs text-slate-500">Price Increases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold">{summary.price_decreases || 0}</p>
                    <p className="text-xs text-slate-500">Price Decreases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {summary.top_movers && summary.top_movers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Movers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.top_movers.map((mover, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-slate-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {mover.product}
                        </p>
                        <p className="text-xs text-slate-500">
                          {mover.competitor}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          mover.change > 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {mover.change > 0 ? "+" : ""}
                        {mover.change.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
