"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface RealtimeAlertsProviderProps {
  orgId: string;
  children: React.ReactNode;
}

export function RealtimeAlertsProvider({ orgId, children }: RealtimeAlertsProviderProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleNewAlert = useCallback(
    (payload: any) => {
      const alert = payload.new;
      if (!alert) return;

      const severity = alert.severity as string;
      if (severity === "critical") {
        toast.error(alert.title, {
          description: alert.message,
          duration: 8000,
        });
      } else if (severity === "warning") {
        toast.warning(alert.title, {
          description: alert.message,
          duration: 6000,
        });
      } else {
        toast.info(alert.title, {
          description: alert.message,
          duration: 5000,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["unread-alerts"] });
    },
    [queryClient]
  );

  useEffect(() => {
    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `organization_id=eq.${orgId}`,
        },
        handleNewAlert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, orgId, handleNewAlert]);

  return <>{children}</>;
}
