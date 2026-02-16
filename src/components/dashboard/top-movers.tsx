import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

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

export function TopMovers({ changes }: { changes: Change[] }) {
  const priceChanges = changes
    .filter(
      (c) =>
        (c.change_type === "price_increase" ||
          c.change_type === "price_decrease") &&
        c.percentage_change !== null
    )
    .sort(
      (a, b) =>
        Math.abs(b.percentage_change || 0) - Math.abs(a.percentage_change || 0)
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Movers</CardTitle>
      </CardHeader>
      <CardContent>
        {priceChanges.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No price movements detected yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Competitor</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceChanges.map((change) => (
                <TableRow key={change.id}>
                  <TableCell className="font-medium max-w-[150px] truncate">
                    {change.products.name}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {change.products.competitors.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        (change.percentage_change || 0) > 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {(change.percentage_change || 0) > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(change.percentage_change || 0).toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
