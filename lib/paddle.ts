// Paddle client and billing helper functions
// Uses Paddle Billing API via @paddle/paddle-node-sdk
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import type { SubscriptionPlan } from "./database.types.ts";

// ============================================
// SDK Setup
// ============================================

let _paddleClient: Paddle | null = null;

function getPaddle(): Paddle {
  if (_paddleClient) return _paddleClient;

  const apiKey = Deno.env.get("PADDLE_API_KEY");
  if (!apiKey) throw new Error("Missing PADDLE_API_KEY environment variable.");

  const env = Deno.env.get("PADDLE_ENVIRONMENT") === "production"
    ? Environment.production
    : Environment.sandbox;

  _paddleClient = new Paddle(apiKey, { environment: env });
  return _paddleClient;
}

// ============================================
// Price ID Mapping
// ============================================

export interface PriceIds {
  monthly: string;
  yearly: string;
}

export function getPriceIds(plan: SubscriptionPlan): PriceIds | null {
  if (plan === "free") return null;

  if (plan === "pro") {
    return {
      monthly: Deno.env.get("PADDLE_PRO_MONTHLY_PRICE_ID") || "",
      yearly: Deno.env.get("PADDLE_PRO_YEARLY_PRICE_ID") || "",
    };
  }

  if (plan === "business") {
    return {
      monthly: Deno.env.get("PADDLE_BUSINESS_MONTHLY_PRICE_ID") || "",
      yearly: Deno.env.get("PADDLE_BUSINESS_YEARLY_PRICE_ID") || "",
    };
  }

  return null;
}

export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  const proM = Deno.env.get("PADDLE_PRO_MONTHLY_PRICE_ID");
  const proY = Deno.env.get("PADDLE_PRO_YEARLY_PRICE_ID");
  const bizM = Deno.env.get("PADDLE_BUSINESS_MONTHLY_PRICE_ID");
  const bizY = Deno.env.get("PADDLE_BUSINESS_YEARLY_PRICE_ID");

  if (priceId === proM || priceId === proY) return "pro";
  if (priceId === bizM || priceId === bizY) return "business";

  return "free";
}

// ============================================
// Checkout — returns a transaction for client-side Paddle.js overlay
// ============================================

export interface CreateCheckoutOptions {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
}

/**
 * Create a Paddle transaction for checkout.
 * Returns a transaction ID that the client passes to Paddle.js overlay.
 */
export async function createPaddleCheckout(
  options: CreateCheckoutOptions,
): Promise<string> {
  const paddle = getPaddle();

  const transaction = await paddle.transactions.create({
    items: [{ priceId: options.priceId, quantity: 1 }],
    customData: { user_id: options.userId },
    checkout: {
      url: options.successUrl,
    },
  });

  // Return the transaction ID — client uses Paddle.js to open checkout overlay
  return transaction.id;
}

// ============================================
// Customer Portal
// ============================================

/**
 * Create an authenticated customer portal session.
 * Returns the portal URL for the customer to manage their subscription.
 */
export async function createPortalSession(customerId: string): Promise<string> {
  const paddle = getPaddle();
  const session = await paddle.customerPortalSessions.create(customerId, []);
  return session.urls.general.overview;
}

// ============================================
// Subscription
// ============================================

export async function getSubscription(subscriptionId: string) {
  const paddle = getPaddle();
  return await paddle.subscriptions.get(subscriptionId);
}

// ============================================
// Webhook Signature Verification (HMAC-SHA256)
// ============================================

/**
 * Verify Paddle webhook signature.
 * Paddle-Signature header format: ts=TIMESTAMP;h1=HASH
 */
export async function verifyWebhookSignature(
  rawBody: string,
  paddleSignature: string,
): Promise<boolean> {
  const secret = Deno.env.get("PADDLE_WEBHOOK_SECRET");
  if (!secret) throw new Error("Missing PADDLE_WEBHOOK_SECRET environment variable.");

  // Parse header: "ts=123456;h1=abcdef..."
  const parts: Record<string, string> = {};
  for (const part of paddleSignature.split(";")) {
    const [key, ...vals] = part.split("=");
    parts[key] = vals.join("=");
  }

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Build signed payload: ts:rawBody
  const signedPayload = `${ts}:${rawBody}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Timing-safe comparison
  if (computed.length !== h1.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ h1.charCodeAt(i);
  }
  return mismatch === 0;
}

// ============================================
// Status Mapping
// ============================================

/**
 * Map Paddle subscription status to our internal status.
 * Paddle: active, trialing, past_due, paused, canceled
 * Ours: active, canceled, past_due, trialing
 */
export function mapPaddleStatus(
  paddleStatus: string,
): "active" | "canceled" | "past_due" | "trialing" {
  switch (paddleStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "paused":
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    default:
      return "active";
  }
}
