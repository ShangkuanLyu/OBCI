import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_MEMBERSHIP_NAME_OVERRIDES,
} from "@/lib/fixtures/design-review";

export type MembershipTypeRow = Tables<"membership_types">;

export async function getMembershipTypes(): Promise<MembershipTypeRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("membership_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(`getMembershipTypes: ${error.message}`);
  // Design-review preview: the DOCX renames the top tier (企业顶级会员);
  // the approved data update applies the same rename remotely.
  if (!designFixturesEnabled()) return data;
  return data.map((row) => {
    const override = FIXTURE_MEMBERSHIP_NAME_OVERRIDES[row.code];
    return override ? { ...row, ...override } : row;
  });
}
