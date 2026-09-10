import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database.types";
import type { BankDetails } from "@/lib/content/types";

export type { BankDetails } from "@/lib/content/types";

export type SiteSettings = Record<string, Json>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw new Error(`getSiteSettings: ${error.message}`);
  const settings: SiteSettings = Object.fromEntries(
    data.map((row) => [row.key, row.value]),
  );
  return settings;
}

export function settingString(
  settings: SiteSettings,
  key: string,
  field: string,
  fallback = "",
): string {
  const group = settings[key];
  if (group && typeof group === "object" && !Array.isArray(group)) {
    const value = (group as Record<string, Json | undefined>)[field];
    if (typeof value === "string") return value;
  }
  return fallback;
}

/**
 * Council bank account for manual membership-fee payment
 * (`site_settings.bank`: account_name, bank_name, bsb, account_number,
 * cards). The stored account is published as is, values verbatim (the BSB
 * is not reformatted). Returns null when the four account fields are not
 * all present — a partial account is never shown.
 */
export function bankDetails(settings: SiteSettings): BankDetails | null {
  const read = (field: string) => settingString(settings, "bank", field).trim();
  const details: BankDetails = {
    account_name: read("account_name"),
    bank_name: read("bank_name"),
    bsb: read("bsb"),
    account_number: read("account_number"),
    cards: read("cards"),
  };
  const complete =
    details.account_name &&
    details.bank_name &&
    details.bsb &&
    details.account_number;
  return complete ? details : null;
}
