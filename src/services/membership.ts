import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";

export type MembershipTypeRow = Tables<"membership_types">;

export async function getMembershipTypes(): Promise<MembershipTypeRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("membership_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(`getMembershipTypes: ${error.message}`);
  return data;
}
