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
import { changeTypeLabels, changeTypeColors } from "@/lib/constants";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

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
  };
}

export function CompetitorChanges({ changes }: { changes: Change[] }) {
  if (changes.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No changes detected"
        description="Price and product changes will appear here once detected"
      />
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
            <TableHead>% Change</TableHead>
            <TableHead>Detected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changes.map((change) => (
            <TableRow key={change.id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {change.products.name}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={changeTypeColors[change.change_type] || ""}
                >
                  {changeTypeLabels[change.change_type] || change.change_type}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500">
                {change.old_value || "—"}
              </TableCell>
              <TableCell className="text-slate-900">
                {change.new_value || "—"}
              </TableCell>
              <TableCell>
                {change.percentage_change !== null ? (
                  <span
                    className={
                      change.percentage_change > 0
                        ? "text-red-600"
                        : "text-emerald-600"
                    }
                  >
                    {change.percentage_change > 0 ? "+" : ""}
                    {change.percentage_change.toFixed(1)}%
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {format(new Date(change.detected_at), "MMM d, HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
