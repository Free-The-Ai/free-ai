<script lang="ts">
    import { onMount } from "svelte";
    import { CURRENT_TERMS_VERSION } from "@/entities/terms/model";
    import { termsState } from "../terms-state.svelte";
    import TermsContent from "@/pages/terms/ui/TermsContent.svelte";

    let { onAccept }: { onAccept?: () => void } = {};

    let scrollEl = $state<HTMLDivElement | null>(null);
    let scrolledToBottom = $state(false);
    let accepted = $state(false);

    onMount(() => {
        termsState.check();
    });

    function onScroll() {
        if (!scrollEl) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollEl;
        scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 40;
    }

    function handleAccept() {
        termsState.accept().then(() => {
            accepted = true;
            setTimeout(() => onAccept?.(), 1500);
        });
    }

    function handleDecline() {
        window.location.href = "https://www.google.com";
    }
</script>

{#if termsState.showModal}
    <div class="terms-gate" role="dialog" aria-modal="true" aria-label="Terms of Service">
        <header class="terms-gate-bar">
            <div class="terms-gate-bar-text">
                <strong>Terms of Service</strong>
                <span class="terms-gate-version">v{CURRENT_TERMS_VERSION} — read to continue</span>
            </div>
            {#if accepted}
                <span class="terms-gate-success">
                    <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    Accepted
                </span>
            {/if}
        </header>

        <div class="terms-gate-scroll" bind:this={scrollEl} onscroll={onScroll}>
            <TermsContent />
        </div>

        <footer class="terms-gate-actions">
            {#if !accepted}
                <p class="terms-gate-hint">
                    {#if !scrolledToBottom}
                        Scroll to the bottom to enable acceptance.
                    {:else}
                        Do you agree to these Terms of Service?
                    {/if}
                </p>
            {/if}
            <div class="terms-gate-buttons">
                <button class="terms-decline-btn" onclick={handleDecline}>
                    I Decline
                </button>
                <button
                    class="terms-accept-btn"
                    onclick={handleAccept}
                    disabled={!scrolledToBottom || termsState.logging}
                >
                    {#if termsState.logging}
                        Accepting...
                    {:else}
                        I Agree to the Terms of Service
                    {/if}
                </button>
            </div>
        </footer>
    </div>
{/if}

<style>
    .terms-gate {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        background: var(--bg);
    }

    .terms-gate-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
    }

    .terms-gate-bar-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .terms-gate-version {
        font-size: 0.7rem;
        color: var(--dim);
        font-family: var(--font-mono);
    }

    .terms-gate-success {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #008000;
        font-size: 0.78rem;
        font-family: var(--font-mono);
    }

    .terms-gate-scroll {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .terms-gate-scroll > :global(.terms-body) {
        width: min(1500px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 16px;
    }

    .terms-gate-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 20px;
        background: var(--surface);
        border-top: 1px solid var(--border);
        flex-shrink: 0;
    }

    .terms-gate-hint {
        font-size: 0.7rem;
        color: var(--dim);
        text-align: center;
        font-family: var(--font-mono);
    }

    .terms-gate-buttons {
        display: flex;
        gap: 8px;
    }

    .terms-decline-btn {
        flex-shrink: 0;
        padding: 12px 20px;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--dim);
        font-family: var(--font-mono);
        font-size: 0.78rem;
        cursor: pointer;
        transition: opacity 0.15s;
    }

    .terms-decline-btn:hover {
        opacity: 0.7;
    }

    .terms-accept-btn {
        flex: 1;
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
        opacity: 0.3;
        cursor: not-allowed;
    }

    @media (max-width: 820px) {
        .terms-gate-scroll > :global(.terms-body) {
            width: min(100vw - 20px, 1220px);
            padding: 10px;
        }
    }

    @media (max-width: 600px) {
        .terms-gate-buttons {
            flex-direction: column-reverse;
        }
    }
</style>
