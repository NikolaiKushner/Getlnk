import { redirect } from "next/navigation";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import { DashboardNav } from "@/components/DashboardNav";
import { ensureUserProfile, isSuperAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const profile = await ensureUserProfile();
  if (!profile) redirect("/sign-in");
  if (!isSuperAdmin(profile)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav active="/admin" isAdmin />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin</h1>
        <AdminUsersPanel />
      </main>
    </div>
  );
}
