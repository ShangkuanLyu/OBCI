# Information Architecture — OBCI (new site)

Basis: [site-audit.md](site-audit.md) (what actually exists), the client's redesign prototype (nav: 首页 / 关于 / 行业分会 / 会员服务 / 资讯中心 / 活动展会 / 加入我们 / 联系我们), and the development brief.

---

## 1. Brand decision (working)

- **Name:** 大洋洲工商协会 / Oceania Business Association Incorporated, acronym **OBCI** (matches domain obci.org.au, repo, and the brief).
- The current site mixes OBCI / OBAI / OBC and three contact emails. The new build uses OBCI + `info@obci.org.au` as placeholders in `site_settings` — **flagged for client confirmation** (open question, not a blocker: everything is CMS-editable).
- Tagline retained: “Bridging Oceania and China, Empowering Business Growth” / 「搭建中澳桥梁，赋能商业成长」.

## 2. Site map & routes

All public routes are locale-prefixed: `/zh/...` (default) and `/en/...`.

```
/                      首页 Home
/about                 关于协会 About — introduction, mission/vision, timeline
/about/leadership      领导团队 Leadership — president, honorary chairmen, advisors
/about/structure       组织架构 Governance — committees, secretariat, provincial partnerships
/chapters              行业分会 Chapters & Committees — index (6 committees + Canberra branch)
/chapters/[slug]       Chapter detail
/news                  资讯中心 News & Insights — editorial index + category filter
/news/[slug]           Article
/events                活动展会 Events — upcoming + past
/events/[slug]         Event detail (+ registration enquiry)
/membership            会员服务 Membership — tiers, benefits, process
/membership/apply      在线入会 Application form (→ Supabase)
/projects              项目合作 Projects & Opportunities (CMS-fed; thin until client provides content)
/contact               联系我们 Contact — Melbourne office, form (→ Supabase)
/terms  /privacy  /accessibility        Legal
/login                 会员登录 (member/admin sign-in)
/admin/...             CMS dashboard (role-gated, not in public nav)
```

Top navigation (7 items + CTA, both locales identical structure):
**首页 · 关于协会 · 行业分会 · 资讯中心 · 活动展会 · 会员服务 · 联系我们 · [立即入会 Join]**
About/Chapters/News get dropdown columns; `加入我们 Join` is the gold CTA → `/membership/apply`.

Footer: identity + mission line · quick nav · membership (apply / tiers / directory-coming) · contact + legal row.

## 3. Content model → pages

| Domain | Table(s) | Feeds |
|---|---|---|
| News | `news`, `news_categories` | /news, /news/[slug], home featured |
| Events | `events` (+ `event_registrations` later) | /events, /events/[slug], home upcoming |
| Leadership | `leadership` | /about/leadership, about teaser |
| Chapters | `industry_chapters` | /chapters, /chapters/[slug] |
| Partners | `partners` | home partner band, /about |
| Projects | `projects` | /projects |
| Membership | `membership_types`, `membership_applications`, `membership_documents` | /membership, /membership/apply |
| Contact | `contact_enquiries` | /contact form |
| Newsletter | `newsletter_subscribers` | footer signup |
| Site settings | `site_settings` | contact identity, socials, hero copy overrides |

News categories (from real content themes): 协会动态 Association News · 经贸合作 Trade & Cooperation · 健康产业 Health Industry · 政策资讯 Policy & Insights.

## 4. Real content to seed (from audit)

- **News:** the 7 genuine posts (2024-09 → 2026-07), incl. AGM 2026, Taizhou delegation, Liaoning CCPIT visit, TCM Forum series. The 6 Wix demo articles are dropped (410).
- **Events:** 7th World Traditional Medicine Forum (25–26 Oct 2025, Melbourne) as past event; AGM 2026 (1 May 2026, World Trade Centre Melbourne) backfilled from news. Sydney/Brisbane demo events dropped.
- **Leadership:** Hon. Bruce Atkinson AM (Honorary Chairman) · Hon. Ken Smith AM (Founding President & Honorary Chairman) · Sunny Sun (Executive President) · Diana Lin (Vice Chair of the Board).
- **Chapters/committees (2026 AGM):** Education (Yang Li) · Construction (Bryan Guan) · Real Estate (Diana Chen) · High-Level Talent & Doctoral Innovation (Arina Tang) · Business Services (Albert Zhao) · Canberra Branch (Ding Ding).
- **Membership types (no fees announced — price fields nullable, “contact us” fallback):** Individual · Corporate · Industry Associations & Institutions; benefits + “review within 5 working days” from audit verbatim.
- **Contact:** Level 8, 167–169 Queen Street, Melbourne VIC 3000 · +61 3 9640 0566 · email pending client confirmation.
- **Partnerships:** China provincial partnerships (Zhejiang, Jiangsu, Anhui, Shanghai, Yunnan, Guangdong, Inner Mongolia) — rendered as text band, not fake logos.

## 5. What the new IA deliberately drops or defers

- **Forum** — zero real activity on old site; defer (member-area feature, not public IA).
- **Member industry directory / product showcase** — zero real members/products; the schema supports them (`members`, future `products`) but public pages ship only when real data exists. Old spam accounts are not migrated.
- **Donations, Podcast, “Support Us”** — template debris, dropped.
- **Regional contact offices page** — no real data; folded into /contact as a “partnerships” block.

## 6. Redirect map (old Wix → new)

To implement in `next.config.ts` (301). Key mappings:

| Old | New |
|---|---|
| `/about`, `/team-4` | `/zh/about` |
| `/services-7` | `/zh/about/structure` |
| `/news`, `/news-1` | `/zh/news` |
| `/post/[slug]` (7 real posts) | `/zh/news/[new-slug]` (per-slug table) |
| `/events`, `/events-1/the-7th-world-traditional-medicine-forum…` | `/zh/events`, `/zh/events/world-traditional-medicine-forum-2025` |
| `/general-7` | `/zh/membership` |
| `/projects-6`, `/copy-of-member-industry-directory` | `/zh/membership` |
| `/current-projects`, `/s-projects-basic`, `/s-projects-side-by-side`, `/s-projects-side-by-side-1` | `/zh/projects` |
| `/contact`, `/contact-2`, `/zh/contact`, `/zh/contact-2` | `/zh/contact` |
| `/terms-and-conditions` | `/zh/terms` |
| `/copy-of-terms-conditions` | `/zh/privacy` |
| `/accessibility-statement` | `/zh/accessibility` |
| `/forum`, `/members`, `/donation-thank-you-page`, `/news-1/*` demo posts, demo events | 410 / redirect to nearest parent |

## 7. Bilingual policy

- Default locale **zh** (primary audience), full **en** parity for chrome; CMS content bilingual via `*_zh` / `*_en` columns with cross-locale fallback (a post that exists only in English still renders under /zh with an “English only” note — content must never disappear because a translation is missing).
- Old site was English-only; seeded news keeps English originals and gets Chinese titles/summaries; full-body translations are editorial work for the client, supported by the CMS from day one.
