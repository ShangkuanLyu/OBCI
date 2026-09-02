import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "always",
  // Public pages set no cookies for anonymous visitors (privacy policy §6);
  // the locale is always explicit in the URL, so the NEXT_LOCALE cookie the
  // Node-mode middleware would otherwise set adds nothing.
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
