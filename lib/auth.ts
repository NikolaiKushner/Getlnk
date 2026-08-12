import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles, type UserProfile } from "@/db/schema";

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

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, userId),
  });
  if (existing) return existing;

  const email = session.user?.email;
  if (!email) return null;

  const fullName = session.user?.name ?? null;
  const avatarUrl = session.user?.image ?? null;

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
      role: (count ?? 0) === 0 ? "superadmin" : "regular",
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
