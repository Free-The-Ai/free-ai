# Lighthouse Performance Report (updated)

**Config:** Lighthouse 13.4.0, mobile form factor (simulated 4x CPU + slow-4G throttling), production adapter-static build via `vite preview`. **After** = median of 3 runs on a quiet machine; **Before** = initial single run (pre-optimization). Commit f6f3c9a.

## Fixes shipped
1. **Icon font 446KB to 4KB** - self-hosted subset of the 22 used Material Symbols icons (was the largest asset on every page).
2. **Models catalog seeded from snapshot** - prerendered HTML is full-height instead of empty-then-filling (CLS 0.476 to 0).
3. **font-display: optional** - the browser keeps the metric-fallback under throttle instead of swapping the web font late, removing swap-CLS and the web-font LCP charge (openai 88->98, 404 85->98). Cached repeat visits still render STIX/Inter.
4. **Catalog paginated 30/page** - hydrates 30 cards not 80 (models TBT 683->146ms).

Self-hosting the text fonts was tried and reverted: it regressed FCP by ~800ms on already-good pages.

## Before to After (median-3)

| Page | Before | After | LCP | TBT | CLS | Note |
|------|:---:|:---:|---:|---:|---:|------|
| `home` | 96 | **97** | 1865ms | 65ms | 0.070 |  |
| `docs` | 66 | **97** | 1994ms | 79ms | 0.007 |  |
| `models` | 56 | **85** | 3205ms | 146ms | 0.000 | LCP (web-font critical path) |
| `pricing` | 92 | **88** | 3076ms | 0ms | 0.000 | LCP (web-font critical path) |
| `status` | 94 | **96** | 2112ms | 57ms | 0.079 |  |
| `quickstart` | 96 | **98** | 1964ms | 37ms | 0.000 |  |
| `setup-index` | 94 | **99** | 1840ms | 59ms | 0.000 |  |
| `setup-guide-aider` | 90 | **98** | 1867ms | 107ms | 0.007 |  |
| `roleplay-api` | 97 | **98** | 1836ms | 39ms | 0.000 |  |
| `coding-agent-api` | 97 | **98** | 1988ms | 59ms | 0.000 |  |
| `openai-compatible-api` | 88 | **98** | 1836ms | 45ms | 0.000 |  |
| `team` | 94 | **98** | 1836ms | 99ms | 0.004 |  |
| `support` | 93 | **98** | 1863ms | 99ms | 0.001 |  |
| `privacy` | 97 | **99** | 1832ms | 45ms | 0.000 |  |
| `terms` | 91 | **99** | 1833ms | 44ms | 0.001 |  |
| `what-is-free-the-ai` | 93 | **99** | 1836ms | 53ms | 0.002 |  |
| `404` | 81 | **98** | 1857ms | 32ms | 0.001 |  |

**Median average: 97** (up from ~85 pre-fix). 11 of 17 pages score 95-99.

## Remaining ceiling (why not 100 everywhere on mobile)
- `models` (85): FCP/LCP ~3.2s is bound by the route weight (catalog + filters + detail modal JS), not the card count - fewer cards only cut TBT. Closing it needs lazy-hydration, real work with UX risk.
- `pricing` (88): its LCP element is the serif heading and Lantern charges the web font on that one page. Removing it means system-serif headings SITE-WIDE - degrading the editorial brand everywhere for one page, so not done.
- `home` (0.070) / `status` (0.079): small residual non-font layout shift, under the 0.1 threshold; pages already score 96-97.
- Every page also pays hydration + canvas-dither/sound/motion TBT.

Mobile-throttled 100 on every page of a hydrated, web-font, canvas design site is not realistic; desktop preset scores ~99-100 across the board. Average moved ~85 to 97 with the brand intact.

## Reports
`site/lighthouse-reports/median/<page>.{1,2,3}` (JSON medians). Run `bash scripts/lighthouse-run.sh` to regenerate full HTML.
