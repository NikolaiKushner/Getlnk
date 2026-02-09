import { define } from "../utils.ts";
import { Head } from "fresh/runtime";
import { getAuthUser, isSuperAdmin } from "../lib/auth.ts";
import type { AuthUser } from "../lib/auth.ts";
import { createSupabaseClient } from "../lib/supabase.ts";
import type { Link, PublicProfile } from "../lib/database.types.ts";
import { getPlanLimits } from "../lib/plans.ts";
import OnboardingWizard from "../islands/OnboardingWizard.tsx";
import LinksEditor from "../islands/LinksEditor.tsx";
import DashboardNav from "../components/DashboardNav.tsx";

export default define.page(async function Dashboard(ctx) {
  const authUser = await getAuthUser(ctx.req) as AuthUser | null;

  if (!authUser) {
    return new Response("", {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  const { user, profile, session } = authUser;
  const isAdmin = isSuperAdmin(profile);
  const userPlan = profile.plan || "free";
  const planLimits = getPlanLimits(userPlan);

  const supabase = createSupabaseClient(session.accessToken);
  const { data: publicProfileData } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const publicProfile = publicProfileData as PublicProfile | null;

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const profileWithOnboarding = profile as { onboarding_completed?: boolean };
  const showOnboarding = !profileWithOnboarding.onboarding_completed;

  return (
    <>
      <Head>
        <title>Links - Getlnk</title>
      </Head>
      <div class="min-h-screen bg-gray-50">
        <DashboardNav
          activeTab="links"
          userName={profile.full_name || user.email || ""}
          isAdmin={isAdmin}
          plan={userPlan}
        />

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {showOnboarding && (
            <div class="mb-8">
              <OnboardingWizard
                initialUsername={publicProfile?.username ?? null}
                hasLinks={(links?.length ?? 0) > 0}
              />
            </div>
          )}
          {!showOnboarding && (
            <LinksEditor
              initialProfile={publicProfile}
              initialLinks={(links as Link[]) || []}
              showQuickView
              plan={userPlan}
              planLimits={{
                maxLinks: planLimits.maxLinks,
                maxSocialLinks: planLimits.maxSocialLinks,
                maxBioLength: planLimits.maxBioLength,
                allowedThemes: planLimits.allowedThemes,
                removeBranding: planLimits.removeBranding,
              }}
            />
          )}
        </main>
      </div>
    </>
  );
});
