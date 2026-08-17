"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const emailSchema = z.string().trim().email().max(320);

// ---------------------------------------------------------------- newsletter
const newsletterSchema = z.object({
  email: emailSchema,
  locale: z.enum(["zh", "en"]).default("zh"),
});

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    locale: formData.get("locale") ?? "zh",
  });
  if (!parsed.success) return { status: "error", message: "invalid" };

  const supabase = createPublicClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email: parsed.data.email.toLowerCase(),
    locale: parsed.data.locale,
    source: "website",
  });
  // Unique violation = already subscribed; treat as success.
  if (error && error.code !== "23505") {
    return { status: "error" };
  }
  return { status: "success" };
}

// ------------------------------------------------------------------- contact
const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: emailSchema,
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  organisation_name: z.string().trim().max(300).optional().or(z.literal("")),
  subject: z.string().trim().max(300).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5000),
  locale: z.enum(["zh", "en"]).default("zh"),
});

export async function submitContactEnquiry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    organisation_name: formData.get("organisation_name") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
    locale: formData.get("locale") ?? "zh",
  });
  if (!parsed.success) return { status: "error", message: "invalid" };

  const supabase = createPublicClient();
  const { error } = await supabase.from("contact_enquiries").insert({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
    organisation_name: parsed.data.organisation_name || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
    locale: parsed.data.locale,
  });
  if (error) return { status: "error" };
  return { status: "success" };
}

// -------------------------------------------------- membership application
const applicationSchema = z.object({
  membership_type_code: z.string().trim().min(1).max(50),
  applicant_name: z.string().trim().min(1).max(200),
  email: emailSchema,
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  organisation_name: z.string().trim().max(300).optional().or(z.literal("")),
  position: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  locale: z.enum(["zh", "en"]).default("zh"),
});

const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_DOC_BYTES = 20 * 1024 * 1024;

export async function submitMembershipApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = applicationSchema.safeParse({
    membership_type_code: formData.get("membership_type_code"),
    applicant_name: formData.get("applicant_name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    organisation_name: formData.get("organisation_name") ?? "",
    position: formData.get("position") ?? "",
    message: formData.get("message") ?? "",
    locale: formData.get("locale") ?? "zh",
  });
  if (!parsed.success) return { status: "error", message: "invalid" };

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("submit_membership_application", {
    p_membership_type_code: parsed.data.membership_type_code,
    p_applicant_name: parsed.data.applicant_name,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone || undefined,
    p_organisation_name: parsed.data.organisation_name || undefined,
    p_position: parsed.data.position || undefined,
    p_message: parsed.data.message || undefined,
    p_locale: parsed.data.locale,
  });
  if (error || !data) return { status: "error" };

  const { application_id, access_token } = data as {
    application_id: number;
    access_token: string;
  };

  // Optional supporting documents → private bucket, then linked via RPC.
  const files = formData
    .getAll("documents")
    .filter((f): f is File => f instanceof File && f.size > 0);

  let uploadFailed = false;
  for (const file of files.slice(0, 10)) {
    if (file.size > MAX_DOC_BYTES || !ALLOWED_DOC_TYPES.has(file.type)) {
      uploadFailed = true;
      continue;
    }
    const safeName = file.name.replace(/[^\w.\-一-鿿]/g, "_").slice(-100);
    const path = `applications/${application_id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("member-documents")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      uploadFailed = true;
      continue;
    }
    const { error: attachError } = await supabase.rpc(
      "attach_application_document",
      {
        p_application_id: application_id,
        p_access_token: access_token,
        p_storage_path: path,
        p_file_name: file.name.slice(0, 200),
        p_mime_type: file.type,
        p_size_bytes: file.size,
      },
    );
    if (attachError) uploadFailed = true;
  }

  return uploadFailed
    ? { status: "success", message: "upload_partial" }
    : { status: "success" };
}
