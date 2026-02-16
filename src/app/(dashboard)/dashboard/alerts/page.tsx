import Link from "next/link";
import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { AlertsFeed } from "@/components/alerts/alerts-feed";
import { Bell, Settings } from "lucide-react";

export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const { supabase, orgId } = await getOrgId();

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*, competitors(name)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts" description="Stay informed about competitor changes">
        <Link href="/dashboard/alerts/settings">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Alert Settings
          </Button>
        </Link>
      </PageHeader>

      {(!alerts || alerts.length === 0) ? (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Alerts will appear here when price changes or new products are detected"
        >
          <Link href="/dashboard/alerts/settings">
            <Button variant="outline">Configure Alert Rules</Button>
          </Link>
        </EmptyState>
      ) : (
        <AlertsFeed alerts={alerts as any} />
      )}
    </div>
  );
}
