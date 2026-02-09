// Stripe client and billing helper functions
import Stripe from "stripe";
import type { SubscriptionPlan } from "./database.types.ts";

// ============================================
// Stripe Client
// ============================================

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. Set it in your .env file.",
    );
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  return _stripe;
}

export function getStripePublishableKey(): string {
  const key = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
  if (!key) {
    throw new Error("Missing STRIPE_PUBLISHABLE_KEY environment variable.");
  }
  return key;
}

// ============================================
// Price ID Mapping
// ============================================

export interface StripePriceIds {
  monthly: string;
  yearly: string;
}

export function getStripePriceIds(
  plan: SubscriptionPlan,
): StripePriceIds | null {
  if (plan === "free") return null;

  if (plan === "pro") {
    return {
      monthly: Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID") || "",
      yearly: Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID") || "",
    };
  }

  if (plan === "business") {
    return {
      monthly: Deno.env.get("STRIPE_BUSINESS_MONTHLY_PRICE_ID") || "",
      yearly: Deno.env.get("STRIPE_BUSINESS_YEARLY_PRICE_ID") || "",
    };
  }

  return null;
}

/**
 * Map a Stripe Price ID back to a plan name.
 */
export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  const proMonthly = Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID");
  const proYearly = Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID");
  const bizMonthly = Deno.env.get("STRIPE_BUSINESS_MONTHLY_PRICE_ID");
  const bizYearly = Deno.env.get("STRIPE_BUSINESS_YEARLY_PRICE_ID");

  if (priceId === proMonthly || priceId === proYearly) return "pro";
  if (priceId === bizMonthly || priceId === bizYearly) return "business";

  return "free";
}

// ============================================
// Customer Management
// ============================================

/**
 * Create or retrieve a Stripe customer for a user.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null,
): Promise<string> {
  const stripe = getStripe();

  if (existingCustomerId) {
    // Verify the customer still exists
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return existingCustomerId;
      }
    } catch {
      // Customer not found, create new one
    }
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  });

  return customer.id;
}

// ============================================
// Checkout Session
// ============================================

export interface CreateCheckoutOptions {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export function createCheckoutSession(
  options: CreateCheckoutOptions,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    customer: options.customerId,
    mode: "subscription",
    line_items: [
      {
        price: options.priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    subscription_data: {
      metadata: {
        supabase_user_id: options.userId,
      },
    },
    metadata: {
      supabase_user_id: options.userId,
    },
    allow_promotion_codes: true,
  });
}

// ============================================
// Customer Portal
// ============================================

export function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// ============================================
// Webhook Verification
// ============================================

export function constructWebhookEvent(
  body: string,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
  }

  return stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
}
