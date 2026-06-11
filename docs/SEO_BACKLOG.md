# SEO Backlog

Remaining work to push FreeTheAi from ~B+ to fully maxed SEO. Tracked here so we don't lose it after the current commit.

Last updated: 2026-05-24.

## Status of the current pass

Already shipped in the May 2026 SEO bomb:

- SSR model catalog into `/models` raw HTML (46 model IDs visible to crawlers)
- Removed FAQ JSON-LD (Google restricts FAQ rich results to gov/health)
- Removed `vhr/*` from `llms.txt` and `ai.txt` (provider disabled May 21)
- Removed `hreflang` clutter (English-only site)
- Non-blocking Google Fonts via `media="print" onload="this.media='all'"`
- Synced GitHub repo description from `16,000+ models` to `50+ active models`
- Built `/quickstart` (HowTo JSON-LD + 5 steps including `/checkin`)
- Built `/what-is-free-the-ai` (Article JSON-LD + brand disambiguation + Vibhek story)
- Built `/team` (Organization + Person JSON-LD for 3 members)
- Added GitHub org `Free-The-Ai` to Organization `sameAs`
- Updated README to remove dead refs and add Team section
- Pricing page hero CTA + filter UX redesign
- Status page filter pills

## High-impact gaps

These move the needle the most for non-branded traffic.

### Comparison pages

The SEO report called these the highest-intent capture pages.

- [ ] `/compare/openrouter` — features, pricing, free-tier comparison
- [ ] `/compare/puter` — frontend-first vs backend API
- [ ] `/compare/hugging-face-inference` — provider routing comparison
- [ ] `/compare/together-ai` — open-source models comparison
- [ ] Each page should have a real comparison table, code-side-by-side, and clear "why FreeTheAi" wedge
- [ ] Each page wired into footer + sitemap

### SDK-specific landing pages

Long-tail capture per SDK / framework.

- [ ] `/docs/openai-sdk/` — OpenAI Python + JS deep dive
- [ ] `/docs/anthropic-messages/` — Claude-style `/v1/messages` deep dive
- [ ] `/docs/python/` — language-specific SDK setup
- [ ] `/docs/javascript/` — language-specific SDK setup
- [ ] Optional: framework integrations for LangChain, Vercel AI SDK, LiteLLM, CrewAI, AutoGen

### Trust pages

The homepage says "no prompt storage" but there is no durable policy page.

- [x] `/privacy` — what is logged, retention windows, processor disclosures, third-party processor note
- [ ] `/security` — abuse handling, IP blacklist policy, rate-limit posture
- [x] `/terms` — terms of use, acceptable use policy, contact
- [ ] `/changelog` — surface release momentum (currently only `CHANGELOG.md` in repo)

### Public packages

GitHub repo currently has 0 packages. Report flagged this as the #1 backlink fix because npm + PyPI listings are linkable assets and rank.

- [ ] `@freetheai/sdk` on npm — thin OpenAI-compatible wrapper
- [ ] `freetheai` on PyPI — thin OpenAI-compatible wrapper
- [ ] Both should auto-publish from GitHub Actions on tag push
- [ ] Add `Packages` section to README once published

### GitHub repo metadata

- [ ] Set repo topics: `openai`, `openai-compatible`, `free-api`, `ai-api`, `llm-api`, `anthropic`, `discord-bot`, `image-generation`, `tool-calling`, `astro`, `solidjs`
- [ ] Pin most-relevant issues (roadmap + good-first-issue)
- [ ] Add a `Free-The-Ai/free-ai` social preview image (1280×640) so GitHub link previews look good

## Medium-impact gaps

### Performance

- [ ] Run Lighthouse on `/`, `/home`, `/docs`, `/models`, `/pricing`, `/quickstart` — target 90+
- [ ] Run PageSpeed Insights and pin LCP / INP / CLS / FCP numbers
- [ ] Add `<link rel="preload" as="image" fetchpriority="high">` for the home hero/logo (LCP image)
- [ ] Audit `CanvasScroller.js` (499 KB raw / 127 KB gzip) — by far the heaviest bundle. Lazy-load on scroll if possible.
- [ ] Check Cloudflare cache rules and Polish for static assets

### OG images

- [ ] Replace 1254×1254 square OG with 1200×630 (Twitter `summary_large_image` prefers 1.91:1)
- [ ] Optionally generate per-page OG with prerender pipeline (home, docs, models, pricing, quickstart, team, status)

### Validation

- [ ] Run Google Rich Results Test on each new JSON-LD block: home, docs, models, pricing, status, quickstart, what-is-free-the-ai, team
- [ ] Verify `sitemap-0.xml` includes the new routes (`/quickstart`, `/team`, `/what-is-free-the-ai`)
- [ ] Submit fresh sitemap to Google Search Console

### Models page treatment

Current SSR catalog uses `sr-only` clip-rect. Bots see it but visible content is the SolidJS browser. Some crawlers weight visible content higher.

- [ ] Consider making the static catalog the default visible state with the live filter on top
- [ ] Or render a small set of headline models inline above the live browser, then keep the full sr-only block

### Internal linking

- [ ] Add contextual `/quickstart` links inside `/docs` step examples
- [ ] Add `/pricing` and `/status` cross-links from `/models`
- [ ] Add `/team` link from homepage About section

## Low-impact / nice-to-have

- [ ] Static GitHub Pages can't easily 301 alias paths. If site moves to a custom redirector or Cloudflare Pages, add: `/freetheai` → `/`, `/free-the-ai` → `/what-is-free-the-ai`, `/api` → `/docs`
- [ ] Add `og:image:alt` per page (currently global)
- [ ] Add `theme-color` variants for light/dark media queries (currently only dark)
- [ ] Consider an RSS feed for `/changelog` once that page exists
- [ ] Add `Last-Modified` headers to static HTML so crawlers can detect freshness without re-fetch
- [ ] Add `Sitemap:` line to robots.txt for `llms.txt` and `ai.txt` discovery if a future spec emerges

## Outreach (separate from on-page SEO)

These earn backlinks once the on-site content is ready.

- [ ] Hacker News Show HN post (after `/quickstart` and packages are live)
- [ ] Product Hunt launch
- [ ] AlternativeTo + StackShare submissions
- [ ] DEV / Hashnode tutorials: `Migrate from OpenAI to FreeTheAi`, `Free Claude messages API`, `Free image generation API quickstart`
- [ ] Add to GitHub awesome lists: `awesome-openai`, `awesome-llm-apis`, `awesome-ai-api`
- [ ] Indie Hackers build-in-public thread

## Measurement

- [ ] Wire Google Search Console + Bing Webmaster Tools
- [ ] Add a privacy-friendly analytics script (Plausible / Umami) and track:
  - `/quickstart` view → Discord click
  - `/models` page time
  - `/pricing` view → CTA click
  - `/team` view → GitHub click
- [ ] Snapshot indexed page count weekly

## Notes

- Don't chase rich-result types Google has restricted (FAQ, HowTo's been useful so far, ItemList for pricing is fine, Article on disambiguation page is fine).
- Comparison pages should never claim functionality FreeTheAi doesn't have. Only fact-check what's on each competitor's docs page at the time of writing.
- Keep README + `llms.txt` + `ai.txt` in sync whenever a new public page ships.
- Run a final `pnpm build` after each batch of new pages and verify all routes are in `dist/sitemap-0.xml`.
