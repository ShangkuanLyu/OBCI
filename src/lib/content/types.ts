/**
 * Shapes of the structured content the site reads from the database.
 *
 * These are the contracts between `site_settings` / table rows and the
 * components that render them. The database is the single source of truth
 * for the values; this module only describes their shape, so it carries no
 * copy of its own.
 */

/** A paragraph stored in both site languages. */
export type BilingualTextData = { text_zh: string; text_en: string };

/** A titled paragraph (core values, pillars). */
export type TitledTextData = BilingualTextData & {
  title_zh: string;
  title_en: string;
};

/** `site_settings.outlook` — annual review / outlook block. */
export type OutlookData = {
  title_zh: string;
  title_en: string;
  paragraphs: BilingualTextData[];
};

/** `site_settings.banners` — one home-page hero slide. */
export type BannerData = {
  key: string;
  title_zh: string;
  title_en: string;
  text_zh: string;
  text_en: string;
  cta_label_zh: string;
  cta_label_en: string;
  cta_href: string;
  image_path: string | null;
  is_active: boolean;
};

/** `site_settings.org_structure` — one box of the structure chart. */
export type OrgUnit = {
  key: string;
  name_zh: string;
  name_en: string;
  note_zh: string;
  note_en: string;
  kind: "leadership" | "committee" | "chapters" | "secretariat" | "other";
};

/** One councillor in `site_settings.council`. */
export type CouncilMember = {
  name_en: string;
  name_zh: string;
  note_en: string;
  note_zh: string;
};

/** `site_settings.council` — the council roster. */
export type CouncilRoster = {
  title_zh: string;
  title_en: string;
  members: CouncilMember[];
};

/** `site_settings.gallery` — one credential / activity image. */
export type GalleryItem = {
  image_path: string;
  caption_zh: string;
  caption_en: string;
  news_slug: string | null;
  event_slug: string | null;
};

/** Committee-template columns added by migration 20260902120000.
 *  Optional until the generated database types are refreshed. */
export type ChapterExtras = {
  experts_zh?: string[];
  experts_en?: string[];
  certifications_zh?: string[];
  certifications_en?: string[];
  deputy_secretary_general?: string | null;
};

/** `events.tags` (committee association), added by migration 20260902120000.
 *  Optional until the generated database types are refreshed. */
export type EventExtras = { tags?: string[] };

/** `site_settings.bank` — council account for manual fee payment. */
export type BankDetails = {
  account_name: string;
  bank_name: string;
  bsb: string;
  account_number: string;
  cards: string;
};
