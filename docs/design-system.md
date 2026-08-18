# Design System — OBCI (light institutional language)

Direction: **modern official-organisation website** — light, orderly, visually engaging.
Rigorous grid and typography; bright surfaces; brand royal blue as the leading colour; photography and cards used generously but consistently. The dark indigo is reserved for the footer.

Tokens live in [src/app/globals.css](../src/app/globals.css) (Tailwind v4 `@theme` + the `card-surface` utility).

---

## 1. Colour

| Token | Hex | Role |
|---|---|---|
| `royal-600` | `#213E8C` | **Primary brand colour** — buttons, links, active nav, numerals, CTA band |
| `royal-700` | `#1B3373` | Hover of royal |
| `royal-500` | `#2A70DE` | Bright highlight (sparingly), link hover |
| `royal-200` | `#A9C0F0` | Labels on the dark footer |
| `royal-100` | `#DCE7F8` | Decorative offset frames |
| `royal-50` | `#EEF3FB` | **Tinted section band** — page heroes, alternate sections, chips |
| `rose-500` | `#C84869` | **Accent** — join/apply CTAs, label rule, card top-bars |
| `rose-600` | `#B03A5A` | Hover of rose |
| `navy-900/950` | `#05053E` / `#030327` | **Footer only** |
| `ink` | `#16182D` | Headings, body |
| `grey-50/100/300` | `#F6F7FA` / `#E9EBF1` / `#D3D6DF` | Alternate band, card borders, dividers |
| `grey-500/600` | `#666B7D` / `#4B5065` | Secondary text |

Rules:
- Public-page surfaces: **white → grey-50 → royal-50** only. No dark sections; dark = footer.
- Royal = informational/primary actions; rose = the membership accent (join/apply buttons, small rules, top-bars) — never body text.
- CTA emphasis: `rounded-2xl bg-royal-600` band inside the container, with an `accent` (rose) button.

## 2. Cards & surfaces

- The single elevation is the `card-surface` utility: white, 1px `grey-100` border, 16px radius, soft brand-tinted shadow. Hover adds a slightly deeper shadow (see home page for the exact class).
- Used for: news cards, chapter tiles, event rows, membership cards, stats strip, forms panels, contact info.
- Chips: `rounded-full bg-royal-50 px-2.5 py-1 text-royal-600` (white bg when sitting on royal-50). Number chips: `h-9 w-9 rounded-lg bg-royal-50 text-royal-600`.

## 3. Typography & grid

Unchanged discipline: Geist + CJK system stack; scale 56/48/36/28/21/19/17/15/13; one 1112px container (`Container`); body measure ≤ 42rem; section rhythm `py-16 md:py-24` (home uses `py-18 md:py-24`). Section header = `SectionHeading` (royal label with short rose rule → ink heading → grey standfirst).

## 4. Header / hero / footer

- **Header**: white, sticky, hairline bottom border; royal-blue logo (`public/logo-dark.png`), ink nav with royal active underline, rose join CTA.
- **Interior page tops**: `PageHero` — royal-50 band, label with rose rule, ink h1, grey standfirst.
- **Home hero**: royal-50 band; 6/6 split — headline left, rounded-2xl photo right with royal-100 offset frame; stats strip in a card-surface row beneath.
- **Footer**: navy-950, white logo (`public/logo.png`), royal-200 labels.

## 5. Imagery

Photography is required, not optional: news/event covers (Supabase `media` bucket), hero and about photos. Crops: 3/2 (news), 16/10 (event thumbs), 4/3 (feature splits). Radius: rounded-md inside cards, rounded-2xl for feature images. No stock clichés; use the organisation's own event photography.

## 6. Motion

Unchanged: quiet reveal (opacity + 12px rise), image hover scale 1.03 inside overflow-hidden, card hover shadow deepening, 200–500ms. Nothing else animates.
