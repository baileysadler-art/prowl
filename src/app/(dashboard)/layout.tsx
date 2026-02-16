import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { RealtimeAlertsProvider } from "@/components/providers/realtime-alerts-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  const profile = userProfile as any;
  const orgId = profile?.organization_id as string | undefined;

  // Fetch subscription
  const { data: subscription } = orgId
    ? await supabase
        .from("subscriptions")
        .select("*")
        .eq("organization_id", orgId)
        .single()
    : { data: null };

  // Fetch unread alerts count
  const { count: unreadAlerts } = orgId
    ? await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("is_read", false)
    : { count: 0 };

  const planTier = (subscription as any)?.plan_tier || "starter";

  return (
    <div className="min-h-screen mesh-gradient">
      <Sidebar planTier={planTier} unreadAlerts={unreadAlerts || 0} />
      <div className="lg:pl-60">
        <Header
          user={
            profile
              ? { email: profile.email, full_name: profile.full_name }
              : null
          }
          unreadAlerts={unreadAlerts || 0}
          planTier={planTier}
        />
        <main className="p-6 lg:p-8">
          {orgId ? (
            <RealtimeAlertsProvider orgId={orgId}>
              {children}
            </RealtimeAlertsProvider>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
