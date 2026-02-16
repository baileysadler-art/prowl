"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { sidebarNav, planTierLabels, planTierColors } from "@/lib/constants";

interface SidebarProps {
  planTier?: string;
  unreadAlerts?: number;
}

export function Sidebar({ planTier = "starter", unreadAlerts = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 sidebar-gradient border-r border-slate-200/60">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200/60 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="gradient-text">Prowl</span>
          </span>
        </Link>
        <Badge
          variant="secondary"
          className={cn("ml-auto text-xs", planTierColors[planTier])}
        >
          {planTierLabels[planTier] || "Starter"}
        </Badge>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 shadow-sm"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-violet-600")} />
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

      <div className="border-t border-slate-200/60 p-4">
        <div className="rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 p-3">
          <p className="text-xs font-medium text-violet-700">
            Competitor Intelligence
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Powered by Prowl
          </p>
        </div>
      </div>
    </aside>
  );
}
