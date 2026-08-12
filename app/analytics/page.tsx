import { redirect } from "next/navigation";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { DashboardNav } from "@/components/DashboardNav";
import { ensureUserProfile, isSuperAdmin } from "@/lib/auth";

export default async function AnalyticsPage() {
  const profile = await ensureUserProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.onboardingCompleted) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav active="/analytics" isAdmin={isSuperAdmin(profile)} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Analytics</h1>
        <AnalyticsPanel />
      </main>
    </div>
  );
}
