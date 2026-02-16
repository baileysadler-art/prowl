"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { sidebarNav, planTierLabels, planTierColors } from "@/lib/constants";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  planTier?: string;
  unreadAlerts?: number;
}

export function MobileSidebar({
  open,
  onClose,
  planTier = "starter",
  unreadAlerts = 0,
}: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-16 flex-row items-center gap-2 border-b border-slate-200 px-6">
          <SheetTitle className="text-xl font-bold text-slate-900">
            <span className="gradient-text">Prowl</span>
          </SheetTitle>
          <Badge
            variant="secondary"
            className={cn("text-xs", planTierColors[planTier])}
          >
            {planTierLabels[planTier] || "Starter"}
          </Badge>
        </SheetHeader>

        <nav className="space-y-1 px-3 py-4">
          {sidebarNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
                {item.title === "Alerts" && unreadAlerts > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                    {unreadAlerts > 99 ? "99+" : unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
