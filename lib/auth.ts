import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { links, publicProfiles, userProfiles, type UserProfile } from "@/db/schema";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session.user.id;
}

export async function ensureUserProfile(): Promise<UserProfile | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const existingById = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, userId),
  });
  if (existingById) return existingById;

  const email = session.user?.email;
  if (!email) return null;

  const fullName = session.user?.name ?? null;
  const avatarUrl = session.user?.image ?? null;

  // Migrate legacy Clerk (or other) rows that share this email but different id
  const existingByEmail = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.email, email),
  });

  if (existingByEmail && existingByEmail.id !== userId) {
    const oldId = existingByEmail.id;
    await db
      .update(publicProfiles)
      .set({ userId, updatedAt: new Date() })
      .where(eq(publicProfiles.userId, oldId));
    await db
      .update(links)
      .set({ userId, updatedAt: new Date() })
      .where(eq(links.userId, oldId));
    await db.delete(userProfiles).where(eq(userProfiles.id, oldId));
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userProfiles);

  const [created] = await db
    .insert(userProfiles)
    .values({
      id: userId,
      email,
      fullName,
      avatarUrl,
      role:
        existingByEmail?.role ??
        ((count ?? 0) === 0 ? "superadmin" : "regular"),
      onboardingCompleted: existingByEmail?.onboardingCompleted ?? false,
    })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: {
        email,
        fullName,
        avatarUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  return created;
}

export async function getAuthUser(): Promise<UserProfile | null> {
  return ensureUserProfile();
}

export function isSuperAdmin(profile: UserProfile | null | undefined) {
  return profile?.role === "superadmin";
}
