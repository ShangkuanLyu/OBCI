import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";

export type ServiceOfferingRow = Tables<"service_offerings">;

/** The four ABS service blocks (合规准入 / 市场渠道 / 全澳售后 / 政商与资本),
 *  as stored in `service_offerings` and edited in the CMS. */
export async function getServiceOfferings(): Promise<ServiceOfferingRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("service_offerings")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(`getServiceOfferings: ${error.message}`);
  return data ?? [];
}
