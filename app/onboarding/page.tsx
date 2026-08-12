import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/auth";
import { OnboardingForm } from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const profile = await ensureUserProfile();
  if (!profile) redirect("/sign-in");
  if (profile.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto mb-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900">Claim your username</h1>
        <p className="mt-2 text-gray-600">
          This will be your public Getlnk URL.
        </p>
      </div>
      <OnboardingForm defaultName={profile.fullName} />
    </div>
  );
}
