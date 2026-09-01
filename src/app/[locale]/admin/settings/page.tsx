import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { Json } from "@/types/database.types";

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

function itemList(record: SettingsRecord): SettingsRecord[] {
  const value = record["items"];
  return Array.isArray(value) ? value.map((entry) => asRecord(entry)) : [];
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
      "revenue_note",
      "member_benefits",
      "pillars",
      "banners",
    ]);
  if (error) throw new Error(`site_settings: ${error.message}`);

  const map = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  const contact = asRecord(map["contact"]);
  const identity = asRecord(map["identity"]);
  const membership = asRecord(map["membership"]);
  const vision = asRecord(map["vision"]);
  const revenueNote = asRecord(map["revenue_note"]);
  const benefitItems = itemList(asRecord(map["member_benefits"]));
  const pillarItems = itemList(asRecord(map["pillars"]));
  const bannerItems = itemList(asRecord(map["banners"]));

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
            address_zh: str(contact, "address_zh"),
            address_en: str(contact, "address_en"),
            phone: str(contact, "phone"),
            email: str(contact, "email"),
            email_confirmed: bool(contact, "email_confirmed"),
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
          }}
          vision={{
            text_zh: str(vision, "text_zh"),
            text_en: str(vision, "text_en"),
          }}
          revenueNote={{
            text_zh: str(revenueNote, "text_zh"),
            text_en: str(revenueNote, "text_en"),
          }}
          memberBenefits={{
            zh: benefitItems.map((item) => str(item, "text_zh")).join("\n"),
            en: benefitItems.map((item) => str(item, "text_en")).join("\n"),
          }}
          pillars={Array.from({ length: 4 }, (_, index) => {
            const item = pillarItems[index] ?? {};
            return {
              title_zh: str(item, "title_zh"),
              title_en: str(item, "title_en"),
              text_zh: str(item, "text_zh"),
              text_en: str(item, "text_en"),
            };
          })}
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
        />
      </div>
    </>
  );
}
