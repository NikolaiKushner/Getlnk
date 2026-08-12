import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { ensureUserProfile, isSuperAdmin } from "@/lib/auth";

export async function GET() {
  const profile = await ensureUserProfile();
  if (!profile || !isSuperAdmin(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.query.userProfiles.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return NextResponse.json({ data: users });
}

export async function POST(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile || !isSuperAdmin(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const userId = String(body.userId ?? "");
  const role = body.role === "superadmin" ? "superadmin" : "regular";
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const [updated] = await db
    .update(userProfiles)
    .set({ role, updatedAt: new Date() })
    .where(eq(userProfiles.id, userId))
    .returning();

  return NextResponse.json({ data: updated });
}
