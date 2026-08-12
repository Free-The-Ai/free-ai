/**
 * Terms of Service acceptance entity.
 *
 * Content-addressed: the terms hash is derived from the actual ToS text,
 * not a manually bumped version string. When the ToS content changes,
 * the hash changes automatically, and users are prompted to re-accept.
 *
 * Unlinked-access pattern (inspired by IVPN): the server stores
 * hex(SHA-256(api_key + terms_version)), never the raw key.
 */

/**
 * Terms version — bumped manually for major changes (legal structure, new sections).
 * The content hash below is what actually gates re-acceptance.
 */
export const CURRENT_TERMS_VERSION = "1.0.0" as const;

/**
 * SHA-256 hash of the ToS HTML content (script/style/comment stripped).
 * Generated from site/src/lib/pages/terms/ui/TermsPage.svelte
 * using: node -e "hash the file minus <script>, <style>, and comment blocks"
 *
 * This is the source of truth. If the ToS text changes, this hash must be
 * recomputed. Run: node scripts/hash-terms.mjs
 */
export const TERMS_CONTENT_HASH =
    "0b0b4374f3af373ec7513a9fb0d11d5b8afee6752610a6f9f9ce5fd9063f4b3d" as const;

/** Record stored server-side (unlinked — no raw key). */
export interface TermsAcceptanceRecord {
    /** hex(SHA-256(api_key + terms_version)) — the unlinked proof */
    acceptance_hash: string;
    /** terms version accepted */
    terms_version: string;
    /** hash of the ToS content at time of acceptance */
    content_hash: string;
    /** ISO-8601 timestamp of acceptance */
    accepted_at: string;
}

/** Client-side localStorage shape. */
export interface TermsAcceptanceLocal {
    terms_version: string;
    content_hash: string;
    accepted_at: string;
}

export const TERMS_STORAGE_KEY = "fta_terms_accepted" as const;
