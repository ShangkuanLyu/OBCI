"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ locale }: { locale: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="text-caption text-white/60 transition-colors hover:text-white"
    >
      {locale === "zh" ? "退出登录" : "Sign out"}
    </button>
  );
}
