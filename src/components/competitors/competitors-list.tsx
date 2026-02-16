"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { formatDistanceToNow } from "date-fns";
import {
  Globe,
  Package,
  Clock,
  MoreHorizontal,
  ExternalLink,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/lib/supabase/types";

interface CompetitorsListProps {
  competitors: Tables<"competitors">[];
  competitorLimit: number;
  planTier: string;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  paused: "bg-slate-50 text-slate-700",
  error: "bg-red-50 text-red-700",
};

export function CompetitorsList({
  competitors,
  competitorLimit,
  planTier,
}: CompetitorsListProps) {
  const [search, setSearch] = useState("");

  const filtered = competitors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.website_url.toLowerCase().includes(search.toLowerCase())
  );

  const atLimit = competitors.length >= competitorLimit && competitorLimit > 0;

  return (
    <div className="space-y-4">
      {atLimit && (
        <UpgradePrompt
          message={`You've reached your limit of ${competitorLimit} competitors`}
          currentPlan={planTier}
        />
      )}

      <SearchInput
        placeholder="Search competitors..."
        onChange={setSearch}
        className="max-w-sm"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((competitor) => (
          <Link
            key={competitor.id}
            href={`/dashboard/competitors/${competitor.id}`}
          >
            <Card className="transition-shadow hover:shadow-md h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Globe className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {competitor.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {competitor.website_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${statusColors[competitor.status]}`}
                    >
                      {competitor.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit Website
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {competitor.status === "active" ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" /> Resume
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
                      : "Never scraped"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
