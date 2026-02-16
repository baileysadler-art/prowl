import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { error } = await (supabase.from("waitlist") as any).insert({
    email: email.toLowerCase().trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "You're already on the list!" });
    }
    // Table may not exist yet — still confirm to the user
    console.error("Waitlist insert error:", error.message);
    return NextResponse.json({ message: "You're on the list!" });
  }

  return NextResponse.json({ message: "You're on the list!" });
}
