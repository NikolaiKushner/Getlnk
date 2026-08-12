import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { publicProfiles, userProfiles } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth";
import { sanitizeText, validateUsername } from "@/lib/validators";

export async function GET() {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.userId, profile.id),
  });

  return NextResponse.json({ data: data ?? null });
}

export async function POST(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const username = String(body.username ?? "").toLowerCase().trim();
  const usernameError = validateUsername(username);
  if (usernameError) {
    return NextResponse.json({ error: usernameError }, { status: 400 });
  }

  const existingUsername = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.username, username),
  });
  if (existingUsername && existingUsername.userId !== profile.id) {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }

  const existing = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.userId, profile.id),
  });

  const payload = {
    username,
    displayName: body.displayName
      ? sanitizeText(String(body.displayName), 80)
      : profile.fullName,
    bio: body.bio !== undefined ? sanitizeText(String(body.bio), 500) : existing?.bio,
    theme: body.theme ? String(body.theme) : existing?.theme ?? "default",
    isPublished:
      body.isPublished !== undefined
        ? Boolean(body.isPublished)
        : existing?.isPublished ?? false,
    socialLinks:
      body.socialLinks && typeof body.socialLinks === "object"
        ? (body.socialLinks as Record<string, string>)
        : existing?.socialLinks ?? {},
    updatedAt: new Date(),
  };

  let data;
  if (existing) {
    [data] = await db
      .update(publicProfiles)
      .set(payload)
      .where(eq(publicProfiles.userId, profile.id))
      .returning();
  } else {
    [data] = await db
      .insert(publicProfiles)
      .values({
        userId: profile.id,
        ...payload,
      })
      .returning();
  }

  if (body.onboardingComplete) {
    await db
      .update(userProfiles)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(userProfiles.id, profile.id));
  }

  return NextResponse.json({ data });
}
