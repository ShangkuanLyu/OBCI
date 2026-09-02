import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { Json } from "@/types/database.types";

/* Fixed slot counts; the save action validates exactly these lengths. */
const CORE_VALUE_SLOTS = 4;
const ORG_UNIT_SLOTS = 6;
const GALLERY_SLOTS = 8;

type SettingsRecord = Record<string, Json | undefined>;

function asRecord(value: Json | undefined): SettingsRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as SettingsRecord)
    : {};
}

function str(record: SettingsRecord, field: string): string {
  const value = record[field];
  return typeof value === "string" ? value : "";
}

function bool(record: SettingsRecord, field: string): boolean {
  const value = record[field];
  return typeof value === "boolean" ? value : false;
}

function num(record: SettingsRecord, field: string, fallback: number): number {
  const value = record[field];
  return typeof value === "number" ? value : fallback;
}

function strList(record: SettingsRecord, field: string): string[] {
  const value = record[field];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function itemList(record: SettingsRecord): SettingsRecord[] {
  const value = record["items"];
  return Array.isArray(value) ? value.map((entry) => asRecord(entry)) : [];
}

function bilingual(record: SettingsRecord) {
  return { text_zh: str(record, "text_zh"), text_en: str(record, "text_en") };
}

function titledSlots(items: SettingsRecord[], count: number) {
  return Array.from({ length: count }, (_, index) => {
    const item = items[index] ?? {};
    return {
      title_zh: str(item, "title_zh"),
      title_en: str(item, "title_en"),
      text_zh: str(item, "text_zh"),
      text_en: str(item, "text_en"),
    };
  });
}

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff(locale);
  if (session.profile.role !== "admin") {
    redirect(`/${locale}/admin`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "contact",
      "identity",
      "membership",
      "vision",
      "mission",
      "core_values",
      "revenue_note",
      "member_benefits",
      "pillars",
      "banners",
      "org_structure",
      "strategy_committee",
      "secretariat",
      "gallery",
      "review",
      "legal",
    ]);
  if (error) throw new Error(`site_settings: ${error.message}`);

  const map = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  const contact = asRecord(map["contact"]);
  const identity = asRecord(map["identity"]);
  const membership = asRecord(map["membership"]);
  const benefitItems = itemList(asRecord(map["member_benefits"]));
  const bannerItems = itemList(asRecord(map["banners"]));
  const orgItems = itemList(asRecord(map["org_structure"]));
  const galleryItems = itemList(asRecord(map["gallery"]));
  const review = asRecord(map["review"]);
  const legal = asRecord(map["legal"]);

  const zh = locale === "zh";

  return (
    <>
      <h1 className="text-h3 font-semibold text-ink">
        {zh ? "站点设置" : "Site settings"}
      </h1>
      <div className="mt-8 max-w-3xl">
        <SettingsForm
          locale={locale}
          contact={{
            address_label_zh: str(contact, "address_label_zh"),
            address_label_en: str(contact, "address_label_en"),
            address_zh: str(contact, "address_zh"),
            address_en: str(contact, "address_en"),
            address2_label_zh: str(contact, "address2_label_zh"),
            address2_label_en: str(contact, "address2_label_en"),
            address2_zh: str(contact, "address2_zh"),
            address2_en: str(contact, "address2_en"),
            phone: str(contact, "phone"),
            fax: str(contact, "fax"),
            mobile: str(contact, "mobile"),
            email: str(contact, "email"),
            wechat_zh: str(contact, "wechat_zh"),
            wechat_en: str(contact, "wechat_en"),
            membership_contact_name: str(contact, "membership_contact_name"),
            membership_contact_phone: str(contact, "membership_contact_phone"),
            // confirmed_fields is the only source of confirmation state.
            confirmed_fields: strList(contact, "confirmed_fields"),
          }}
          identity={{
            name_zh: str(identity, "name_zh"),
            name_en: str(identity, "name_en"),
            acronym: str(identity, "acronym"),
            tagline_zh: str(identity, "tagline_zh"),
            tagline_en: str(identity, "tagline_en"),
          }}
          membership={{
            review_days: num(membership, "review_days", 5),
            fees_published: bool(membership, "fees_published"),
            validity_note_zh: str(membership, "validity_note_zh"),
            validity_note_en: str(membership, "validity_note_en"),
          }}
          vision={bilingual(asRecord(map["vision"]))}
          mission={bilingual(asRecord(map["mission"]))}
          coreValues={titledSlots(
            itemList(asRecord(map["core_values"])),
            CORE_VALUE_SLOTS,
          )}
          revenueNote={bilingual(asRecord(map["revenue_note"]))}
          memberBenefits={{
            zh: benefitItems.map((item) => str(item, "text_zh")).join("\n"),
            en: benefitItems.map((item) => str(item, "text_en")).join("\n"),
          }}
          pillars={titledSlots(itemList(asRecord(map["pillars"])), 4)}
          banners={Array.from({ length: 3 }, (_, index) => {
            const item = bannerItems[index] ?? {};
            return {
              key: str(item, "key"),
              title_zh: str(item, "title_zh"),
              title_en: str(item, "title_en"),
              text_zh: str(item, "text_zh"),
              text_en: str(item, "text_en"),
              cta_label_zh: str(item, "cta_label_zh"),
              cta_label_en: str(item, "cta_label_en"),
              cta_href: str(item, "cta_href"),
              image_path: str(item, "image_path"),
              is_active: bool(item, "is_active"),
            };
          })}
          orgStructure={Array.from({ length: ORG_UNIT_SLOTS }, (_, index) => {
            const item = orgItems[index] ?? {};
            return {
              key: str(item, "key"),
              kind: str(item, "kind"),
              name_zh: str(item, "name_zh"),
              name_en: str(item, "name_en"),
              note_zh: str(item, "note_zh"),
              note_en: str(item, "note_en"),
            };
          })}
          strategyCommittee={bilingual(asRecord(map["strategy_committee"]))}
          secretariat={bilingual(asRecord(map["secretariat"]))}
          gallery={Array.from({ length: GALLERY_SLOTS }, (_, index) => {
            const item = galleryItems[index] ?? {};
            return {
              image_path: str(item, "image_path"),
              news_slug: str(item, "news_slug"),
              event_slug: str(item, "event_slug"),
              caption_zh: str(item, "caption_zh"),
              caption_en: str(item, "caption_en"),
            };
          })}
          confirmedModules={strList(review, "confirmed_modules")}
          legal={{
            constitution_version: str(legal, "constitution_version"),
            terms_version: str(legal, "terms_version"),
            privacy_version: str(legal, "privacy_version"),
          }}
        />
      </div>
    </>
  );
}
