import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles, type UserProfile } from "@/db/schema";

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return userId;
}

export async function ensureUserProfile(): Promise<UserProfile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, userId),
  });
  if (existing) return existing;

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.fullName ||
    null;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userProfiles);

  const [created] = await db
    .insert(userProfiles)
    .values({
      id: userId,
      email,
      fullName,
      avatarUrl: user?.imageUrl ?? null,
      role: (count ?? 0) === 0 ? "superadmin" : "regular",
    })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: {
        email,
        fullName,
        avatarUrl: user?.imageUrl ?? null,
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
