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

async function migrateLegacyProfile(opts: {
  oldId: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserProfile["role"];
  onboardingCompleted: boolean;
}): Promise<UserProfile> {
  const { oldId, userId, email, fullName, avatarUrl, role, onboardingCompleted } =
    opts;

  // Free the unique email, create the Google-id row, retarget FKs, drop legacy.
  await db
    .update(userProfiles)
    .set({
      email: `__legacy_${oldId}@migrating.invalid`,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.id, oldId));

  const [created] = await db
    .insert(userProfiles)
    .values({
      id: userId,
      email,
      fullName,
      avatarUrl,
      role,
      onboardingCompleted,
    })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: {
        email,
        fullName,
        avatarUrl,
        role,
        onboardingCompleted,
        updatedAt: new Date(),
      },
    })
    .returning();

  await db
    .update(publicProfiles)
    .set({ userId, updatedAt: new Date() })
    .where(eq(publicProfiles.userId, oldId));
  await db
    .update(links)
    .set({ userId, updatedAt: new Date() })
    .where(eq(links.userId, oldId));
  await db.delete(userProfiles).where(eq(userProfiles.id, oldId));

  return created;
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

  const existingByEmail = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.email, email),
  });

  if (existingByEmail && existingByEmail.id !== userId) {
    return migrateLegacyProfile({
      oldId: existingByEmail.id,
      userId,
      email,
      fullName,
      avatarUrl,
      role: existingByEmail.role,
      onboardingCompleted: existingByEmail.onboardingCompleted,
    });
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
