import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function getOrgId() {
  const { supabase, user } = await getAuthUser();

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.organization_id as string | undefined;

  if (!orgId) {
    redirect("/login");
  }

  return { supabase, user, orgId };
}
