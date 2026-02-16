"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { severityColors, changeTypeLabels, changeTypeColors } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { Check, Bell, Filter } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: string;
  change_type: string | null;
  is_read: boolean;
  created_at: string;
  competitor_id: string | null;
  competitors: { name: string } | null;
}

export function AlertsFeed({ alerts: initialAlerts }: { alerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const supabase = createClient();

  const filtered = alerts.filter((a) => {
    const matchesType = filter === "all" || a.change_type === filter;
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "unread" && !a.is_read) ||
      (readFilter === "read" && a.is_read);
    return matchesType && matchesRead;
  });

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("alerts")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
    }
  }

  async function markAllRead() {
    const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("alerts")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (!error) {
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      toast.success("All alerts marked as read");
    }
  }

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="price_increase">Price Increase</SelectItem>
            <SelectItem value="price_decrease">Price Decrease</SelectItem>
            <SelectItem value="new_product">New Product</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="sale_started">Sale Started</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Read status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="ml-auto">
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => (
          <Card
            key={alert.id}
            className={`transition-colors ${
              !alert.is_read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Bell
                    className={`h-4 w-4 ${
                      alert.severity === "critical"
                        ? "text-red-600"
                        : alert.severity === "warning"
                          ? "text-amber-600"
                          : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {alert.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${severityColors[alert.severity] || ""}`}
                    >
                      {alert.severity}
                    </Badge>
                    {alert.change_type && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${changeTypeColors[alert.change_type] || ""}`}
                      >
                        {changeTypeLabels[alert.change_type] || alert.change_type}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    {alert.competitors?.name && (
                      <span>{alert.competitors.name}</span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(alert.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                {!alert.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(alert.id)}
                    className="shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            No alerts match your filters
          </div>
        )}
      </div>
    </div>
  );
}
