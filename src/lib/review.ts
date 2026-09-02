import type { Json } from "@/types/database.types";
import type { SiteSettings } from "@/services/settings";
import { isInternalReview } from "@/lib/preview";

/**
 * Chamber-confirmation gates for content that exists in the database but
 * has not been ratified for publication. Everything here is data-driven:
 * the flags live in `site_settings` and are edited through the admin
 * settings module, so no confirmation state is hard-coded in components.
 *
 * Absence of a flag means "not confirmed" — a module, field or legal text
 * only becomes public once the chamber confirms it in the CMS. Nothing is
 * inferred from legacy flags or from where a value was printed.
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

/** Contact fields the chamber has confirmed for publication
 *  (`site_settings.contact.confirmed_fields`, edited in the CMS). */
export function confirmedContactFields(settings: SiteSettings): Set<string> {
  const contact = record(settings["contact"]);
  return new Set(stringList(contact?.["confirmed_fields"]));
}

export type ContactFieldState = "confirmed" | "pending" | "hidden";

/**
 * How a contact field may be shown:
 *  - confirmed → published normally;
 *  - pending   → shown ONLY in the local internal review build, with an
 *                explicit "pending chamber confirmation" marker;
 *  - hidden    → not rendered (production and the public review preview).
 */
export function contactFieldState(
  settings: SiteSettings,
  field: ContactField,
): ContactFieldState {
  if (confirmedContactFields(settings).has(field)) return "confirmed";
  return isInternalReview() ? "pending" : "hidden";
}

/** True when at least one field is not confirmed (drives review notes). */
export function contactHasPendingFields(
  settings: SiteSettings,
  fields: readonly ContactField[] = CONTACT_FIELDS,
): boolean {
  const confirmed = confirmedContactFields(settings);
  return fields.some((field) => !confirmed.has(field));
}

/* ------------------------------------------------------------------ */
/* Modules                                                              */
/* ------------------------------------------------------------------ */

/** Site modules (e.g. "partners") whose underlying data the chamber has
 *  confirmed for publication. Stored as `review.confirmed_modules`. */
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

export const LEGAL_DOCUMENTS = [
  "constitution",
  "terms",
  "privacy",
  "accessibility",
] as const;
export type LegalDocument = (typeof LEGAL_DOCUMENTS)[number];

/** Approved version stamp of one legal document (`legal.<doc>_version`),
 *  or null while the chamber has not approved a text. A page whose
 *  document is unapproved must not publish its draft body. */
export function legalDocumentVersion(
  settings: SiteSettings,
  doc: LegalDocument,
): string | null {
  const legal = record(settings["legal"]);
  const value = legal?.[`${doc}_version`];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export type LegalStatus = {
  /** The three consent documents (constitution, terms, privacy) are all
   *  approved, so the application form may accept submissions. */
  approved: boolean;
  /** Version stamp recorded with each consent, e.g.
   *  "constitution=2026-10;terms=2026-10;privacy=2026-10". The RPC
   *  recomputes the same string from site_settings and rejects mismatches. */
  policyVersion: string | null;
  /** Site path (or URL) where the constitution text is published;
   *  `legal.constitution_url`, defaulting to the constitution page. */
  constitutionHref: string;
};

/** Approved legal-text versions, stored under `legal`:
 *  `{ constitution_version, terms_version, privacy_version,
 *     accessibility_version?, constitution_url? }`.
 *  Until the three consent documents are approved the application form
 *  must not accept submissions — there is nothing lawful for an applicant
 *  to consent to. */
export function legalStatus(settings: SiteSettings): LegalStatus {
  const constitution = legalDocumentVersion(settings, "constitution");
  const terms = legalDocumentVersion(settings, "terms");
  const privacy = legalDocumentVersion(settings, "privacy");
  const approved = Boolean(constitution && terms && privacy);
  const legal = record(settings["legal"]);
  const url = legal?.["constitution_url"];
  return {
    approved,
    policyVersion: approved
      ? `constitution=${constitution};terms=${terms};privacy=${privacy}`
      : null,
    constitutionHref:
      typeof url === "string" && url.trim() !== "" ? url.trim() : "/constitution",
  };
}
