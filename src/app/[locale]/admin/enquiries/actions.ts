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

const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  locale: z.enum(["zh", "en"]).default("zh"),
  status: z.enum(["in_progress", "closed"]),
});

export async function updateEnquiryStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertRole(["admin", "membership_manager", "editor"]);

  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    locale: formData.get("locale") ?? "zh",
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid input / 输入无效" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_enquiries")
    .update({
      status: parsed.data.status,
      handled_by: session.userId,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/", "layout");
  redirect(`/${parsed.data.locale}/admin/enquiries`);
}
