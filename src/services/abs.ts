import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_ABS_ITEMS,
} from "@/lib/fixtures/design-review";

export type ServiceOfferingRow = Tables<"service_offerings">;

/**
 * The four ABS service blocks (合规准入 / 市场渠道 / 全澳售后 / 政商与资本).
 * Remote rows exist; until the approved data update trims their item lists
 * to the DOCX-confirmed entries, the design-review fixtures (flag-gated)
 * substitute the confirmed lists.
 */
export async function getServiceOfferings(): Promise<ServiceOfferingRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("service_offerings")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(`getServiceOfferings: ${error.message}`);
  const rows = data ?? [];
  if (!designFixturesEnabled()) return rows;
  return rows.map((row) => {
    const override = FIXTURE_ABS_ITEMS[row.slug];
    return override ? { ...row, ...override } : row;
  });
}
