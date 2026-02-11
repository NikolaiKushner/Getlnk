import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { SubscriptionPlan } from "../lib/database.types.ts";

interface BillingIslandProps {
  plan: SubscriptionPlan;
  subscriptionStatus: string | null;
  subscriptionPeriodEnd: string | null;
}

interface BillingStatus {
  plan: SubscriptionPlan;
  planName: string;
  subscriptionStatus: string | null;
  subscriptionPeriodEnd: string | null;
  trialEndsAt: string | null;
  hasSubscription: boolean;
  limits: Record<string, unknown>;
}

const PLAN_COLORS: Record<SubscriptionPlan, { bg: string; text: string; border: string }> = {
  free: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  pro: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  business: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  canceled: { label: "Cancels at period end", color: "bg-yellow-100 text-yellow-700" },
  past_due: { label: "Past due", color: "bg-red-100 text-red-700" },
  trialing: { label: "Trial", color: "bg-blue-100 text-blue-700" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BillingIsland(
  { plan: initialPlan, subscriptionStatus: initialStatus, subscriptionPeriodEnd: initialEnd }: BillingIslandProps,
) {
  const loading = useSignal(false);
  const portalLoading = useSignal(false);
  const error = useSignal<string | null>(null);
  const billingData = useSignal<BillingStatus | null>(null);

  const plan = billingData.value?.plan || initialPlan;
  const status = billingData.value?.subscriptionStatus || initialStatus;
  const periodEnd = billingData.value?.subscriptionPeriodEnd || initialEnd;
  const planColors = PLAN_COLORS[plan] || PLAN_COLORS.free;
  const statusInfo = status ? STATUS_LABELS[status] : null;

  // Fetch fresh billing data on mount
  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await fetch("/api/billing/status");
        if (res.ok) {
          const data = await res.json();
          billingData.value = data;
        }
      } catch {
        // Use SSR data as fallback
      }
    }
    fetchBilling();
  }, []);

  async function openPortal() {
    portalLoading.value = true;
    error.value = null;

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        globalThis.location.href = data.url;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Something went wrong";
    } finally {
      portalLoading.value = false;
    }
  }

  async function handleUpgrade(targetPlan: SubscriptionPlan) {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan, interval: "monthly" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        globalThis.location.href = data.url;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Something went wrong";
    } finally {
      loading.value = false;
    }
  }

  return (
    <div class="space-y-6">
      {/* Success message from checkout redirect */}
      {globalThis.location?.search?.includes("success=true") && (
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-green-800 font-medium">
            Welcome to {plan === "pro" ? "Pro" : "Business"}!
          </p>
          <p class="text-green-600 text-sm mt-1">
            Your subscription is now active. All premium features are unlocked.
          </p>
        </div>
      )}

      {/* Error */}
      {error.value && (
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700 text-sm">{error.value}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div class={`bg-white rounded-lg shadow p-6 border ${planColors.border}`}>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Current Plan</h2>
            <div class="mt-2 flex items-center gap-3">
              <span
                class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${planColors.bg} ${planColors.text}`}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
              {statusInfo && (
                <span
                  class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>
          </div>
          {plan !== "free" && (
            <div class="text-right">
              <p class="text-sm text-gray-500">Next billing date</p>
              <p class="text-sm font-medium text-gray-900">
                {formatDate(periodEnd)}
              </p>
            </div>
          )}
        </div>

        {status === "canceled" && periodEnd && (
          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              Your subscription will end on{" "}
              <strong>{formatDate(periodEnd)}</strong>. You'll keep all features
              until then.
            </p>
          </div>
        )}

        {status === "past_due" && (
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">
              Your last payment failed. Please update your payment method to keep
              your subscription active.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Manage Subscription
        </h2>

        <div class="space-y-3">
          {/* Manage via Paddle Portal (for existing subscribers) */}
          {plan !== "free" && billingData.value?.hasSubscription && (
            <button
              type="button"
              onClick={openPortal}
              disabled={portalLoading.value}
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium touch-manipulation"
            >
              {portalLoading.value
                ? (
                  <span class="inline-flex items-center gap-2">
                    <span class="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                    Opening...
                  </span>
                )
                : (
                  <>
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Manage Subscription (Payment, Cancel, Invoices)
                  </>
                )}
            </button>
          )}

          {/* Upgrade options for free users */}
          {plan === "free" && (
            <>
              <button
                type="button"
                onClick={() => handleUpgrade("pro")}
                disabled={loading.value}
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold touch-manipulation"
              >
                {loading.value
                  ? (
                    <span class="inline-flex items-center gap-2">
                      <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Redirecting...
                    </span>
                  )
                  : "Upgrade to Pro — $3/month"}
              </button>
              <p class="text-xs text-gray-500 text-center">
                Unlimited links, all themes, advanced analytics, and more.
              </p>
            </>
          )}

          {/* Upgrade to Business for Pro users */}
          {plan === "pro" && (
            <div class="p-4 bg-gray-50 rounded-lg text-center">
              <p class="text-sm text-gray-600">
                Business plan with custom domains, link scheduling, and CSV
                export is coming soon.
              </p>
            </div>
          )}

          {/* View all plans */}
          <a
            href="/pricing"
            class="block w-full text-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium touch-manipulation"
          >
            Compare all plans →
          </a>
        </div>
      </div>

      {/* Plan features summary */}
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Your Plan Includes
        </h2>
        <div class="grid grid-cols-2 gap-3">
          {plan === "free" && (
            <>
              <Feature label="5 links" />
              <Feature label="3 themes" />
              <Feature label="7-day analytics" />
              <Feature label="3 social links" />
              <Feature label="Avatar upload" />
              <LockedFeature label="No branding" plan="Pro" />
            </>
          )}
          {plan === "pro" && (
            <>
              <Feature label="Unlimited links" />
              <Feature label="All 5 themes" />
              <Feature label="90-day analytics" />
              <Feature label="Unlimited social links" />
              <Feature label="No branding" />
              <Feature label="Referrer tracking" />
              <Feature label="SEO controls" />
              <Feature label="Priority support" />
              <LockedFeature label="Custom domain" plan="Business" />
              <LockedFeature label="CSV export" plan="Business" />
            </>
          )}
          {plan === "business" && (
            <>
              <Feature label="Unlimited everything" />
              <Feature label="All themes" />
              <Feature label="Unlimited analytics" />
              <Feature label="CSV export" />
              <Feature label="Custom domain" />
              <Feature label="Link scheduling" />
              <Feature label="Email capture" />
              <Feature label="Priority support" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div class="flex items-center gap-2 text-sm">
      <span class="text-green-500">✓</span>
      <span class="text-gray-700">{label}</span>
    </div>
  );
}

function LockedFeature(
  { label, plan }: { label: string; plan: string },
) {
  return (
    <div class="flex items-center gap-2 text-sm">
      <svg
        class="w-4 h-4 text-gray-400"
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
      <span class="text-gray-400">{label}</span>
      <span class="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
        {plan}
      </span>
    </div>
  );
}
