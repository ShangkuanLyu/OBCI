"use client";

import { useEffect, useRef } from "react";

/**
 * Quiet scroll-reveal wrapper. Renders children immediately for no-JS /
 * reduced-motion users (CSS gates the animation, see globals.css).
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "section" | "li" | "article";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute("data-reveal", "visible");
    let observer: IntersectionObserver | undefined;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              show();
              observer?.disconnect();
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      observer.observe(el);
    } catch {
      show();
    }
    // Safety net: hidden documents suppress IntersectionObserver callbacks —
    // never leave content invisible.
    const fallback = setTimeout(show, 1200);
    return () => {
      observer?.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
