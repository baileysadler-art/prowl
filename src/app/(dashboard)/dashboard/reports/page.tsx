import Link from "next/link";
import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Calendar, ArrowRight } from "lucide-react";

export const metadata = { title: "Reports" };

const statusColors: Record<string, string> = {
  generating: "bg-blue-50 text-blue-700",
  ready: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

export default async function ReportsPage() {
  const { supabase, orgId } = await getOrgId();

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Weekly and monthly intelligence reports"
      />

      {(!reports || reports.length === 0) ? (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          description="Reports are generated automatically each week. Check back soon!"
        />
      ) : (
        <div className="space-y-3">
          {(reports as any).map((report: any) => (
            <Link key={report.id} href={`/dashboard/reports/${report.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {report.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(report.period_start), "MMM d")} -{" "}
                        {format(new Date(report.period_end), "MMM d, yyyy")}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`capitalize ${statusColors[report.status]}`}
                      >
                        {report.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {report.report_type}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
