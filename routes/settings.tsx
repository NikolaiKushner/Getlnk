import { define } from "../utils.ts";
import { Head } from "fresh/runtime";
import { getAuthUser, isSuperAdmin } from "../lib/auth.ts";
import type { AuthUser } from "../lib/auth.ts";
import ProfileForm from "../islands/ProfileForm.tsx";
import SettingsForm from "../islands/SettingsForm.tsx";
import DashboardNav from "../components/DashboardNav.tsx";

export default define.page(async function Settings(ctx) {
  const authUser = await getAuthUser(ctx.req) as AuthUser | null;

  if (!authUser) {
    return new Response("", {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  const { user, profile } = authUser;
  const isAdmin = isSuperAdmin(profile);

  return (
    <>
      <Head>
        <title>Settings - Getlnk</title>
      </Head>
      <div class="min-h-screen bg-gray-50">
        <DashboardNav
          activeTab="settings"
          userName={profile.full_name || user.email || ""}
          isAdmin={isAdmin}
          plan={profile.plan || "free"}
        />

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <ProfileForm
            email={user.email!}
            fullName={profile.full_name}
            role={profile.role}
            createdAt={profile.created_at}
          />

          <SettingsForm />

          {isAdmin && (
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                Admin Actions
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="/admin/users"
                  class="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium touch-manipulation"
                >
                  Manage Users
                </a>
                <a
                  href="/admin/settings"
                  class="flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium touch-manipulation"
                >
                  System Settings
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
});
