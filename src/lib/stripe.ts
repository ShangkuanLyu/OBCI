import "server-only";
import Stripe from "stripe";

/**
 * Stripe is optional until credentials are provisioned: without
 * STRIPE_SECRET_KEY the checkout action returns a mock response and the
 * webhook route answers 503. The Supabase payment architecture is real
 * either way.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripeClient ??= new Stripe(key);
  return stripeClient;
}
