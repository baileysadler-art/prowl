import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

const jobStatusColors: Record<string, string> = {
  pending: "bg-slate-50 text-slate-700",
  running: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

export function CompetitorActivity({
  jobs,
}: {
  jobs: Tables<"scrape_jobs">[];
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Scraping activity will be logged here"
      />
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Pages</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Changes</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const duration =
              job.started_at && job.completed_at
                ? Math.round(
                    (new Date(job.completed_at).getTime() -
                      new Date(job.started_at).getTime()) /
                      1000
                  )
                : null;

            return (
              <TableRow key={job.id}>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={jobStatusColors[job.status]}
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{job.pages_scraped}</TableCell>
                <TableCell>{job.products_found}</TableCell>
                <TableCell>{job.changes_detected}</TableCell>
                <TableCell className="text-slate-500">
                  {duration !== null ? `${duration}s` : "—"}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {format(new Date(job.created_at), "MMM d, HH:mm")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
