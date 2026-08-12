/**
 * Reactive terms acceptance state — a Svelte 5 rune-based store.
 *
 * Uses $state in a .svelte.ts file so the store is reactive and
 * shareable across components without svelte/store wrappers.
 */
import {
    CURRENT_TERMS_VERSION,
    TERMS_CONTENT_HASH,
    TERMS_STORAGE_KEY,
    type TermsAcceptanceLocal,
} from "@/entities/terms/model";

class TermsState {
    /** Whether the current ToS has been accepted (reactive). */
    accepted = $state(true);
    /** Whether the modal is currently visible (reactive). */
    showModal = $state(false);
    /** Whether a gateway log is in flight (reactive). */
    logging = $state(false);
    /** Timestamp of the last acceptance, or null. */
    acceptedAt = $state<string | null>(null);
    /** The accepted content hash, or null. */
    acceptedHash = $state<string | null>(null);

    /** Computed: whether the stored acceptance matches the current ToS. */
    get isCurrent(): boolean {
        return this.acceptedHash === TERMS_CONTENT_HASH;
    }

    /** Check localStorage and update reactive state. Call once on mount. */
    check() {
        try {
            const raw = localStorage.getItem(TERMS_STORAGE_KEY);
            if (!raw) {
                this.accepted = false;
                this.showModal = true;
                return;
            }
            const data: TermsAcceptanceLocal = JSON.parse(raw);
            this.acceptedHash = data.content_hash;
            this.acceptedAt = data.accepted_at;
            this.accepted =
                data.content_hash === TERMS_CONTENT_HASH &&
                data.terms_version === CURRENT_TERMS_VERSION;
            if (!this.accepted) this.showModal = true;
        } catch {
            this.accepted = false;
            this.showModal = true;
        }
    }

    /** Accept the current ToS — stores locally and logs to gateway. */
    async accept(): Promise<void> {
        this.logging = true;
        try {
            const record: TermsAcceptanceLocal = {
                terms_version: CURRENT_TERMS_VERSION,
                content_hash: TERMS_CONTENT_HASH,
                accepted_at: new Date().toISOString(),
            };
            localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(record));

            this.acceptedHash = TERMS_CONTENT_HASH;
            this.acceptedAt = record.accepted_at;
            this.accepted = true;
            this.showModal = false;

            // Best-effort gateway log
            this.logToGateway();
        } finally {
            this.logging = false;
        }
    }

    private async logToGateway(): Promise<void> {
        try {
            const apiKey = localStorage.getItem("fta_api_key");
            if (!apiKey) return;
            await fetch("https://api.freetheai.xyz/v1/terms/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: apiKey,
                    terms_version: CURRENT_TERMS_VERSION,
                    content_hash: TERMS_CONTENT_HASH,
                }),
                signal: AbortSignal.timeout(5000),
            });
        } catch {
            // Best-effort — acceptance is valid locally regardless
        }
    }
}

/** Singleton — imported by TermsGate and any component that needs to check acceptance. */
export const termsState = new TermsState();
