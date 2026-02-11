import { useSignal } from "@preact/signals";
import type { SubscriptionPlan } from "../lib/database.types.ts";

// deno-lint-ignore no-explicit-any
declare const Paddle: any;

interface PricingIslandProps {
  currentPlan: SubscriptionPlan;
  isAuthenticated: boolean;
  paddleEnv?: string;
  paddleSellerId?: string;
}

interface PlanData {
  id: SubscriptionPlan;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

const PLANS: PlanData[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Perfect for getting started",
    features: [
      "5 links",
      "3 themes (Default, Dark, Minimal)",
      "Basic analytics (7 days)",
      "3 social links",
      "Avatar upload",
      "Getlnk branding",
    ],
    badge: "Current",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 3,
    priceYearly: 24,
    description: "For creators who want more",
    features: [
      "Unlimited links",
      "All 5 themes",
      "Advanced analytics (90 days)",
      "Unlimited social links",
      "No Getlnk branding",
      "Referrer & country tracking",
      "SEO controls",
      "Link thumbnails",
      "Priority support",
    ],
    highlight: true,
    badge: "Best Value",
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 9,
    priceYearly: 72,
    description: "For teams and businesses",
    features: [
      "Everything in Pro",
      "Unlimited analytics history",
      "CSV data export",
      "Custom domain",
      "Link scheduling",
      "Email capture widget",
      "Team accounts",
    ],
    badge: "Coming Soon",
  },
];

let _paddleInitialized = false;
function initPaddleJs(env: string, sellerId: string) {
  if (_paddleInitialized) return;
  _paddleInitialized = true;

  const tryInit = () => {
    if (typeof Paddle !== "undefined") {
      if (env === "sandbox") Paddle.Environment.set("sandbox");
      Paddle.Setup({ seller: Number(sellerId) });
    } else {
      setTimeout(tryInit, 200);
    }
  };
  tryInit();
}

export default function PricingIsland(
  { currentPlan, isAuthenticated, paddleEnv, paddleSellerId }: PricingIslandProps,
) {
  const isYearly = useSignal(false);
  const loading = useSignal<string | null>(null);
  const error = useSignal<string | null>(null);

  // Initialize Paddle.js on mount
  if (typeof globalThis.document !== "undefined" && paddleSellerId) {
    initPaddleJs(paddleEnv || "sandbox", paddleSellerId);
  }

  async function handleCheckout(plan: SubscriptionPlan) {
    if (plan === "free") return;
    if (!isAuthenticated) {
      globalThis.location.href = "/register";
      return;
    }
    if (plan === currentPlan) return;

    loading.value = plan;
    error.value = null;

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          interval: isYearly.value ? "yearly" : "monthly",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      // Paddle returns a transactionId — open Paddle.js overlay checkout
      if (data.transactionId && typeof Paddle !== "undefined") {
        Paddle.Checkout.open({
          transactionId: data.transactionId,
        });
      } else if (data.transactionId) {
        // Fallback: redirect to Paddle hosted checkout
        throw new Error("Paddle.js not loaded. Please refresh the page and try again.");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Something went wrong";
    } finally {
      loading.value = null;
    }
  }

  function getCtaText(plan: PlanData): string {
    if (plan.id === currentPlan) return "Current Plan";
    if (plan.id === "free") return isAuthenticated ? "Downgrade" : "Get started";
    if (plan.id === "business") return "Coming Soon";
    return isAuthenticated ? `Upgrade to ${plan.name}` : "Get started";
  }

  function isCtaDisabled(plan: PlanData): boolean {
    if (plan.id === currentPlan) return true;
    if (plan.id === "business") return true; // Coming soon
    if (plan.id === "free") return true; // Can't checkout for free
    return false;
  }

  return (
    <div>
      {/* Billing toggle */}
      <div class="flex items-center justify-center gap-3 mb-10 sm:mb-14">
        <span
          class={`text-sm font-medium ${
            !isYearly.value ? "text-gray-900" : "text-gray-500"
          }`}
        >
          Monthly
        </span>
        <button
          type="button"
          onClick={() => isYearly.value = !isYearly.value}
          class={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors touch-manipulation ${
            isYearly.value ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          <span
            class={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
              isYearly.value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          class={`text-sm font-medium ${
            isYearly.value ? "text-gray-900" : "text-gray-500"
          }`}
        >
          Yearly
        </span>
        {isYearly.value && (
          <span class="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Save ~30%
          </span>
        )}
      </div>

      {/* Error message */}
      {error.value && (
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p class="text-sm text-red-700">{error.value}</p>
        </div>
      )}

      {/* Plan cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const price = isYearly.value ? plan.priceYearly : plan.priceMonthly;
          const monthlyEquiv = isYearly.value
            ? (plan.priceYearly / 12).toFixed(0)
            : plan.priceMonthly;
          const isCurrent = plan.id === currentPlan;
          const isLoading = loading.value === plan.id;
          const disabled = isCtaDisabled(plan);

          return (
            <div
              key={plan.id}
              class={`relative rounded-2xl p-6 sm:p-8 flex flex-col ${
                plan.highlight
                  ? "bg-indigo-600 text-white shadow-xl ring-2 ring-indigo-600 scale-[1.02]"
                  : "bg-white text-gray-900 shadow-lg"
              }`}
            >
              {/* Badge */}
              {((isCurrent && plan.id !== "free") ||
                (!isCurrent && plan.badge)) && (
                <span
                  class={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                    isCurrent
                      ? "bg-green-400 text-green-900"
                      : plan.highlight
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isCurrent ? "Current Plan" : plan.badge}
                </span>
              )}

              <p
                class={`text-sm font-semibold uppercase tracking-wide ${
                  plan.highlight ? "text-indigo-200" : "text-gray-500"
                }`}
              >
                {plan.name}
              </p>

              <p class="mt-2 flex items-baseline gap-1">
                <span class="text-4xl font-bold">
                  ${isYearly.value ? monthlyEquiv : price}
                </span>
                {plan.priceMonthly > 0 && (
                  <span
                    class={`text-sm ${
                      plan.highlight ? "text-indigo-200" : "text-gray-500"
                    }`}
                  >
                    /month
                  </span>
                )}
              </p>

              {isYearly.value && plan.priceYearly > 0 && (
                <p
                  class={`text-xs mt-1 ${
                    plan.highlight ? "text-indigo-200" : "text-gray-500"
                  }`}
                >
                  ${price}/year (billed annually)
                </p>
              )}

              <p
                class={`text-sm mt-2 ${
                  plan.highlight ? "text-indigo-200" : "text-gray-500"
                }`}
              >
                {plan.description}
              </p>

              <ul class="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} class="flex gap-2 text-sm">
                    <span
                      class={plan.highlight ? "text-indigo-200" : "text-indigo-600"}
                    >
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleCheckout(plan.id)}
                disabled={disabled || isLoading}
                class={`mt-8 block w-full text-center py-3 px-6 rounded-xl font-semibold transition-colors touch-manipulation ${
                  disabled
                    ? plan.highlight
                      ? "bg-white/50 text-indigo-300 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : plan.highlight
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isLoading
                  ? (
                    <span class="inline-flex items-center gap-2">
                      <span class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Redirecting...
                    </span>
                  )
                  : getCtaText(plan)}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ below pricing */}
      <div class="mt-16 max-w-2xl mx-auto">
        <h3 class="text-xl font-bold text-gray-900 text-center mb-8">
          Frequently asked questions
        </h3>
        <div class="space-y-4">
          {[
            {
              q: "Can I switch plans at any time?",
              a: "Yes! Upgrades take effect immediately. When you downgrade, you keep your current plan until the end of the billing period.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and other local payment methods through Paddle — our secure payment provider.",
            },
            {
              q: "Is there a free trial?",
              a: "The Free plan is free forever. You can upgrade to Pro anytime to unlock premium features instantly.",
            },
            {
              q: "What happens to my links if I downgrade?",
              a: "Your links stay active. If you exceed the Free plan's 5-link limit, you won't be able to add new ones until you're back under the limit or upgrade again.",
            },
          ].map(({ q, a }) => (
            <div key={q} class="bg-white rounded-lg shadow p-5">
              <h4 class="font-semibold text-gray-900">{q}</h4>
              <p class="text-sm text-gray-600 mt-2">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
