"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  url: string;
  current_price: number | null;
  original_price: number | null;
  currency: string;
  in_stock: boolean;
  is_on_sale: boolean;
  category: string | null;
  competitor_id: string;
  competitors: {
    name: string;
  };
}

const PAGE_SIZE = 15;

export function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [saleFilter, setSaleFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase()) ||
      p.competitors.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in_stock" && p.in_stock) ||
      (statusFilter === "out_of_stock" && !p.in_stock);
    const matchesSale =
      saleFilter === "all" ||
      (saleFilter === "on_sale" && p.is_on_sale) ||
      (saleFilter === "regular" && !p.is_on_sale);
    return matchesSearch && matchesStatus && matchesSale;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search products or competitors..."
          onChange={(v) => { setSearch(v); setPage(0); }}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={saleFilter} onValueChange={(v) => { setSaleFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sale" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="on_sale">On Sale</SelectItem>
            <SelectItem value="regular">Regular Price</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-slate-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Competitor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="hover:underline"
                  >
                    <span className="font-medium text-slate-900 max-w-[250px] truncate block">
                      {product.name}
                    </span>
                  </Link>
                  {product.category && (
                    <span className="text-xs text-slate-500">
                      {product.category}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-slate-600">
                  {product.competitors.name}
                </TableCell>
                <TableCell>
                  <span className="font-medium">
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
                  {product.is_on_sale && (
                    <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">
                      Sale
                    </Badge>
                  )}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
