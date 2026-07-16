# Self-Improvement Ledger

Detailed execution incidents are append-only and listed newest-first.

- 2026-07-15 — Vue Router hash navigation landed targets under the sticky header because element scroll positions did not inherit the document's CSS scroll offset; canonical fix: read the existing root `scroll-padding-top` token and pass it as router `top`; proof: browser assertions placed `/docs#compatibility` below the header at the configured offset.
- 2026-07-13 — `python` source-edit helper invocation failed because this environment exposes only `python3`; canonical fix: invoke the discovered runtime explicitly; proof: the same edit completed under `python3` and the subsequent Vue typecheck passed.
- 2026-07-13 — package-local `pnpm generate:highlights` failed from the repository root because `package.json` is under `site/`; canonical fix: execute package scripts from `site/`; proof: the generator produced `src/shared/config/highlighted.generated.ts` and the SSG build completed all 39 routes.
- 2026-07-13 — shell-based repository scans failed on nested quote patterns because Bash parsed unmatched quotes before ripgrep ran; canonical fix: pass patterns as argument arrays through a JavaScript subprocess; proof: the replacement scans completed and reported no runtime Shiki imports, unfinished markers, or FSD direction violations.
- 2026-07-13 — browser batch evaluation failed when the CLI wrapper misparsed a complex JavaScript expression; canonical fix: use direct, selector-safe `eval` calls and independent interaction commands; proof: browser QA subsequently verified menu keyboard navigation, modal focus trapping, focus restoration, and route interactivity.

## Active Synthesis

- Evidence before acceptance: Failure pattern: trusting a migration worker's successful build claim without independent runtime and bundle inspection. Better behavior: inspect the working tree, generated artifacts, browser behavior, and dependency payload before accepting. Proof: independent review caught and removed client-side Shiki/WASM and restored modal accessibility before commit.
- Command boundary discipline: Failure pattern: running package or runtime commands from assumed locations or aliases. Better behavior: identify the package root and available runtime binary before execution. Proof: package scripts and helper commands complete on the first corrected invocation.
- Verification fit: Failure pattern: broad build success masking interaction and accessibility regressions. Better behavior: pair type/build checks with focused browser assertions for state, focus, ARIA, and cleanup. Proof: tests demonstrate focus remains trapped, background content is inert, Escape closes, and focus returns to the opener.
