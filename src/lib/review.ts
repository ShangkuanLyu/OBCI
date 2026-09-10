import type { Json } from "@/types/database.types";
import type { SiteSettings } from "@/services/settings";

/**
 * Publication gates for content that exists in the database but is not
 * automatically public. Everything here is data-driven: the flags live in
 * `site_settings` and are edited through the admin settings module, so no
 * publication state is hard-coded in components.
 *
 * Absence of a flag means "not published" — a module, field or legal text
 * becomes public only once it is listed in the CMS. Nothing is inferred
 * from where a value happens to be printed.
 */

function record(value: Json | undefined): Record<string, Json> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : null;
}

function stringList(value: Json | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/* ------------------------------------------------------------------ */
/* Contact details                                                      */
/* ------------------------------------------------------------------ */

/** Publishable contact fields (also the option list of the CMS editor). */
export const CONTACT_FIELDS = [
  "address",
  "address2",
  "phone",
  "fax",
  "email",
  "wechat",
  "membership_contact",
] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

/** Contact fields published on the site
 *  (`site_settings.contact.confirmed_fields`, edited in the CMS). */
export function confirmedContactFields(settings: SiteSettings): Set<string> {
  const contact = record(settings["contact"]);
  return new Set(stringList(contact?.["confirmed_fields"]));
}

export type ContactFieldState = "confirmed" | "hidden";

/**
 * How a contact field may be shown:
 *  - confirmed → listed in `contact.confirmed_fields`, published normally;
 *  - hidden    → not rendered at all.
 */
export function contactFieldState(
  settings: SiteSettings,
  field: ContactField,
): ContactFieldState {
  return confirmedContactFields(settings).has(field) ? "confirmed" : "hidden";
}

/* ------------------------------------------------------------------ */
/* Modules                                                              */
/* ------------------------------------------------------------------ */

/** Site modules (e.g. "partners") whose underlying data is published.
 *  Stored as `review.confirmed_modules`. */
export function isModuleConfirmed(
  settings: SiteSettings,
  module: string,
): boolean {
  const review = record(settings["review"]);
  return stringList(review?.["confirmed_modules"]).includes(module);
}

/* ------------------------------------------------------------------ */
/* Legal texts                                                          */
/* ------------------------------------------------------------------ */

/** Documents that can carry a published version stamp. The constitution
 *  is the association's governing document, issued by the secretariat on
 *  request, so it is listed but never published on the site. */
export const LEGAL_DOCUMENTS = [
  "constitution",
  "terms",
  "privacy",
  "accessibility",
] as const;
export type LegalDocument = (typeof LEGAL_DOCUMENTS)[number];

/** Published version stamp of one legal document (`legal.<doc>_version`),
 *  or null when no text is published. A page whose document has no stamp
 *  must not publish a body. */
export function legalDocumentVersion(
  settings: SiteSettings,
  doc: LegalDocument,
): string | null {
  const legal = record(settings["legal"]);
  const value = legal?.[`${doc}_version`];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export type LegalStatus = {
  /** Both published policies (terms, privacy) carry a version stamp, so
   *  the application form may accept submissions. */
  approved: boolean;
  /** Version stamp recorded with the applicant's consent, e.g.
   *  "terms=2026-09;privacy=2026-09". Byte-identical to the stamp the RPC
   *  recomputes from site_settings; a mismatch is rejected server-side
   *  (supabase/migrations/20260902120000_application_form_v2.sql). */
  policyVersion: string | null;
  /** Site path (or URL) describing the constitution and how to request it;
   *  `legal.constitution_url`, defaulting to the constitution page. */
  constitutionHref: string;
};

/** Published legal-text versions, stored under `legal`:
 *  `{ terms_version, privacy_version, accessibility_version?,
 *     constitution_url? }`.
 *
 *  Only the two policies the website itself publishes are gated here. The
 *  constitution is the association's own governing document, issued by the
 *  secretariat on request, so it carries no published version; the
 *  applicant's undertaking to be bound by it is still recorded with the
 *  application, exactly as on the paper form. Until terms and privacy are
 *  both published the form must not accept submissions — there is nothing
 *  lawful for an applicant to consent to. */
export function legalStatus(settings: SiteSettings): LegalStatus {
  const terms = legalDocumentVersion(settings, "terms");
  const privacy = legalDocumentVersion(settings, "privacy");
  const approved = Boolean(terms && privacy);
  const legal = record(settings["legal"]);
  const url = legal?.["constitution_url"];
  return {
    approved,
    policyVersion: approved ? `terms=${terms};privacy=${privacy}` : null,
    constitutionHref:
      typeof url === "string" && url.trim() !== "" ? url.trim() : "/constitution",
  };
}
