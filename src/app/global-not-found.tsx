import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Container } from "@/components/ui/Container";
import { basePath } from "@/lib/utils/asset";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "页面不存在 · Page not found | OBCI",
  description:
    "您访问的页面不存在或已移除。The page you are looking for does not exist or has been removed.",
};

const BUTTON =
  "inline-flex h-11 items-center justify-center rounded-lg border border-grey-300 bg-white px-6 text-small font-medium text-sea-800 transition-colors duration-200 hover:border-sea-800";

/**
 * Global 404 for URLs that match no route at all (including paths outside
 * the locale prefix). It renders without the locale layout, so there is no
 * next-intl context: copy is hard-coded in both languages.
 */
export default function GlobalNotFound() {
  const home = (locale: "zh" | "en") => `${basePath()}/${locale}/`;

  return (
    <html lang="zh" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <main className="flex flex-1 items-center bg-white py-32 md:py-40">
          <Container className="text-center">
            <p className="text-caption font-medium uppercase tracking-[0.08em] text-sea-800">
              404
            </p>
            <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink md:text-h2">
              <span>页面不存在</span>
              <span aria-hidden> · </span>
              <span lang="en">Page not found</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[36rem] text-body text-grey-600">
              <span>您访问的页面不存在或已移除。</span>{" "}
              <span lang="en">
                The page you are looking for does not exist or has been
                removed.
              </span>
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href={home("zh")} className={BUTTON}>
                返回首页
              </a>
              <a href={home("en")} lang="en" className={BUTTON}>
                Back to home
              </a>
            </div>
          </Container>
        </main>
      </body>
    </html>
  );
}
