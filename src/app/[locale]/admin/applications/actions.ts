"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  status: "idle" | "error";
  message?: string;
};

const reviewSchema = z.object({
  id: z.coerce.number().int().positive(),
  locale: z.enum(["zh", "en"]).default("zh"),
  status: z.enum(["under_review", "approved", "rejected"]),
  review_note: z.string().trim().max(5000).optional().or(z.literal("")),
});

export async function updateApplicationStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertRole(["admin", "membership_manager"]);

  const parsed = reviewSchema.safeParse({
    id: formData.get("id"),
    locale: formData.get("locale") ?? "zh",
    status: formData.get("status"),
    review_note: formData.get("review_note") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid input / 输入无效" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("membership_applications")
    .update({
      status: parsed.data.status,
      review_note: parsed.data.review_note || null,
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/", "layout");
  redirect(`/${parsed.data.locale}/admin/applications`);
}
