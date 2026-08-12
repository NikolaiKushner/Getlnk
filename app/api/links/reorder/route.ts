import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { links } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth";

export async function POST(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const orderedIds: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];
  if (!orderedIds.length) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(links)
      .set({ position: i, updatedAt: new Date() })
      .where(and(eq(links.id, orderedIds[i]), eq(links.userId, profile.id)));
  }

  return NextResponse.json({ data: { ok: true } });
}
