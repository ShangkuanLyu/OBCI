"use server";

import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createPublicClient } from "@/lib/supabase/public";

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "mock" }
  | { status: "error"; message?: string };

/**
 * Create a Stripe Checkout session for an approved membership application.
 * The applicant authorises with the application access token (from their
 * submission confirmation / follow-up email).
 *
 * Until Stripe credentials and published fees exist this returns "mock" so
 * the UI can show a contact-the-secretariat fallback.
 */
export async function createMembershipCheckout(
  applicationId: number,
  accessToken: string,
): Promise<CheckoutResult> {
  if (!isStripeConfigured()) return { status: "mock" };

  const supabase = createPublicClient();
  // The RPC validates the token; direct table reads are blocked by RLS.
  const { data, error } = await supabase.rpc("get_application_for_checkout", {
    p_application_id: applicationId,
    p_access_token: accessToken,
  });
  if (error || !data) return { status: "error" };

  const application = data as {
    id: number;
    status: string;
    type_name_en: string;
    price_annual: number | null;
    currency: string;
    email: string;
  };
  if (application.status !== "approved" || !application.price_annual) {
    return { status: "error", message: "not payable" };
  }

  const stripe = getStripe();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: application.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: application.currency.toLowerCase(),
          unit_amount: Math.round(application.price_annual * 100),
          product_data: {
            name: `OBCI Membership — ${application.type_name_en}`,
          },
        },
      },
    ],
    metadata: { application_id: String(application.id) },
    success_url: `${site}/zh/membership/apply?paid=1`,
    cancel_url: `${site}/zh/membership`,
  });

  return session.url
    ? { status: "redirect", url: session.url }
    : { status: "error" };
}
