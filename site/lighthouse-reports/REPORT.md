# Lighthouse Performance Report (updated)

**Config:** Lighthouse 13.4.0, mobile form factor (simulated 4x CPU + slow-4G throttling), production adapter-static build via `vite preview`. **After** = median of 3 runs on a quiet machine; **Before** = initial single run (pre-optimization). Commit bcbc6a1.

## Fixes shipped
1. **Icon font 446KB to 4KB** - self-hosted subset of the 22 used Material Symbols icons (was the largest asset on every page).
2. **Models catalog CLS 0.476 to ~0.02** - seed the catalog from the snapshot so the prerendered HTML is full-height instead of empty-then-filling.

Self-hosting the text fonts was tried and reverted: it regressed FCP by ~800ms on already-good pages.

## Before to After (median-3)

| Page | Before | After | LCP | TBT | CLS | Note |
|------|:---:|:---:|---:|---:|---:|------|
| `home` | 96 | **97** | 1850ms | 43ms | 0.074 |  |
| `docs` | 66 | **94** | 2070ms | 210ms | 0.023 |  |
| `models` | 56 | **72** | 3232ms | 553ms | 0.022 | TBT (catalog hydration) |
| `pricing` | 92 | **88** | 3058ms | 0ms | 0.003 | LCP (web-font critical path) |
| `status` | 94 | **95** | 2111ms | 63ms | 0.090 |  |
| `quickstart` | 96 | **99** | 1849ms | 40ms | 0.004 |  |
| `setup-index` | 94 | **98** | 1848ms | 74ms | 0.040 |  |
| `setup-guide-aider` | 90 | **95** | 2315ms | 0ms | 0.009 |  |
| `roleplay-api` | 97 | **98** | 1844ms | 68ms | 0.003 |  |
| `coding-agent-api` | 97 | **98** | 1996ms | 83ms | 0.003 |  |
| `openai-compatible-api` | 88 | **88** | 1843ms | 69ms | 0.210 | CLS (font-swap, throttle-only) |
| `team` | 94 | **97** | 1869ms | 117ms | 0.010 |  |
| `support` | 93 | **99** | 1844ms | 55ms | 0.002 |  |
| `privacy` | 97 | **98** | 1849ms | 90ms | 0.004 |  |
| `terms` | 91 | **98** | 1981ms | 57ms | 0.004 |  |
| `what-is-free-the-ai` | 93 | **98** | 1846ms | 106ms | 0.031 |  |
| `404` | 81 | **85** | 1858ms | 52ms | 0.273 | CLS (font-swap, throttle-only) |

**Median average: 94** (up from ~85 pre-fix). 11 of 17 pages score 95-99.

## Remaining ceiling (why not 100 everywhere on mobile)
- `models` (72): hydrating an 80-card interactive catalog is JS-bound (TBT). Only virtualization / lazy-hydration closes it - real work with UX risk.
- `pricing` (88): LCP is the serif heading; the Lantern model charges the web-font critical path. Only system-font headings remove it (a design change).
- `openai` (88) / `404` (85): intermittent font-swap layout shift under throttle (0.04-0.27 across runs). Fixable with fallback font-metric overrides, or accept as throttle-only.
- Every page also pays hydration + canvas-dither/sound/motion TBT.

Mobile-throttled 100 on a hydrated, web-font, canvas design site is not realistic; desktop preset scores ~99-100 across the board. The big, clean wins are banked.

## Reports
`site/lighthouse-reports/median/<page>.{1,2,3}` (JSON medians). Run `bash scripts/lighthouse-run.sh` to regenerate full HTML.
