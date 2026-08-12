"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import type { UserProfile } from "@/db/schema";

export function AdminUsersPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to load users");
      return;
    }
    setUsers(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(userId: string, role: "regular" | "superadmin") {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (!res.ok) return;
    await load();
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50 text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Onboarding</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-50">
              <td className="px-4 py-3 text-gray-900">{user.email}</td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">
                {user.onboardingCompleted ? "done" : "pending"}
              </td>
              <td className="px-4 py-3">
                {user.role === "superadmin" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setRole(user.id, "regular")}
                  >
                    Demote
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setRole(user.id, "superadmin")}
                  >
                    Make admin
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
