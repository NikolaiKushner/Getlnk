// Plan definitions and feature gating logic
// This is the single source of truth for what each plan can do.
// All gating (server + client) must go through these functions.

import type { ProfileTheme, SubscriptionPlan } from "./database.types.ts";

// ============================================
// Plan Feature Limits
// ============================================

export interface PlanLimits {
  maxLinks: number; // -1 = unlimited
  maxSocialLinks: number; // -1 = unlimited
  maxBioLength: number;
  allowedThemes: ProfileTheme[];
  analyticsRetentionDays: number; // -1 = unlimited
  analyticsReferrers: boolean;
  analyticsCountries: boolean;
  analyticsExport: boolean;
  seoControls: boolean;
  linkThumbnails: boolean;
  linkScheduling: boolean;
  customDomain: boolean;
  emailCapture: boolean;
  removeBranding: boolean;
  prioritySupport: boolean;
}

const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxLinks: 5,
    maxSocialLinks: 3,
    maxBioLength: 160,
    allowedThemes: ["default", "dark", "minimal"],
    analyticsRetentionDays: 7,
    analyticsReferrers: false,
    analyticsCountries: false,
    analyticsExport: false,
    seoControls: false,
    linkThumbnails: false,
    linkScheduling: false,
    customDomain: false,
    emailCapture: false,
    removeBranding: false,
    prioritySupport: false,
  },
  pro: {
    maxLinks: -1,
    maxSocialLinks: -1,
    maxBioLength: 500,
    allowedThemes: ["default", "dark", "gradient", "minimal", "ocean"],
    analyticsRetentionDays: 90,
    analyticsReferrers: true,
    analyticsCountries: true,
    analyticsExport: false,
    seoControls: true,
    linkThumbnails: true,
    linkScheduling: false,
    customDomain: false,
    emailCapture: false,
    removeBranding: true,
    prioritySupport: true,
  },
  business: {
    maxLinks: -1,
    maxSocialLinks: -1,
    maxBioLength: 500,
    allowedThemes: ["default", "dark", "gradient", "minimal", "ocean"],
    analyticsRetentionDays: -1,
    analyticsReferrers: true,
    analyticsCountries: true,
    analyticsExport: true,
    seoControls: true,
    linkThumbnails: true,
    linkScheduling: true,
    customDomain: true,
    emailCapture: true,
    removeBranding: true,
    prioritySupport: true,
  },
};

// ============================================
// Plan metadata (for UI display)
// ============================================

export interface PlanInfo {
  id: SubscriptionPlan;
  name: string;
  priceMonthly: number; // in dollars
  priceYearly: number; // in dollars
  description: string;
  badge?: string;
  highlight?: boolean;
}

export const PLAN_INFO: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Perfect for getting started",
    badge: "Most Popular",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 3,
    priceYearly: 24,
    description: "For creators who want more",
    badge: "Best Value",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 9,
    priceYearly: 72,
    description: "For teams and businesses",
    badge: "Coming Soon",
  },
];

// ============================================
// Core gating functions
// ============================================

/**
 * Get the feature limits for a given plan.
 */
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

/**
 * Check if a specific boolean feature is available on a plan.
 */
export function checkFeatureAccess(
  plan: SubscriptionPlan,
  feature: keyof PlanLimits,
): boolean {
  const limits = getPlanLimits(plan);
  const value = limits[feature];

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * Check if a user can add more links given their current count.
 */
export function canAddLink(
  plan: SubscriptionPlan,
  currentLinkCount: number,
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(plan);
  const limit = limits.maxLinks;

  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  const remaining = Math.max(0, limit - currentLinkCount);
  return {
    allowed: currentLinkCount < limit,
    limit,
    remaining,
  };
}

/**
 * Check if a theme is allowed on a given plan.
 */
export function isThemeAllowed(
  plan: SubscriptionPlan,
  theme: ProfileTheme,
): boolean {
  const limits = getPlanLimits(plan);
  return limits.allowedThemes.includes(theme);
}

/**
 * Check if a social link slot is available.
 */
export function canAddSocialLink(
  plan: SubscriptionPlan,
  currentSocialLinkCount: number,
): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxSocialLinks === -1) return true;
  return currentSocialLinkCount < limits.maxSocialLinks;
}

/**
 * Get the analytics retention cutoff date for a plan.
 * Returns null if unlimited.
 */
export function getAnalyticsCutoffDate(
  plan: SubscriptionPlan,
): Date | null {
  const limits = getPlanLimits(plan);
  if (limits.analyticsRetentionDays === -1) return null;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - limits.analyticsRetentionDays);
  return cutoff;
}

/**
 * Get the maximum bio length for a plan.
 */
export function getMaxBioLength(plan: SubscriptionPlan): number {
  return getPlanLimits(plan).maxBioLength;
}

/**
 * Get the minimum plan required for a feature.
 * Used to show "Upgrade to Pro" vs "Upgrade to Business" in UI.
 */
export function getMinimumPlanForFeature(
  feature: keyof PlanLimits,
): SubscriptionPlan {
  // Check plans in order from cheapest to most expensive
  const planOrder: SubscriptionPlan[] = ["free", "pro", "business"];

  for (const plan of planOrder) {
    if (checkFeatureAccess(plan, feature)) {
      return plan;
    }
  }

  return "business"; // Fallback
}

/**
 * Get a user-friendly label for the upgrade CTA based on what plan they need.
 */
export function getUpgradeLabel(requiredPlan: SubscriptionPlan): string {
  switch (requiredPlan) {
    case "pro":
      return "Upgrade to Pro";
    case "business":
      return "Upgrade to Business";
    default:
      return "Upgrade";
  }
}

/**
 * Check if plan A is higher tier than plan B.
 */
export function isPlanHigherThan(
  planA: SubscriptionPlan,
  planB: SubscriptionPlan,
): boolean {
  const order: Record<SubscriptionPlan, number> = {
    free: 0,
    pro: 1,
    business: 2,
  };
  return order[planA] > order[planB];
}

/**
 * Validate that a plan value is a valid SubscriptionPlan.
 */
export function isValidPlan(plan: string): plan is SubscriptionPlan {
  return ["free", "pro", "business"].includes(plan);
}
