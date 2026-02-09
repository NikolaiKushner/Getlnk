import { useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { SubscriptionPlan } from "../lib/database.types.ts";

interface DailyStats {
  date: string;
  views: number;
  clicks: number;
}

interface TopLink {
  id: string;
  title: string;
  url: string;
  clicks: number;
}

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  topLinks: TopLink[];
  dailyStats: DailyStats[];
  plan?: {
    current: string;
    analyticsRetentionDays: number;
    hasReferrers: boolean;
    hasCountries: boolean;
    hasExport: boolean;
  };
}

interface AnalyticsIslandProps {
  plan?: SubscriptionPlan;
  analyticsRetentionDays?: number; // -1 = unlimited
}

function UpgradeCard(
  { feature, description, requiredPlan = "pro" }: {
    feature: string;
    description: string;
    requiredPlan?: string;
  },
) {
  return (
    <div class="bg-gradient-to-br from-gray-50 to-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
      <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
        <svg
          class="w-5 h-5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-gray-900 mb-1">{feature}</h3>
      <p class="text-xs text-gray-600 mb-3">{description}</p>
      <a
        href="/pricing"
        class="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors touch-manipulation"
      >
        Upgrade to {requiredPlan === "business" ? "Business" : "Pro"}
      </a>
    </div>
  );
}

export default function AnalyticsIsland(
  { plan = "free", analyticsRetentionDays = 7 }: AnalyticsIslandProps,
) {
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const data = useSignal<AnalyticsData | null>(null);
  const selectedPeriod = useSignal<"7" | "30" | "all">("30");

  const isFreePlan = plan === "free";
  const _isBusinessPlan = plan === "business";

  const avgViewsPerDay = useComputed(() => {
    if (!data.value || !data.value.dailyStats.length) return 0;
    return Math.round(
      data.value.totalViews / data.value.dailyStats.length,
    );
  });

  const avgClicksPerDay = useComputed(() => {
    if (!data.value || !data.value.dailyStats.length) return 0;
    return Math.round(
      data.value.totalClicks / data.value.dailyStats.length,
    );
  });

  const topLinksTotalClicks = useComputed(() => {
    if (!data.value) return 0;
    return data.value.topLinks.reduce((sum, link) => sum + link.clicks, 0);
  });

  async function fetchAnalytics(period: "7" | "30" | "all") {
    try {
      loading.value = true;
      error.value = null;

      const response = await fetch(
        `/api/analytics/stats?days=${period}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const result = await response.json();
      data.value = result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
    } finally {
      loading.value = false;
    }
  }

  useEffect(() => {
    // For free plan, default to 7 days since that's the max retention
    if (isFreePlan) {
      selectedPeriod.value = "7";
      fetchAnalytics("7");
    } else {
      fetchAnalytics(selectedPeriod.value);
    }
  }, []);

  function handlePeriodChange(period: "7" | "30" | "all") {
    selectedPeriod.value = period;
    fetchAnalytics(period);
  }

  // Check if a period exceeds plan retention
  function isPeriodLocked(period: "7" | "30" | "all"): boolean {
    if (analyticsRetentionDays === -1) return false;
    if (period === "7") return false;
    if (period === "30") return analyticsRetentionDays < 30;
    if (period === "all") return analyticsRetentionDays < 365;
    return false;
  }

  // Find min and max for scaling charts
  const maxDailyViews = data.value
    ? Math.max(...data.value.dailyStats.map((d) => d.views), 1)
    : 1;
  const maxDailyClicks = data.value
    ? Math.max(...data.value.dailyStats.map((d) => d.clicks), 1)
    : 1;

  return (
    <div class="space-y-6">
      {/* Plan retention notice for free users */}
      {isFreePlan && (
        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p class="text-sm text-indigo-800 font-medium">
              Free plan: 7-day analytics history
            </p>
            <p class="text-xs text-indigo-600 mt-0.5">
              Upgrade to Pro for 90 days, or Business for unlimited history.
            </p>
          </div>
          <a
            href="/pricing"
            class="shrink-0 ml-4 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors touch-manipulation"
          >
            Upgrade
          </a>
        </div>
      )}

      {/* Period Selector */}
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
        <div class="flex flex-wrap gap-2">
          {(
            [
              { period: "7" as const, label: "Last 7 days" },
              { period: "30" as const, label: "Last 30 days" },
              { period: "all" as const, label: "All time" },
            ] as const
          ).map(({ period, label }) => {
            const locked = isPeriodLocked(period);
            return (
              <button
                key={period}
                type="button"
                onClick={() => !locked && handlePeriodChange(period)}
                disabled={locked}
                class={`px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation ${
                  locked
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : selectedPeriod.value === period
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {label}
                {locked && (
                  <span class="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {error.value && (
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700 font-medium">Error loading analytics</p>
          <p class="text-red-600 text-sm">{error.value}</p>
        </div>
      )}

      {/* Loading State */}
      {loading.value && (
        <div class="bg-white rounded-lg shadow p-12 text-center">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600">
            </div>
          </div>
          <p class="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      )}

      {/* Main Stats Cards */}
      {!loading.value && data.value && (
        <>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Total Views Card */}
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <p class="text-white/70 text-sm font-medium">Total Views</p>
              <p class="text-4xl font-bold mt-2">{data.value.totalViews}</p>
              <p class="text-white/70 text-sm mt-3">
                {avgViewsPerDay.value} avg per day
              </p>
            </div>

            {/* Total Clicks Card */}
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <p class="text-white/70 text-sm font-medium">Total Clicks</p>
              <p class="text-4xl font-bold mt-2">{data.value.totalClicks}</p>
              <p class="text-white/70 text-sm mt-3">
                {avgClicksPerDay.value} avg per day
              </p>
            </div>
          </div>

          {/* Daily Stats Charts */}
          {data.value.dailyStats.length > 0 && (
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">
                Daily Activity
              </h2>

              {/* Views Chart */}
              <div class="mb-8">
                <h3 class="text-sm font-medium text-gray-700 mb-4">
                  Page Views
                </h3>
                <div class="flex items-end justify-between h-40 gap-1 bg-gray-50 p-4 rounded-lg">
                  {data.value.dailyStats.map((stat) => (
                    <div
                      key={stat.date}
                      class="flex-1 flex flex-col items-center group"
                    >
                      <div
                        class="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{
                          height: `${
                            Math.max(
                              (stat.views / maxDailyViews) * 100,
                              2,
                            )
                          }%`,
                        }}
                        title={`${stat.date}: ${stat.views} views`}
                      >
                      </div>
                      <span class="text-xs text-gray-500 mt-2 text-center truncate w-full px-1">
                        {new Date(stat.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clicks Chart */}
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-4">
                  Link Clicks
                </h3>
                <div class="flex items-end justify-between h-40 gap-1 bg-gray-50 p-4 rounded-lg">
                  {data.value.dailyStats.map((stat) => (
                    <div
                      key={stat.date}
                      class="flex-1 flex flex-col items-center group"
                    >
                      <div
                        class="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                        style={{
                          height: `${
                            Math.max(
                              (stat.clicks / maxDailyClicks) * 100,
                              2,
                            )
                          }%`,
                        }}
                        title={`${stat.date}: ${stat.clicks} clicks`}
                      >
                      </div>
                      <span class="text-xs text-gray-500 mt-2 text-center truncate w-full px-1">
                        {new Date(stat.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Locked Feature Cards for Free Plan */}
          {isFreePlan && (
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UpgradeCard
                feature="Referrer Tracking"
                description="See where your visitors are coming from (Google, Instagram, Twitter, etc.)"
                requiredPlan="pro"
              />
              <UpgradeCard
                feature="Country Analytics"
                description="Understand your audience's geographic distribution"
                requiredPlan="pro"
              />
              <UpgradeCard
                feature="CSV Export"
                description="Download your analytics data for custom reporting"
                requiredPlan="business"
              />
            </div>
          )}

          {/* Pro plan: show export as locked */}
          {plan === "pro" && (
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UpgradeCard
                feature="CSV Export"
                description="Download your analytics data for custom reporting"
                requiredPlan="business"
              />
            </div>
          )}

          {/* Top Links Table */}
          {data.value.topLinks.length > 0 && (
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">
                  Top Links
                </h2>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Link
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        URL
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    {data.value.topLinks.map((link) => (
                      <tr key={link.id} class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="text-sm font-medium text-gray-900">
                            {link.title}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-sm text-gray-600 truncate block max-w-xs">
                            {link.url}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="text-sm font-semibold text-gray-900">
                            {link.clicks}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="text-sm text-gray-600">
                            {topLinksTotalClicks.value > 0
                              ? Math.round(
                                (link.clicks / topLinksTotalClicks.value) *
                                  100,
                              )
                              : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {data.value.dailyStats.length === 0 &&
            data.value.topLinks.length === 0 && (
            <div class="bg-white rounded-lg shadow p-12 text-center">
              <p class="text-gray-600">
                No analytics data yet. Start sharing your link to see
                statistics!
              </p>
            </div>
          )}

          {/* Quick Links */}
          <div class="flex flex-wrap gap-3">
            <a
              href="/dashboard"
              class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium touch-manipulation"
            >
              Manage Links
            </a>
          </div>
        </>
      )}
    </div>
  );
}
