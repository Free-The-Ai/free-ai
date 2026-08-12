<script lang="ts">
    import { onMount } from "svelte";
    import { buildSeo } from "@/shared/lib/seo";
    import { DitherGradient, SeoHead } from "@/shared/ui";
    import {
        buildBreadcrumbJsonLd,
        buildMachineReadableResourcesJsonLd,
        buildOrganizationJsonLd,
        buildSoftwareJsonLd,
        buildWebsiteJsonLd,
        buildWebApiJsonLd,
    } from "@/shared/lib/jsonLd";
    import { CURRENT_TERMS_VERSION } from "@/entities/terms/model";
    import { termsState } from "@/features/terms-gate/terms-state.svelte";
    import TermsContent from "./TermsContent.svelte";

    let acceptedFlash = $state(false);

    onMount(() => {
        termsState.check();
    });

    function handleAccept() {
        termsState.accept().then(() => {
            acceptedFlash = true;
        });
    }

    function handleDecline() {
        window.location.href = "https://www.google.com";
    }

    const pageTitle = "Terms of Service | FreeTheAi";
    const pageDescription =
        "FreeTheAi Terms of Service covering service description, acceptable use, data protection, intellectual property, liability limitations, dispute resolution, and worldwide legal compliance.";

    const seo = buildSeo({
        title: pageTitle,
        description: pageDescription,
        path: "/terms",
        keywords: "FreeTheAi terms, FreeTheAi terms of service, free ai api terms, api acceptable use, data protection, GDPR, CCPA",
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            buildMachineReadableResourcesJsonLd(),
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "FreeTheAi Terms of Service",
                url: "https://freetheai.xyz/terms",
                description: pageDescription,
                isPartOf: { "@id": "https://freetheai.xyz/#website" },
            },
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: "Terms of Service", url: "https://freetheai.xyz/terms" },
            ]),
        ],
    });
</script>

<SeoHead {seo} />

<main class="jp-dense">

    <TermsContent />

    {#if !termsState.accepted}
        <section class="shell terms-page-actions">
            <h2>Do you agree to these Terms of Service?</h2>
            <p class="terms-page-hint">
                You must accept the Terms of Service (v{CURRENT_TERMS_VERSION}) to use the API.
            </p>
            <div class="terms-page-buttons">
                <button class="terms-decline-btn" onclick={handleDecline}>
                    I Decline
                </button>
                <button
                    class="terms-accept-btn"
                    onclick={handleAccept}
                    disabled={termsState.logging}
                >
                    {#if termsState.logging}
                        Accepting...
                    {:else}
                        I Agree to the Terms of Service
                    {/if}
                </button>
            </div>
        </section>
    {:else if acceptedFlash}
        <section class="shell terms-page-accepted">
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            <span>You're in. Enjoy building.</span>
            <a href="/home">Continue to home &rarr;</a>
        </section>
    {/if}

</main>

<style>
    .terms-page-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: clamp(22px, 3.8vw, 36px);
        margin-top: -18px;
    }

    .terms-page-actions h2 {
        margin: 0;
    }

    .terms-page-hint {
        margin: 0;
        color: var(--dim);
        font-family: var(--font-mono);
        font-size: 0.78rem;
    }

    .terms-page-buttons {
        display: flex;
        gap: 8px;
        margin-top: 4px;
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
        opacity: 0.5;
        cursor: not-allowed;
    }

    .terms-page-accepted {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: clamp(22px, 3.8vw, 36px);
        margin-top: -18px;
        color: #008000;
        font-family: var(--font-mono);
        font-size: 0.82rem;
    }

    .terms-page-accepted :global(.material-symbols-outlined) {
        font-size: 18px;
    }

    .terms-page-accepted a {
        margin-left: auto;
        color: var(--text);
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    @media (max-width: 600px) {
        .terms-page-buttons {
            flex-direction: column-reverse;
        }
    }
</style>
