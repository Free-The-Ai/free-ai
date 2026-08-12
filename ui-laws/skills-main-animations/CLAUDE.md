# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A collection of agent skills for building great product interfaces (typography, colors, UI polish), published for installation via `npx skills add jakubkrehel/skills`. It is documentation-only — there is no build, lint, or test tooling.

## Structure

Each skill lives in `skills/<skill-name>/`:

- `SKILL.md` — the entry point. YAML frontmatter with `name` (matching the directory) and `description` (one-line summary, "Use when..." guidance, and a "Triggers on ..." keyword list that agents match against). The body opens with a short philosophy paragraph, then a **Quick Reference** table linking to the reference files, then numbered **Core Principles**.
- Supporting `.md` reference files — deeper topic docs linked from the Quick Reference table via relative paths (e.g. `typography.md`, `palette-generation.md`).

Current skills: `better-ui` (interface polish details), `better-typography` (web typography), `better-colors` (OKLCH color space).

## Authoring conventions

- Principles are prescriptive and specific: exact CSS properties, exact values (e.g. scale `0.25` → `1`, blur `4px` → `0px`), not vague advice.
- Skills instruct agents to match the target project's existing styling system (Tailwind vs. plain CSS vs. CSS-in-JS) rather than impose one.
- Frontmatter `description` is the discovery surface — when adding or changing a skill's scope, update its trigger keywords accordingly.
- Skill directory names use the `better-*` prefix; renaming a skill means renaming its directory and frontmatter `name` together.
