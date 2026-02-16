import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase, user } = await getOrgId();

  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = userProfile as any;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and organization"
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing" asChild>
            <Link href="/dashboard/settings/billing">Billing</Link>
          </TabsTrigger>
          <TabsTrigger value="notifications" asChild>
            <Link href="/dashboard/settings/notifications">Notifications</Link>
          </TabsTrigger>
          <TabsTrigger value="team" asChild>
            <Link href="/dashboard/settings/team">Team</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          {profile && (
            <ProfileForm
              user={{
                id: profile.id,
                full_name: profile.full_name,
                email: profile.email,
                orgName: "",
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
