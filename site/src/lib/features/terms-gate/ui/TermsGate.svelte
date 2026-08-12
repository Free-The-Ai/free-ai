<script lang="ts">
    import { onMount } from "svelte";
    import { CURRENT_TERMS_VERSION } from "@/entities/terms/model";
    import { termsState } from "../terms-state.svelte";

    let { onAccept }: { onAccept?: () => void } = $props();

    /** Svelte action: overlay with escape-to-close and click-outside-to-close. */
    function overlay(node: HTMLElement): { destroy(): void } {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                // Escape doesn't dismiss — you must accept. But we can focus the button.
                node.querySelector<HTMLButtonElement>(".terms-accept-btn")?.focus();
            }
        }
        function onClick(e: MouseEvent) {
            // Click outside modal → focus modal (don't dismiss)
            const modal = node.querySelector(".terms-modal");
            if (modal && !modal.contains(e.target as Node)) {
                modal.querySelector<HTMLButtonElement>(".terms-accept-btn")?.focus();
            }
        }
        document.addEventListener("keydown", onKeyDown);
        node.addEventListener("click", onClick);
        return {
            destroy() {
                document.removeEventListener("keydown", onKeyDown);
                node.removeEventListener("click", onClick);
            },
        };
    }

    onMount(() => {
        termsState.check();
    });

    function handleAccept() {
        termsState.accept().then(() => onAccept?.());
    }
</script>

{#if termsState.showModal}
    <div class="terms-overlay" use:overlay role="dialog" aria-modal="true" aria-label="Terms of Service">
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
                disabled={termsState.logging}
            >
                {#if termsState.logging}
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

    .terms-point :global(.material-symbols-outlined) {
        font-size: 16px;
        color: #008000;
        flex-shrink: 0;
    }

    .terms-legal {
        font-size: 0.72rem;
        line-height: 1.5;
        color: var(--dim);
    }

    .terms-legal :global(a) {
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
