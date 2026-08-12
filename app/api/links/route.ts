import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { links } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth";
import { isValidUrl, sanitizeText } from "@/lib/validators";

export async function GET() {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db.query.links.findMany({
    where: eq(links.userId, profile.id),
    orderBy: [asc(links.position)],
  });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = sanitizeText(String(body.title ?? ""), 100);
  const url = String(body.url ?? "").trim();
  const icon = body.icon ? sanitizeText(String(body.icon), 50) : null;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(links)
    .where(eq(links.userId, profile.id));

  const [created] = await db
    .insert(links)
    .values({
      userId: profile.id,
      title,
      url,
      icon,
      position: count ?? 0,
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PUT(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "Link id required" }, { status: 400 });
  }

  const existing = await db.query.links.findFirst({
    where: and(eq(links.id, id), eq(links.userId, profile.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Partial<typeof links.$inferInsert> = { updatedAt: new Date() };
  if (body.title !== undefined) updates.title = sanitizeText(String(body.title), 100);
  if (body.url !== undefined) {
    const url = String(body.url).trim();
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }
    updates.url = url;
  }
  if (body.icon !== undefined) {
    updates.icon = body.icon ? sanitizeText(String(body.icon), 50) : null;
  }
  if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);

  const [updated] = await db
    .update(links)
    .set(updates)
    .where(and(eq(links.id, id), eq(links.userId, profile.id)))
    .returning();

  return NextResponse.json({ data: updated });
}

export async function DELETE(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Link id required" }, { status: 400 });
  }

  await db
    .delete(links)
    .where(and(eq(links.id, id), eq(links.userId, profile.id)));

  return NextResponse.json({ data: { ok: true } });
}
