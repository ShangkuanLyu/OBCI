import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe → Supabase. Payment state is ONLY ever written here, server-side,
 * after signature verification — never from the client.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event;
  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const applicationId = Number(session.metadata?.application_id);
    if (!Number.isInteger(applicationId)) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    const { data: application } = await supabase
      .from("membership_applications")
      .select("id, membership_type_id, applicant_user_id, organisation_id")
      .eq("id", applicationId)
      .maybeSingle();
    if (!application) return NextResponse.json({ received: true });

    // Idempotent on the checkout session id (unique column).
    const { error: paymentError } = await supabase.from("payments").insert({
      application_id: application.id,
      amount: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? "aud").toUpperCase(),
      status: "succeeded",
      method: "stripe_checkout",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      description: "Membership fee",
      paid_at: new Date().toISOString(),
    });
    if (paymentError && paymentError.code === "23505") {
      return NextResponse.json({ received: true }); // already processed
    }
    if (paymentError) {
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    // Activate membership.
    await supabase.from("members").insert({
      application_id: application.id,
      user_id: application.applicant_user_id,
      organisation_id: application.organisation_id,
      membership_type_id: application.membership_type_id,
      status: "active",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    });
  }

  return NextResponse.json({ received: true });
}
