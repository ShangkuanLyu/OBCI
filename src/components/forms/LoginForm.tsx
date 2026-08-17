"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(
        locale === "zh"
          ? "登录失败，请检查邮箱与密码。"
          : "Sign-in failed. Check your email and password.",
      );
      setPending(false);
      return;
    }
    router.push(`/${locale}/admin`);
    router.refresh();
  }

  const inputClass =
    "h-11 w-full rounded-md border border-grey-300 bg-white px-4 text-small outline-none transition-colors focus:border-navy-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="login-email" className="mb-2 block text-small font-medium text-ink">
          {locale === "zh" ? "电子邮箱" : "Email"}
        </label>
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
        <label htmlFor="login-password" className="mb-2 block text-small font-medium text-ink">
          {locale === "zh" ? "密码" : "Password"}
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
      {error && <p className="text-small text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-navy-900 text-small font-medium text-white transition-colors duration-200 hover:bg-navy-800 disabled:opacity-50"
      >
        {locale === "zh" ? "登录" : "Sign in"}
      </button>
    </form>
  );
}
