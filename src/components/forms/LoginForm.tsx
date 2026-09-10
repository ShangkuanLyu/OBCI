"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";


export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(t("error"));
      setPending(false);
      return;
    }
    router.push(`/${locale}/admin`);
    router.refresh();
  }

  const inputClass =
    "h-11 w-full rounded-md border border-grey-300 bg-white px-4 text-small transition-colors focus:border-sea-600 disabled:opacity-50";

  return (
    <div>
      <form
        method="post"
        action=""
        noValidate={false}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-small font-medium text-ink"
          >
            {t("email")}
          </label>
          {/* Credentials stay unnamed: never form-successful, so a
              no-JS submit carries nothing. */}
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-small font-medium text-ink"
          >
            {t("password")}
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <p aria-live="polite">
          {error && <span className="text-small text-red-700">{error}</span>}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-sea-800 text-small font-medium text-white transition-colors duration-200 hover:bg-sea-700 disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </form>
    </div>
  );
}
