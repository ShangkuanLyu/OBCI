import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role client. Bypasses RLS — only for trusted server code
 * (Stripe webhook, privileged admin operations) after an explicit
 * app-role check at the call site.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. The service-role client is unavailable.",
    );
  }
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
