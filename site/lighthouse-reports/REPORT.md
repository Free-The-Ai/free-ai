# Lighthouse Performance Report

**Config:** Lighthouse 13.4.0 - mobile form factor (simulated throttling: ~1.6 Mbps, 4x CPU) - production adapter-static build served via `vite preview` on localhost - one run per page.
**Generated:** 2026-07-19 03:33 UTC - commit 956a539

Scores are single-run on localhost, so treat them as relative signal, not absolute field data. Setup guides share one template; `setup-guide-aider` represents all 22.

## Scores (worst first)

| Page | Perf | FCP | LCP | TBT | CLS | Speed Index |
|------|:----:|----:|----:|----:|----:|------------:|
| `models` | 56 (avg) | 1974ms | 1974ms | **982ms** ⚠ | **0.476** ⚠ | 1974ms |
| `docs` | 66 (avg) | **5518ms** ⚠ | **5518ms** ⚠ | 0ms | 0.039 | 5518ms |
| `404` | 81 (avg) | 1690ms | 1734ms | 237ms | **0.274** ⚠ | 1690ms |
| `openai-compatible-api` | 88 (avg) | 1704ms | 1704ms | 95ms | 0.21 | 1704ms |
| `setup-guide-aider` | 90 (good) | 2932ms | 2932ms | 0ms | 0.011 | 2932ms |
| `terms` | 91 (good) | 2780ms | 2780ms | 0ms | 0.003 | 2780ms |
| `pricing` | 92 (good) | 1713ms | 1713ms | 324ms | 0.005 | 1713ms |
| `support` | 93 (good) | 2620ms | 2620ms | 0ms | 0.004 | 2620ms |
| `what-is-free-the-ai` | 93 (good) | 2614ms | 2614ms | 0ms | 0.031 | 2614ms |
| `status` | 94 (good) | 2000ms | 2022ms | 154ms | 0.09 | 2000ms |
| `setup-index` | 94 (good) | 1718ms | 1718ms | 250ms | 0.043 | 1718ms |
| `team` | 94 (good) | 1805ms | 1880ms | 245ms | 0.01 | 1805ms |
| `home` | 96 (good) | 1857ms | 1972ms | 70ms | 0.07 | 2881ms |
| `quickstart` | 96 (good) | 1819ms | 1894ms | 172ms | 0.003 | 1819ms |
| `roleplay-api` | 97 (good) | 1725ms | 1725ms | 159ms | 0.005 | 1725ms |
| `coding-agent-api` | 97 (good) | 1716ms | 1716ms | 176ms | 0.006 | 1716ms |
| `privacy` | 97 (good) | 1713ms | 1713ms | 173ms | 0.004 | 1713ms |

**Averages:** perf 89 - FCP 2229ms - LCP 2249ms - TBT 179ms - CLS 0.076

Thresholds (mobile): FCP good <1800ms - LCP good <2500ms - TBT good <200ms - CLS good <0.1. Values over the "poor" line are bolded with a warning.

## Key findings

- **`models` (perf 56) - worst page.** TBT **982ms** and CLS **0.476** (very poor). The catalog renders a large provider/model list on the main thread and shifts layout as groups/filters mount. Biggest wins: reserve space for the catalog (fixed min-heights / skeleton) to kill the layout shift, and defer/virtualize the model list so it does not block the main thread.
- **`docs` (perf 66).** FCP/LCP **5.5s** - a single large paint. The page ships a lot of prerendered syntax-highlighted HTML up front. Win: split the doc body so the above-the-fold content paints first (lazy-render below-the-fold sections / code blocks).
- **CLS on `404` (0.274), `openai-compatible-api` (0.210), `status` (0.090).** Layout shifts as late content (icons, cards, health data) arrives. Win: reserve dimensions for images/icons and async cards.
- Everything else is 88-97 (good). Marketing/legal/setup/intent pages are healthy.

## Full reports

Open the per-page HTML for waterfalls, screenshots, and audit detail:

```
site/lighthouse-reports/<page>.report.html
```

Raw JSON (`<page>.report.json`) and `summary.csv` are alongside them.
