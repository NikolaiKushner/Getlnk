"use client";

import { useEffect, useState } from "react";
import type { Link } from "@/db/schema";

type Stats = {
  pageViews: number;
  totalPageViews: number;
  linkClicks: number;
  topLinks: Link[];
};

export function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/analytics/stats?days=${days}`);
      const json = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(json.error || "Failed to load");
        return;
      }
      setStats(json.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Period</label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Page views" value={stats.pageViews} />
        <StatCard label="Link clicks" value={stats.linkClicks} />
        <StatCard label="All-time views" value={stats.totalPageViews} />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Top links</h2>
        <ul className="mt-3 space-y-2">
          {stats.topLinks.map((link) => (
            <li key={link.id} className="flex justify-between text-sm">
              <span className="truncate text-gray-800">{link.title}</span>
              <span className="text-gray-500">{link.clicks} clicks</span>
            </li>
          ))}
          {!stats.topLinks.length && (
            <li className="text-sm text-gray-500">No links yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
