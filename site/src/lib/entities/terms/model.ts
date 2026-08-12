/**
 * Terms of Service acceptance entity.
 *
 * Follows an unlinked-access pattern inspired by IVPN:
 * the server stores a hash of (api_key + terms_version), never the raw key.
 * This proves the user accepted a specific version without linking identity.
 */

/** Current ToS version — bump when TermsPage.svelte changes materially. */
export const CURRENT_TERMS_VERSION = "1.0.0" as const;

/**
 * SHA-256 hash of the ToS content at the time of this version.
 * Regenerate when TermsPage.svelte changes.
 * Stored so we can verify which exact terms the user agreed to.
 */
export const TERMS_CONTENT_HASH =
    "7df8a770f8520281326f92fb66d53a447c72e9c4c208eee4f86de96f8be36184" as const;
/** Record stored server-side (unlinked — no raw key). */
export interface TermsAcceptanceRecord {
    /** hex(SHA-256(api_key + terms_version)) — the unlinked proof */
    acceptance_hash: string;
    /** terms version accepted */
    terms_version: string;
    /** ISO-8601 timestamp of acceptance */
    accepted_at: string;
    /** hex(SHA-256(ip + salt)) — optional, for abuse detection only */
    ip_commitment?: string;
}

/** Client-side localStorage shape. */
export interface TermsAcceptanceLocal {
    terms_version: string;
    accepted_at: string;
}

export const TERMS_STORAGE_KEY = "fta_terms_accepted" as const;
