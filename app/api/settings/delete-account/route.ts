import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth";

export async function POST() {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  await client.users.deleteUser(profile.id);
  await db.delete(userProfiles).where(eq(userProfiles.id, profile.id));

  return NextResponse.json({ data: { ok: true } });
}
