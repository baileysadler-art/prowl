import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { AlertRulesManager } from "@/components/alerts/alert-rules-manager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Alert Settings" };

export default async function AlertSettingsPage() {
  const { supabase, orgId } = await getOrgId();

  const { data: alertConfigs } = await supabase
    .from("alert_configs")
    .select("*, competitors(name)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, name")
    .eq("organization_id", orgId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert Settings"
        description="Configure when and how you receive alerts"
      >
        <Link href="/dashboard/alerts">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Alerts
          </Button>
        </Link>
      </PageHeader>

      <AlertRulesManager
        alertConfigs={(alertConfigs || []) as any}
        competitors={(competitors || []) as any}
        organizationId={orgId}
      />
    </div>
  );
}
