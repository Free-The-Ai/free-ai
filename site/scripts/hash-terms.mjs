#!/usr/bin/env node
/**
 * Recompute the ToS content hash after editing TermsPage.svelte.
 *
 * Usage: node scripts/hash-terms.mjs
 *
 * Strips <script>, <style>, and HTML comment blocks before hashing,
 * so only the visible legal text affects the hash. Bump this hash
 * whenever the ToS content changes — the TermsGate checks it against
 * localStorage and prompts re-acceptance on mismatch.
 */
import { readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";

const TERMS_PATH =
    "site/src/lib/pages/terms/ui/TermsPage.svelte";
const MODEL_PATH =
    "site/src/lib/entities/terms/model.ts";

const html = readFileSync(TERMS_PATH, "utf8");

// Strip non-content blocks for a stable content hash
const stripped = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

const hash = createHash("sha256").update(stripped).digest("hex");

// Update model.ts with the new hash
let model = readFileSync(MODEL_PATH, "utf8");
model = model.replace(
    /export const TERMS_CONTENT_HASH =\n\s+"[a-f0-9]+" as const;/,
    `export const TERMS_CONTENT_HASH =\n    "${hash}" as const;`
);
writeFileSync(MODEL_PATH, model);

console.log(`ToS content hash: ${hash}`);
console.log(`Updated ${MODEL_PATH}`);
