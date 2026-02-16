"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ExternalLink } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

interface CompetitorProductsProps {
  products: Tables<"products">[];
}

export function CompetitorProducts({ products }: CompetitorProductsProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Products will appear here after the first scrape completes"
      />
    );
  }

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Search products..."
        onChange={setSearch}
        className="max-w-sm"
      />

      <div className="rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sale</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="max-w-[300px]">
                    <p className="font-medium text-slate-900 truncate">
                      {product.name}
                    </p>
                    {product.category && (
                      <p className="text-xs text-slate-500">
                        {product.category}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium text-slate-900">
                      {product.currency === "GBP" ? "£" : "$"}
                      {product.current_price?.toFixed(2) ?? "N/A"}
                    </span>
                    {product.original_price &&
                      product.original_price !== product.current_price && (
                        <span className="ml-2 text-xs text-slate-400 line-through">
                          {product.currency === "GBP" ? "£" : "$"}
                          {product.original_price.toFixed(2)}
                        </span>
                      )}
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  {product.is_on_sale && (
                    <Badge className="bg-rose-100 text-rose-700">
                      On Sale
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
