"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function DeleteAccountButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!confirm("Delete your account and all data permanently?")) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/settings/delete-account", { method: "POST" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Failed to delete account");
      setLoading(false);
      return;
    }
    router.push("/sign-out");
    router.refresh();
  }

  return (
    <div>
      <Button variant="danger" disabled={loading} onClick={onDelete}>
        {loading ? "Deleting…" : "Delete account"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
