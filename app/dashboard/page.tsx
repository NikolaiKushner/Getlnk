import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { DashboardNav } from "@/components/DashboardNav";
import { LinksEditor } from "@/components/LinksEditor";
import { db } from "@/db";
import { links, publicProfiles } from "@/db/schema";
import { ensureUserProfile, isSuperAdmin } from "@/lib/auth";

export default async function DashboardPage() {
  const profile = await ensureUserProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.onboardingCompleted) redirect("/onboarding");

  const publicProfile = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.userId, profile.id),
  });
  if (!publicProfile) redirect("/onboarding");

  const userLinks = await db.query.links.findMany({
    where: eq(links.userId, profile.id),
    orderBy: [asc(links.position)],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav active="/dashboard" isAdmin={isSuperAdmin(profile)} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Manage your public page at getlnk.xyz/@{publicProfile.username}
          </p>
        </div>
        <LinksEditor initialProfile={publicProfile} initialLinks={userLinks} />
      </main>
    </div>
  );
}
