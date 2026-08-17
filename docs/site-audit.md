# Site Audit — obci.org.au (current Wix site)

**Audit date:** 2026-08-17
**Method:** Automated fetch of every section enumerated from the site's sitemap index (`https://www.obci.org.au/sitemap.xml` → pages, blog-posts, blog-categories, event-pages, member-profile, dynamic-news sub-sitemaps). Eight parallel audits covered home, about, events, news, projects, membership, contact, and legal/misc pages, recording page content verbatim where possible, plus forms, CTAs, language coverage, and issues.

---

## 1. Executive summary

- The organisation appears under **at least six names** across its own site: OBCI (domain), OBAI ("Oceania Business Association Incorporated", page titles, copy, email domain), OBC ("Oceania Business Council", news posts), "Oceania Business & Industry Council", a stray "OBIC", and legacy "ACBCA". Canonical naming must be settled before anything is built.
- **Real content is very thin**: 7 genuine blog posts, 1 real event (7th World Traditional Medicine Forum, Melbourne, 25–26 Oct 2025), 1 brochure PDF, 1 office address, and one page of membership eligibility copy. Everything else is scaffold or unedited Wix template.
- The single richest source of org facts is the **2026 AGM news post**: leadership names (Hon. Bruce Atkinson AM, Hon. Ken Smith AM, Sunny Sun), six new committees with named secretaries-general, seven Chinese provincial partnerships, and three named projects.
- **Wix template debris is live in production**: an unattributed Jane Eyre quote on the homepage, 14 placeholder "Project Name" cards across three project pages, two demo events dated 2035 ("Sydney, Sydney" / "Brisbane, Brisbane"), 6 stock demo articles at `/news-1` ("5 Most Promising Fintech Startups" etc.), and visible Wix editor instructions ("Click on \"Edit Text\"…").
- **All three legal pages are unedited Wix boilerplate.** The T&C and Privacy Policy pages explain how to *write* such documents; the Accessibility Statement was published with every `[enter …]` placeholder unfilled. The site legally has no terms, no privacy policy, and no accessibility statement — despite collecting 7 fields of personal data per newsletter signup.
- **Membership has no pricing, no tiers with fees, and no real application flow** — just three unpriced eligibility categories and a generic name/email/message contact form. Fee schedules and workflow must be sourced from the client.
- **Contact identity is broken**: displayed email is info@obai.com.au but the mailto behind it goes to info@anzhpl.com.au (a third domain); a Wix placeholder `mailto:info@mysite.com` is still live; the phone number links to a Google search instead of `tel:`; social icons point to Wix's own default accounts (facebook.com/wix etc.).
- **Conversion paths are broken**: "Join Us" links to the Events page, not a join form; all event pages say "Registration is Closed" with no alternative; the only working capture is an oversized 7-field newsletter form repeated in every footer.
- **Bilingual support barely exists** despite the Oceania–China mission: only `/zh/contact` and `/zh/contact-2` exist, partially translated (English H1s, form labels, footer), and they lead with the wrong email. The rest of the site is English-only; the only other Chinese is leakage (logo filename "WTC 活动PPT专用_副本2.png", a full-width colon, a corrupted heading).
- **Member area is polluted with SEO spam signups** (~16 member profiles; several real — gloriagao, christinel, xavier-ding, zhangxinyuan — mixed with spam like "bestcryptotradingappinindia", "shortcutkeysingmail"). Open registration needs moderation in the new build.
- **URL hygiene is chaotic**: of 22 pages, at least 10 have Wix auto-slugs or duplicate slugs (`team-4`, `services-7`, `general-7`, `contact-2`, `news-1`, `projects-6`, `s-projects-*`, `copy-of-*`). The canonical Privacy Policy lives at `/copy-of-terms-conditions`. Two slugs serve content unrelated to their names.
- **Imagery is not web-grade**: the site logo is a PowerPoint slide export with a Chinese working filename; post photos are low-res/uncaptioned (some 49×30px embeds); project and directory pages use generic stock (with visible Unsplash credits).
- News frontend hides dates (no dates on cards, no year on posts) and exposes raw Wix usernames as authors ("marketing58449", "Design ANZHPL"). Blog has zero categories/tags.
- Footer promises pages that don't exist ("Podcast", "Support Us" — both loop to the homepage) and omits legal/trust basics (no copyright line, ABN, street address, or acknowledgement of country).

---

## 2. Brand identity findings

**Names in use (all for apparently the same organisation):**

| Identity | Where it appears |
|---|---|
| OBCI | Domain obci.org.au only — the acronym never appears in site copy |
| OBAI / "Oceania Business Association Incorporated" | Page titles ("OBAI Oceania-China"), nav ("OBAI Projects", "OBAI Forum"), all body copy, footer, email domain |
| "Oceania Business Council (OBC)" | The three most recent news posts (Diana Lin delegation, 2026 AGM, Taizhou delegation) |
| "Oceania Business & Industry Council" | Listed as an organiser in the Oct 2025 Expo post |
| "OBIC" | Stray inconsistent reference on /about |
| "ACBCA" (Australia-China Business and Commerce Association) | Legacy 2015 event recap post — apparent predecessor org |

**Contact identities (three email domains):**
- `info@obai.com.au` — displayed sitewide (footer, contact blocks)
- `info@anzhpl.com.au` — the *actual* mailto target behind the displayed obai.com.au email on /contact; shown openly on /contact-2, /general-7, and both /zh pages. "ANZHPL" matches "Australia New Zealand Health Products Pty Ltd" (also the mismatched slug of the 2015 legacy post) — a leftover second entity.
- `info@mysite.com` — live Wix template placeholder mailto behind a stray "|" separator on /contact.

**Taglines / verbatim brand copy:**
- Hero H1: "Bridging Oceania and China, Empowering Business Growth."
- Mission: "Connecting Oceania and China, Empowering Growth, and Building Lasting Opportunities for Global Success."
- Membership pitch (repeated sitewide): "Become a member of OBAI and take your business to the next level on the Oceania-China stage!"
- Intro paragraph (/team-4, near-complete About content): "OBAI is dedicated to creating a thriving business environment that bridges the unique strengths of Oceania and China. By fostering mutual understanding and cooperation, the chamber empowers its members to achieve long-term growth and success in an increasingly interconnected world."

**Other identity facts:** Non-profit membership organisation; HQ Melbourne; service regions Australia, NZ, Pacific Islands, China; representative offices "in multiple Chinese cities" (no specifics anywhere). Phone (03) 9640 0566 / +61 3 9640 0566. Address (contact page only): Level 8/ 167-169 Queen Street, Melbourne VIC 3000. No ABN, founding date, or member counts published.

---

## 3. Complete page inventory

From `pages-sitemap.xml` (22 URLs, all lastmod 2026-07-01) plus event/blog/language-variant URLs.

| URL | Title (actual content) | Purpose | Status |
|---|---|---|---|
| `/` | Home \| OBAI Oceania-China | Homepage, membership pitch, news teasers | Real content, flawed (Jane Eyre template quote, broken CTAs) |
| `/about` | About (H1 "About OBAI") | Org intro, mission, benefits | Thin real content |
| `/team-4` | Chamber Introduction | Mission/values | Thin real (~3 paragraphs; no team despite slug) |
| `/services-7` | Organisational Structure | Governance/org chart | Template debris — 4 unedited "Service Name" placeholders, ~1 real sentence |
| `/events` | Events | Events listing | Empty — "No events at the moment" |
| `/events-1/sydney-event` | Sydney Event | Event detail | Template debris — Wix demo, dated 20 Nov 2035 |
| `/events-1/brisbane-event` | Brisbane Event | Event detail | Template debris — Wix demo, dated 19 Dec 2035 |
| `/events-1/the-7th-world-traditional-medicine-forum-…` | 7th World Traditional Medicine Forum | Event detail | Real (only real event; past, thin) |
| `/news` | News ("Latest News") | Blog index | Real — 7 posts, no dates on cards |
| `/news-1` | (second news collection) | — | Template debris — 6 Wix stock demo articles, indexed in sitemap |
| `/post/<slug>` ×7 | See section 5 | News posts | Real — all 7 substantive |
| `/current-projects` | OBAI Projects ("Our Work") | Projects landing | Placeholder — 4 unfilled project cards |
| `/s-projects-basic` | Project Investment Opportunities | Investment listings | Placeholder — 6 unfilled cards + visible Wix editor text |
| `/s-projects-side-by-side` | Project Requirement Announcements | Tender/requirement listings | Placeholder — 4 unfilled cards |
| `/s-projects-side-by-side-1` | Business Information & Legal Regulations | Resource directory | Partial real — 12 headline bullets, mostly linkless; slug mismatched |
| `/projects-6` | Member Industry Directory | Member directory | Scaffold — 6 category tiles, zero members; slug mismatched |
| `/copy-of-member-industry-directory` | Member Product Showcase | Product showcase | Duplicate scaffold — zero products |
| `/general-7` | Membership Centre ("OBAI Membership Guide") | Membership hub + application | Real but thin — categories/benefits, no fees |
| `/forum` | OBAI Forum | Member forum | Dead — Wix widget fails to render; no visible posts |
| `/members` | (Wix members area) | Member profiles | Polluted — ~16 members incl. SEO spam (~40 profile URLs) |
| `/contact` | Contact | HQ contact + form | Real (address/phone) with broken links |
| `/contact-2` | OBAI Regional Contact Offices | Regional office directory | Shell — zero regional office data |
| `/zh/contact`, `/zh/contact-2` | 联系我们 / Regional Offices | Chinese variants | Partial translations, wrong email surfaced |
| `/terms-and-conditions` | Terms & Conditions | Legal | Template debris — unedited Wix explainer |
| `/copy-of-terms-conditions` | Privacy Policy | Legal | Template debris — unedited Wix explainer, duplicate slug |
| `/accessibility-statement` | Accessibility Statement | Legal | Template debris — raw `[enter …]` placeholders published |
| `/donation-thank-you-page` | Donation thank-you | Post-donation page | Orphan (not audited in depth; donation CTA exists on legal pages) |

---

## 4. Section-by-section findings

### Home (`/`)
Real content: hero "Bridging Oceania and China, Empowering Business Growth." over a Sunrise-over-Sydney image; 4 hero CTAs (Download Brochure — Wix media PDF `ad2eb1_f8d52fff71e84d1786ef19eaa163c87d.pdf`; Our Mission; Our Events; Get Involved); 3 news teasers (Diana Lin Liaoning delegation, 2026 AGM, Taizhou delegation) with no dates. Forms: 7-field newsletter signup ("Get Monthly Updates") + consent checkbox. Issues: unattributed Jane Eyre quote ("I am no bird; and no net ensnares me…") left from the template; "Join Us" links to Events instead of a join flow; footer social icons are default Wix profiles; no copyright/ABN/address/acknowledgement of country; footer links (Podcast, Support Us, Privacy, Accessibility) never surfaced in header nav.

### About (`/about`, `/team-4`, `/services-7`)
Real content across all three pages is roughly: the mission line, one intro paragraph, member benefits list, contact details, and the tagline "Connecting Oceania and China, Empowering Growth, and Building Lasting Opportunities". **Zero leadership names, no founding date, no history, no org chart anywhere in the About section.** `/services-7` ("Organisational Structure") is an unedited Wix Services template — four "Service Name" blocks reading "This is your Services Page. It's a great opportunity to provide information…" live in production. Only imagery is a PowerPoint slide export ("WTC 活动PPT专用_副本2.png"). Forms: the sitewide newsletter form only — no membership form despite repeated "Join OBAI today" CTAs. Phone link resolves to a Google search, not `tel:`.

### Events (`/events`, `/events-1/*`)
Listing page is empty ("No events at the moment") with no past-event archive and no H1. Two of three event pages (Sydney, Brisbane) are untouched Wix demos: description "I'm an event description. Click here to open up the Event Editor and change my text…", impossible 2035 dates, locations "Sydney, Sydney" / "Brisbane, Brisbane". The one real event: **"The 7th World Traditional Medicine Forum cum World Federation of TCM Trade Services Conference"**, Sat 25 – Sun 26 Oct 2025, 10:00 am–5:00 pm, Melbourne VIC; tagline "Integrating tradition and modernity to build a healthy future"; Chinese host organisations under 主办单位: 世界传统医药论坛 (World Traditional Medicine Forum), 世界中医药服务贸易联合会 (World Federation of TCM Trade Services), 澳大利亚药房协会 (Australian Pharmacy Association). Guests shown only as "+17 other guests". All three pages: "Registration is Closed"; no agenda, speakers, pricing, or venue address; the only form is the newsletter signup. There is no working event registration flow anywhere on the site.

### News (`/news`, `/post/*`)
7 real posts, all substantive 500–700-word press-release recaps (full inventory in section 5). Blog has **zero categories/tags** (blog-categories-sitemap contains only /news). Listing cards show no dates; post pages show day/month without year. Authors are Wix account usernames ("marketing58449", "Design ANZHPL") plus one real name (Gloria Gao) and one byline "Staff Reporter Li Guannan". One post is mislabeled legacy content: a Feb 2015 ACBCA Chinese New Year event published under Sep 2024 dates with the unrelated slug `australia-new-zealand-health-products-pty-ltd`. One post has formatting corruption (heading rendering "****三大**"). Photos throughout lack captions/alt text; several are tiny blurred embeds. No comments, sharing, author pages, or pagination. `/news-1` is a second, template-demo news collection (6 stock articles: "5 Most Promising Fintech Startups", "Best Smart Wearables of 2023", "Gadget Review: Release of New Airy Pods", "Entering a New Era of IoT", etc.) still indexed in the sitemap.

### Projects (`/current-projects`, `/s-projects-basic`, `/s-projects-side-by-side`)
**Zero real projects exist.** All 14 project cards across the three pages are unfilled Wix placeholders ("Project Name" / "This is your Project description. Provide a brief summary…"); `/s-projects-basic` still shows the raw editor instruction "Click on \"Edit Text\" or double click on the text box to start". Reusable copy is limited to the "Our Work" mission sentence, the org descriptor, the Requirement Announcements intro sentence, and the membership CTA. Imagery is generic stock (visible Unsplash credits: Brooke Cagle, Heidi Fin). Named projects DO exist in news posts (Oceania Industrial Park in Suzhou Wuzhong District, "Oceania Pavilion" for Australian health products, Australia-China Health Industry Expo) but were never added to the projects pages.

### Membership Centre (`/general-7`, `/forum`, `/projects-6`, `/copy-of-member-industry-directory`, `/s-projects-side-by-side-1`)
`/general-7` (H1 "OBAI Membership Guide") holds the only real membership content — three unpriced categories (verbatim):
- "Individual Members: Individuals interested in engaging in trade and economic activities between Oceania and China."
- "Corporate Members: Enterprises or organisations registered in Oceania or China, focusing on international trade, investment, or related fields."
- "Industry Associations & Institutions: Industry associations and other organisations focusing on multilateral economic cooperation."

Benefits (verbatim): "Exclusive industry insights and policy interpretation." / "Discounts for participating in business activities and forums." / "Inclusion in the member industry directory to increase visibility." / "Priority access to contact with regional representative offices". Process: "OBAI will complete the review within 5 working days." **No fees, prices, or dues anywhere.** Application = First/Last/Email/Message form ("Send" → "Thanks for submitting!") — no account creation, payment, or tier selection. Page lists two conflicting emails (info@anzhpl.com.au and info@obai.com.au).

The Member Industry Directory (`/projects-6`) and Member Product Showcase (`/copy-of-member-industry-directory`, a literal Wix page duplicate) are empty scaffolds: the same 6 category tiles (Agriculture & Livestock; Tourism & Hospitality; Manufacturing & Processing; Education & Training; Retail & E-commerce; Logistics & Supply Chain), zero member profiles, products, or companies. A full-width Chinese colon in "How It Works：" betrays copy pasted from a Chinese draft. The Forum (`/forum`) is a client-side Wix widget that fails without JS ("Widget Didn't Load") — no posts, categories, or activity visible; treat as dead. Business Information & Legal Regulations (`/s-projects-side-by-side-1`) is the most content-complete page of the cluster but is a directory in name only: 12 headline bullets across 4 industries (of the 6 standard categories — Education & Training and Logistics & Supply Chain missing), most with no hyperlink; its two external links (oceaniabiosecurity.org, agriculture-news.org) appear to be placeholder/non-authoritative domains; "News Link" anchors point at /events instead of /news.

### Contact (`/contact`, `/contact-2`, `/zh/contact`, `/zh/contact-2`)
Real content: HQ address "Level 8/ 167-169 Queen Street, Melbourne VIC 3000", phone +61 3 9640 0566 / (03) 9640 0566, intro paragraph, and a working contact form (First/Last/Email*/Subject/Message → "Send"). Broken plumbing: displayed email info@obai.com.au links to `mailto:info@anzhpl.com.au`; a stray "|" is hyperlinked to `mailto:info@mysite.com`; the phone links to a Google search results URL; typo "Joint Us". `/contact-2` ("Regional Contact Offices") promises regional offices but contains **zero regional data** — three plain-text region labels (Australia & Oceania / China / Other Regions), a duplicate contact form, and social icons pointing at facebook.com/wix, twitter.com/wix, linkedin.com/company/wix-com, instagram.com/wix. The `/zh/` mirrors have correct hreflang (x-default/en-au → /contact, zh-cn → /zh/contact) but partial translation — H1s, all form labels, submenus, and footer remain English — and surface info@anzhpl.com.au as the primary email.

### Legal & misc (`/terms-and-conditions`, `/copy-of-terms-conditions`, `/accessibility-statement`, `/donation-thank-you-page`)
T&C page: 100% unedited Wix explainer ("Terms and Conditions (\"T&C\") are a set of legally binding terms defined by you, as the owner of this website.") linking out to Wix support articles. Privacy Policy: same pattern, at duplicate slug `/copy-of-terms-conditions` — a real compliance gap given the site collects 7 personal-data fields per newsletter signup plus member logins (Privacy Act 1988 / APPs). Accessibility Statement: raw template published with all placeholders unfilled ("This statement was last updated on [enter relevant date]. We at [enter organization / business name]…") including the visible editor note "Once you complete editing… you need to delete this section." Legal pages also carry a "We Need Your Support Today!" Donate CTA and the full newsletter form; `/donation-thank-you-page` exists as its landing.

---

## 5. Content assets worth migrating

### News posts (all 7, `/post/<slug>`, dates = sitemap lastmod, the most reliable source)

| # | Title | Date | Notes |
|---|---|---|---|
| 1 | "Australia-China Business and Commerce Association Successfully Concludes Chinese New Year Business Networking Event" | 2024-09-25 (event: 20 Feb 2015, The Cullen Hotel, Prahran) | Legacy ACBCA recap; slug mismatched (`australia-new-zealand-health-products-pty-ltd`). Speakers: Sun Guozhao (ACBCA Chairman), Ken Smith, Huang Guobin (Deputy Consul-General, Chinese Consulate Melbourne), Hom Lim MP, Jonathan Deague (Asian Pacific Group), Bronwyn Dunwoodie (Wine by Sam); also Cr. Yang Qianhui, Cr. Serge Thomann, My Linh Pham, Xu Weizhong (Golden Pond Capital), John Mitchell (Mitchell Asset Management) |
| 2 | The 7th World Traditional Medicine Forum cum World Federation of TCM Trade Services Conference | 2024-12-02 | Companion post to the real event page |
| 3 | The Preparatory Meeting for the World Traditional Medicine Forum cum World Federation of TCM Trade Services Conference | 2025-02-11 | Not individually audited; real |
| 4 | "Melbourne Hosts Major International Gathering: Australia–China Health Products Expo, World Traditional Medicine Forum & World TCM Trade Conference Draw Global Attention" | 2025-11-17 | 26–27 Oct 2025, Melbourne Park's Centrepiece + World Trade Centre; 500+ delegates from 19 countries/regions; theme "Heritage, Innovation and Shared Prosperity"; speakers Guozhao Sun (OBAI Executive President), Ruan Hongxian (Hon. President, China Association of Pharmaceutical Commerce); byline Gloria Gao |
| 5 | "Taizhou Delegation Visits Melbourne to Strengthen Bilateral Cooperation with Oceania Business Council" | 2026-05-25 | Taizhou Municipal Government delegation; water technology, industry, international business development |
| 6 | "Oceania Business Council Holds 2026 Annual General Meeting in Melbourne" | 2026-05-28 | Richest org-facts post — see below |
| 7 | "Strengthening Cooperation and Promoting Exchange \| Oceania Business Council (OBC) Vice Chair of the Board Diana Lin Leads Delegation to Visit Liaoning Council for the Promotion of International Trade" | 2026-07-22 | 20 July visit; people: Diana Lin (OBC Vice Chair), Wang Yan (OBC Liaoning Rep), Wang Jun (Shenyang Rep), Hou Wei (Liaoning CCPIT President), Duan Dehui (VP), Wang Peng (Director, Int'l Liaison) |

### Real events
- **The 7th World Traditional Medicine Forum cum World Federation of TCM Trade Services Conference** — 25–26 Oct 2025, 10 am–5 pm, Melbourne VIC. Tagline "Integrating tradition and modernity to build a healthy future". Hosts: 世界传统医药论坛, 世界中医药服务贸易联合会, 澳大利亚药房协会. (The only real event; Sydney/Brisbane events are demo debris — do not migrate.)

### Leadership & governance (from the 2026 AGM post, 1 May 2026, World Trade Centre Melbourne, theme "Building on the Past, Embracing New Momentum", 100+ attendees)
- **Hon. Bruce Atkinson AM** — Honorary Chairman
- **Hon. Ken Smith AM** — Founding President & Honorary Chairman
- **Sunny Sun** — Executive President (likely = Guozhao Sun / Sun Guozhao, "OBAI Executive President" in the Expo post and "ACBCA Chairman" in the 2015 post)
- **Diana Lin** — Vice Chair of the Board
- Six committees + secretaries-general: Education (Yang Li), Construction (Bryan Guan), Real Estate (Diana Chen), High-Level Talent & Doctoral Innovation (Arina Tang), Business Services (Albert Zhao), Canberra Branch (Ding Ding)
- AGM guests: Cr Gladys Liu, Simon Qian OAM, Arthur Wu, Bill Long, Nick Yan, Jerry Zhu
- Launch of the Australian International Entrepreneurship & Innovation Alliance "in partnership with seven organisations"
- China partnerships: Zhejiang, Jiangsu, Anhui, Shanghai, Yunnan, Guangdong, Inner Mongolia
- Named projects: Oceania Industrial Park (Suzhou Wuzhong District); "Oceania Pavilion" for Australian health products; Australia-China Health Industry Expo

### Membership content
- Three eligibility categories (Individual / Corporate / Industry Associations & Institutions — verbatim text in section 4), 4 benefit bullets, "review within 5 working days". **No fees exist to migrate.**

### Contact details
- Address: Level 8/ 167-169 Queen Street, Melbourne VIC 3000
- Phone: +61 3 9640 0566 / (03) 9640 0566
- Email: info@obai.com.au (canonical displayed); info@anzhpl.com.au needs a client decision (retire or keep)

### Other assets
- Brochure PDF: Wix media `ad2eb1_f8d52fff71e84d1786ef19eaa163c87d.pdf` (hash filename — retrieve and rename)
- Taglines/mission copy (section 2), member-directory industry taxonomy (6 categories), Business Information resource headlines (12 bullets — verify links before reuse)
- Real member profiles worth keeping: gloriagao, christinel, xavier-ding, zhangxinyuan (verify against client records)
- Original event photography exists in posts but only as low-res embeds — request source images from the org

---

## 6. Systemic issues

1. **Naming chaos** — six org identities, three email domains, domain acronym never used in copy (section 2). Blocks logo, copy, SEO, and email decisions.
2. **Template debris in production** — Jane Eyre quote, 14 placeholder project cards, 2 demo events (2035), 6 demo news articles at `/news-1`, unedited Services template on the org-structure page, visible Wix editor instructions, all-placeholder accessibility statement, Wix-default social links, `mailto:info@mysite.com`.
3. **No legal coverage** — T&C, Privacy Policy, and Accessibility Statement are all non-documents; the site collects personal data (7-field newsletter, member logins) without a privacy policy (Privacy Act 1988 / APP exposure).
4. **Broken conversion paths** — "Join Us" → Events page; all event registration closed with no fallback; membership "application" is a generic message form with no payment/tiers; heavy 7-field newsletter form is the only working capture and is duplicated on every page including legal pages.
5. **Bilingual gaps** — only 2 of ~30 pages have zh variants, both partially translated with English form labels and the wrong contact email; the sole real event mixes untranslated Chinese organiser names into an English page; Chinese otherwise appears only as leakage (filenames, punctuation, corrupted markup).
6. **Spam member signups** — open Wix registration produced SEO-spam accounts ("bestcryptotradingappinindia", "shortcutkeysingmail", "ittaronlineshopping", "cashewalmondpistachiomix") alongside real members; ~40 member-profile URLs are indexed.
7. **SEO/slug mess** — auto-slugs (`team-4`, `services-7`, `general-7`, `contact-2`, `news-1`, `projects-6`), template-name slugs (`s-projects-*`), duplicate-page slugs (`copy-of-*`), and two content-mismatched slugs (`/projects-6` = Member Industry Directory; `/s-projects-side-by-side-1` = Business Information); Privacy Policy canonical URL is `/copy-of-terms-conditions`; blog post slug mismatched to its content; events listing at `/events` but details under `/events-1/`.
8. **Metadata/attribution failures** — no dates on news cards, no year on post dates, a 2015 event presented as 2024 news, authors shown as CMS usernames, zero blog categories, no alt text or captions on any images.
9. **Asset quality** — logo is a PPT slide export with a Chinese working filename; stock imagery with visible photographer credits; blurred/tiny embedded photos; hash-named brochure PDF.
10. **IA inconsistency** — footer links to pages that don't exist (Podcast) or loop home (Support Us); header hides items behind "More…"; taxonomy inconsistency (6 industries in the directory vs 4 in the resources page); duplicate directory/showcase pages.

---

## 7. Implications for the new build

1. **Settle the canonical org name, acronym, domain, and email before design starts.** Every page, the logo, and email routing depend on it. Document the ACBCA → OBC/OBAI history once, on an About/History page.
2. **IA consolidation** — collapse ~30 indexed URLs to a clean route map, roughly: `/`, `/about` (+ leadership/history), `/events` (+ `/events/[slug]` with archive), `/news` (+ `/news/[slug]`), `/projects` (+ investment-opportunities / announcements as filtered views), `/membership` (+ application), `/members/directory`, `/members/resources`, `/contact`, `/privacy-policy`, `/terms`, `/accessibility`. Merge Directory + Product Showcase into one member-directory feature. Drop or defer Forum, Podcast, Support Us, and Regional Offices until real content/decisions exist.
3. **301 redirect map required** for every legacy URL: the 22 sitemap pages (including `/team-4`, `/services-7`, `/general-7`, `/contact-2`, `/news-1`, `/projects-6`, `/s-projects-basic`, `/s-projects-side-by-side`, `/s-projects-side-by-side-1`, `/copy-of-terms-conditions`, `/copy-of-member-industry-directory`, `/donation-thank-you-page`), the 3 `/events-1/*` URLs, the 7 `/post/*` slugs, and `/zh/contact(-2)`. Let `/news-1/*` demo articles and the two demo events 404/410 — do not migrate.
4. **Migrate only the real content**: 7 news posts (backfill ISO dates from sitemap lastmods; fix the 2015 post's date and slug; map usernames to real author names), 1 real event, leadership/committee data from the AGM post, membership category copy, contact details, brochure PDF (renamed).
5. **Source from the client (does not exist on the site)**: membership fees and application workflow, payment handling, leadership roster confirmation + bios/photos, org chart, founding date/history, ABN, regional office details (or drop the page), real project listings, member directory data, verified resource links, brand-quality logo and photography.
6. **Membership needs a real product**: tier selection (3 existing categories), fee payment, Supabase auth + application review workflow (the "5 working days" review promise implies an admin approval queue), replacing the message-form "application".
7. **Moderation is mandatory** — the current open Wix registration attracted SEO spam. New build: email verification + admin approval before any profile is public; do not bulk-import existing Wix members without vetting (only ~4 look real).
8. **Bilingual (en/zh) as a first-class requirement**, not page duplication: full string coverage including form labels and chrome, hreflang, per-locale content fields in Supabase. Nothing meaningful exists to migrate — zh content is net-new work.
9. **Rewrite all three legal documents from scratch** (T&C, Privacy Policy under Privacy Act 1988/APPs, Accessibility Statement with an actual WCAG level) — nothing on the current site is usable.
10. **Fix conversion plumbing**: one clear "Join" CTA → membership application; slim newsletter capture to 1–2 fields (move "Connection Expectation"-style qualification into the membership application); real event registration/RSVP model with past-event archive; correct `mailto:`/`tel:` links.
11. **Content model suggestions** (Supabase): `posts` (title, slug, body, author display name/role, published_at, locale, category), `events` (with registrations/RSVPs, status, archive views), `projects` (type enum investment_opportunity \| requirement_announcement, empty-but-ready), `members`/`member_profiles` (industry category enum — adopt the 6-category taxonomy consistently), `resources`, `subscribers`, `contact_messages`, `membership_applications`.
12. **SEO hygiene**: semantic slugs, per-page metadata, real dates and authors on posts, blog taxonomy (none exists — free to define, e.g. Delegations / Events & Expos / Announcements), image alt text, and a proper favicon/logo asset to replace the PPT export.
