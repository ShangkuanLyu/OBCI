import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intl = createIntlMiddleware(routing);

const AUTH_PATHS = /\/(admin|login|member)(\/|$)/;

export default async function proxy(request: NextRequest) {
  const response = intl(request);

  // Refresh the Supabase session only where auth matters — public pages stay
  // cookie-free and cacheable.
  if (AUTH_PATHS.test(request.nextUrl.pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
