import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceHistoryChart } from "@/components/charts/price-history-chart";
import { CompetitorChanges } from "@/components/competitors/competitor-changes";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await getOrgId();

  const { data } = await supabase
    .from("products")
    .select("*, competitors(name, website_url)")
    .eq("id", id)
    .single();

  const product = data as any;
  if (!product) {
    notFound();
  }

  const [{ data: priceHistory }, { data: changes }] = await Promise.all([
    supabase
      .from("price_history")
      .select("*")
      .eq("product_id", id)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("product_changes")
      .select("*, products!inner(name, url)")
      .eq("product_id", id)
      .order("detected_at", { ascending: false })
      .limit(20),
  ]);

  const currencySymbol = product.currency === "GBP" ? "£" : "$";

  return (
    <div className="space-y-6">
      <PageHeader title={product.name}>
        <div className="flex items-center gap-2">
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Product
            </Button>
          </a>
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>
          by{" "}
          <Link
            href={`/dashboard/competitors/${product.competitor_id}`}
            className="text-blue-600 hover:underline"
          >
            {product.competitors?.name}
          </Link>
        </span>
        <Badge
          variant="secondary"
          className={
            product.in_stock
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }
        >
          {product.in_stock ? "In Stock" : "Out of Stock"}
        </Badge>
        {product.is_on_sale && (
          <Badge className="bg-rose-100 text-rose-700">On Sale</Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-slate-500">Current Price</p>
            <p className="text-2xl font-bold text-slate-900">
              {currencySymbol}
              {product.current_price?.toFixed(2) ?? "N/A"}
            </p>
            {product.original_price &&
              product.original_price !== product.current_price && (
                <p className="text-sm text-slate-400 line-through">
                  {currencySymbol}
                  {product.original_price.toFixed(2)}
                </p>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-slate-500">Price Records</p>
            <p className="text-2xl font-bold text-slate-900">
              {(priceHistory as any)?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-slate-500">Last Checked</p>
            <p className="text-lg font-semibold text-slate-900">
              {product.last_checked_at
                ? format(new Date(product.last_checked_at), "MMM d, HH:mm")
                : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {priceHistory && (priceHistory as any).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price History</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceHistoryChart
              data={(priceHistory as any).map((ph: any) => ({
                date: ph.recorded_at,
                price: ph.price,
              }))}
              currency={product.currency}
            />
          </CardContent>
        </Card>
      )}

      {changes && (changes as any).length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Change History
          </h2>
          <CompetitorChanges changes={(changes as any)} />
        </div>
      )}
    </div>
  );
}
