import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { DashboardNav } from "@/components/DashboardNav";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { db } from "@/db";
import { publicProfiles } from "@/db/schema";
import { ensureUserProfile, isSuperAdmin } from "@/lib/auth";

export default async function SettingsPage() {
  const profile = await ensureUserProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.onboardingCompleted) redirect("/onboarding");

  const publicProfile = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.userId, profile.id),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav active="/settings" isAdmin={isSuperAdmin(profile)} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Account</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{profile.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Username</dt>
              <dd className="text-gray-900">
                {publicProfile ? `@${publicProfile.username}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Role</dt>
              <dd className="text-gray-900">{profile.role}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-2xl border border-red-200 bg-white p-5">
          <h2 className="font-semibold text-red-700">Danger zone</h2>
          <p className="mt-2 text-sm text-gray-600">
            Permanently delete your account, profile, links, and analytics.
          </p>
          <div className="mt-4">
            <DeleteAccountButton />
          </div>
        </section>
      </main>
    </div>
  );
}
