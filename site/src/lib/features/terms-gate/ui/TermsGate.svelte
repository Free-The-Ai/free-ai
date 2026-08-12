<script lang="ts">
    import { onMount } from "svelte";
    import {
        CURRENT_TERMS_VERSION,
        TERMS_CONTENT_HASH,
        TERMS_STORAGE_KEY,
        type TermsAcceptanceLocal,
    } from "@/entities/terms/model";

    let { onAccept }: { onAccept?: () => void } = $props();

    let accepted = $state(true); // default: accepted (no flash)
    let loading = $state(false);
    let mounted = $state(false);

    onMount(() => {
        accepted = checkAccepted();
        mounted = true;
    });

    function checkAccepted(): boolean {
        try {
            const raw = localStorage.getItem(TERMS_STORAGE_KEY);
            if (!raw) return false;
            const data: TermsAcceptanceLocal = JSON.parse(raw);
            // Re-accept required if content hash changed (ToS was edited)
            // or if version bumped (major legal change)
            return (
                data.content_hash === TERMS_CONTENT_HASH &&
                data.terms_version === CURRENT_TERMS_VERSION
            );
        } catch {
            return false;
        }
    }

    async function handleAccept() {
        loading = true;
        try {
            const record: TermsAcceptanceLocal = {
                terms_version: CURRENT_TERMS_VERSION,
                content_hash: TERMS_CONTENT_HASH,
                accepted_at: new Date().toISOString(),
            };
            localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(record));

            // Best-effort gateway logging (unlinked hash computed server-side)
            try {
                const apiKey = localStorage.getItem("fta_api_key");
                if (apiKey) {
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
                }
            } catch {
                // Gateway is optional — acceptance is still valid locally
            }

            accepted = true;
            onAccept?.();
        } finally {
            loading = false;
        }
    }
</script>

{#if mounted && !accepted}
    <div class="terms-overlay" role="dialog" aria-modal="true" aria-label="Terms of Service">
        <div class="terms-modal shell">
            <span class="eyebrow">Action Required</span>
            <h2>Terms of Service</h2>
            <p class="terms-intro">
                You must agree to the FreeTheAi Terms of Service before using the API.
                This is a one-time acceptance per terms version.
            </p>

            <div class="terms-summary">
                <div class="terms-point">
                    <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    <span>Free tier stays free — no credit card, no billing</span>
                </div>
                <div class="terms-point">
                    <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    <span>80+ models across 12 providers</span>
                </div>
                <div class="terms-point">
                    <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    <span>Zero-log on our side — we don't store your prompts</span>
                </div>
                <div class="terms-point">
                    <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    <span>Open source — 100% transparent</span>
                </div>
            </div>

            <p class="terms-legal">
                By clicking "I agree", you confirm that you have read and accept the
                <a href="/terms" target="_blank" rel="noopener">Terms of Service</a>
                (version {CURRENT_TERMS_VERSION}).
            </p>

            <button
                class="terms-accept-btn"
                onclick={handleAccept}
                disabled={loading}
            >
                {#if loading}
                    Accepting...
                {:else}
                    I agree to the Terms of Service
                {/if}
            </button>
        </div>
    </div>
{/if}

<style>
    .terms-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: oklch(0 0 0 / 0.85);
        backdrop-filter: blur(8px);
        padding: 16px;
    }

    .terms-modal {
        max-width: 520px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: clamp(20px, 4vw, 36px);
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .terms-intro {
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--text);
    }

    .terms-summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border: 1px solid var(--border);
        background: oklch(1 0 0 / 0.02);
    }

    .terms-point {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78rem;
        font-family: var(--font-mono);
        color: var(--text);
    }

    .terms-point .material-symbols-outlined {
        font-size: 16px;
        color: #008000;
        flex-shrink: 0;
    }

    .terms-legal {
        font-size: 0.72rem;
        line-height: 1.5;
        color: var(--dim);
    }

    .terms-legal a {
        color: var(--text);
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .terms-accept-btn {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--text);
        background: var(--text);
        color: var(--bg);
        font-family: var(--font-mono);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s;
    }

    .terms-accept-btn:hover:not(:disabled) {
        opacity: 0.85;
    }

    .terms-accept-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (max-width: 480px) {
        .terms-modal {
            max-height: 100vh;
            border-radius: 0;
            border: none;
        }
    }
</style>
