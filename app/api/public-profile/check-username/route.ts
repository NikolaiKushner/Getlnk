import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { publicProfiles } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth";
import { validateUsername } from "@/lib/validators";

export async function GET(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = new URL(req.url).searchParams.get("username")?.toLowerCase().trim() ?? "";
  const error = validateUsername(username);
  if (error) {
    return NextResponse.json({ available: false, error });
  }

  const existing = await db.query.publicProfiles.findFirst({
    where: and(
      eq(publicProfiles.username, username),
      ne(publicProfiles.userId, profile.id),
    ),
  });

  return NextResponse.json({ available: !existing });
}
