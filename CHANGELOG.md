# Changelog

All notable public website and documentation changes are tracked here.

## 2026-09-29

- FreeTheAI moved to https://freetheai.org. The old API at api.freetheai.xyz, old keys, and the Discord `/signup` and `/checkin` commands are retired.
- Replaced the SvelteKit site with a small Astro page that explains the move, gives the new setup, and forwards every old page to freetheai.org.
- Rewrote the README, SKILL.md, and examples for the new base URL `https://api.freetheai.org/v1` and `fta/<tag>/<model>` model IDs.
- Removed examples for endpoints the new API does not serve (images, audio, vision, Messages, Responses).

## 2026-06-28

- Refreshed the bundled model catalog snapshot from the live free API.
- Updated README, setup guides, SKILL.md, and examples to remove retired aliases and use current `bbl/`, `eve/`, `glm/`, `mim/`, `olm/`, and `opc/` examples.
- Removed stale free image-editing docs; the current free image route documents `eve/*` generation aliases.

## 2026-05-08

- Removed stale direct `glm/*` provider examples and fallback catalog entries.
- Updated chat examples to use current live aliases from the model catalog.
- Added repository growth guidance for releases, GitHub metadata, and search visibility.
