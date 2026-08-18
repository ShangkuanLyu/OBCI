# Design System — OBCI

Formula: **Apple design discipline × international-chamber authority × editorial information architecture × OBCI brand palette (indigo · royal blue · rose · ivory, sourced from obci.org.au).**
Not: Apple clone, generic corporate template, SaaS landing page.

Tokens live in [src/app/globals.css](../src/app/globals.css) (Tailwind v4 `@theme`). This document records the decisions and the usage rules.

---

## 1. Colour

Palette extracted from the organisation's existing brand (obci.org.au).

| Token | Hex | Role |
|---|---|---|
| `navy-950` | `#030327` | Footer, deepest grounds, hero scrim |
| `navy-900` | `#05053E` | **Primary institutional colour** — header, dark sections |
| `navy-800/700` | `#101060` / `#1A1A78` | Hover/tints on dark surfaces |
| `navy-100/50` | `#E9EBF5` / `#F4F5FA` | Cool tinted backgrounds, image placeholders |
| `royal-700` | `#1B3373` | Hover state of royal |
| `royal-600` | `#213E8C` | **Brand royal blue** — links, secondary buttons, numerals |
| `royal-500` | `#2A70DE` | Bright blue highlight (sparingly) |
| `rose-600` | `#B03A5A` | Rose text on light backgrounds, hover of rose |
| `rose-500` | `#C84869` | **Accent** — primary CTA, active nav marker, labels |
| `rose-400` | `#DE7B95` | Rose labels on dark surfaces |
| `ivory` | `#F7F5E1` | Warm alternate section background |
| `ink` | `#1D1D1F` | Body text |
| `grey-50` | `#F5F5F7` | Cool alternate section background |
| `grey-300` | `#D2D2D7` | Hairline borders, dividers |
| `grey-500/600` | `#6E6E73` / `#515154` | Secondary text, meta |

Rules:
- Rose is the action accent (primary buttons white-on-rose, labels, active markers). Royal blue is the informational accent (links, "view all", numerals, secondary buttons). Neither is used as a large text colour.
- Large colour surfaces are reserved for the brand tri-panel pattern (royal / rose / indigo blocks, e.g. home membership panels) — echoing the brand's colour-block language; use at most once per page.
- Page zoning surfaces: white → grey-50 → ivory → navy-900/950. Photography with an indigo scrim (≤60%) is the preferred hero treatment.
- On dark indigo: text white / white-70; labels rose-400.

## 2. Typography

- **Family:** Geist Sans (Latin) → PingFang SC / Hiragino Sans GB / Microsoft YaHei / Noto Sans SC (CJK) → system. One family; hierarchy comes from size/weight/spacing, not font changes.
- **Scale** (`text-display` … `text-caption` utilities): 56 / 48 / 36 / 28 / 21 / 19 / 17 / 15 / 13. Hero stays ≤ 56px desktop (brief: 48–72 range, chamber restraint).
- **Weights:** 600 (semibold) for headings, 500 for UI/labels, 400 body. Never 700+ display weights, never light weights below 400.
- Negative tracking on large headings (−0.02em); positive tracking (+0.08em) only on uppercase/caps section labels.
- **Reading measure:** body text capped at `--container-prose` (~65ch). Never full-width paragraphs.
- **Section pattern:** caption-size gold label (uppercase for Latin, normal for zh) → h2 → optional 19px standfirst, all left-aligned to the same grid edge (centered variant allowed for symmetric sections, used sparingly and consistently).
- zh/en note: Chinese headings need slightly smaller sizes at equal visual weight — headings use CSS clamp and identical boxes in both locales; no per-locale layout drift.

## 3. Spacing & grid

- Tailwind 4px base scale only; **no arbitrary values** (`mt-[37px]`) without a written reason.
- **Vertical rhythm:** section padding `py-24 md:py-32` (96/128) for major sections, `py-16` (64) mobile. Label→heading 16, heading→standfirst 24, standfirst→content 48–64.
- **Container:** one site container — `max-w-[69.5rem]` (1112px) with `px-6 md:px-10` gutters. Every section header, grid, and footer aligns to this same box. No per-page container drift.
- Grid: 12-col mental model; common splits 5/7, 4/8, 3-col editorial (gap 32/40).

## 4. Surfaces, borders, radius, shadow

- Content zoning via background change + whitespace, **not cards**. News = editorial grid (image, meta, headline, hairline dividers). Leadership = portrait + typography. Events = date + typography + divider rows.
- Hairline borders (`border-grey-300`, 1px) are the default separator; shadows effectively banned (only a barely-visible elevation on sticky header and open dropdowns).
- Radius: buttons/inputs `rounded-md` (8), images `rounded-md` or square, the rare feature panel `rounded-lg` (12). Nothing above 12px. Navigation, news items, footer, tables: square.

## 5. Buttons & links

| Variant | Style | Use |
|---|---|---|
| Primary | gold-500 bg, navy-950 text, hover gold-600, h-11 px-6, text-small medium | one per composition ("立即入会 / Join") |
| Secondary (light) | 1px navy-800 border, navy-800 text, hover navy-50 bg | supporting action |
| Secondary (dark) | 1px white/40 border, white text, hover white/10 bg | on navy surfaces |
| Text link | navy-800 (light) / gold-400 (dark) + "→", hover underline | editorial "read more" |

All buttons: same height per size class, no width jitter between locales (min-width where needed), transition 200ms.

## 6. Imagery

Photography: business delegations, government meetings, conferences, Melbourne/Australia, trade, ceremonies, panels. Duotone/darken (navy scrim up to 55%) permitted on hero imagery for text contrast. Forbidden: handshake stock clichés, laptop-and-coffee, abstract tech/AI glow, city-network effects. Until client photography arrives, use restrained solid-navy compositions rather than fake stock.

## 7. Motion

- Reveal-on-scroll: opacity 0→1 + translateY 12→0, 600ms, quiet ease; stagger ≤ 3 items, 80ms apart. Implemented via `[data-reveal]` + IntersectionObserver; reduced-motion users get static content.
- Header: sticky; transparent-over-hero → solid navy after 24px scroll, 300ms.
- Image hover in editorial grids: scale 1→1.03, 500ms, inside overflow-hidden box. Nothing else animates. No bounce, blobs, parallax, gradient animation, cursor effects.

## 8. Header & navigation

- Desktop: thin single bar (h-16), navy-900. Left: wordmark lockup (OBCI monogram + 大洋洲工商协会 / Oceania Business Association). Center/right: 6 top-level items + locale switch + gold CTA. Dropdowns: flat navy panels, hairline top border, precise column alignment, no shadow blur clouds.
- Active state: gold underline bar (2px) aligned to baseline grid; hover = white→gold-400 text transition only.
- Mobile: h-14 bar, full-screen navy sheet menu, typographic (h3-size items), CTA pinned at bottom.
- Both locales must produce identical header heights — labels sized to fit, baseline-aligned.

## 9. Footer

Navy-950. Four columns on the site container grid: identity + mission line · quick navigation · membership links · contact (address, email, phone). Bottom hairline row: copyright (bilingual), legal links. No social icons until real accounts exist.
