<script setup lang="ts">
import { useSeo } from "@/shared/lib/seo";
import { DitherGradient } from "@/shared/ui";
import {
    buildBreadcrumbJsonLd,
    buildMachineReadableResourcesJsonLd,
    buildOrganizationJsonLd,
    buildSoftwareJsonLd,
    buildWebsiteJsonLd,
    buildWebApiJsonLd,
} from "@/shared/lib/jsonLd";

const pageTitle = "Privacy Policy | FreeTheAi";
const pageDescription =
    "FreeTheAi privacy policy explaining what operational metadata is logged, what message content is not stored, and how abuse-prevention data is used.";

useSeo({
    title: pageTitle,
    description: pageDescription,
    path: "/privacy",
    keywords: "FreeTheAi privacy policy, free ai api privacy, prompt storage, api metadata logging",
    jsonLd: [
        buildWebsiteJsonLd(),
        buildOrganizationJsonLd(),
        buildSoftwareJsonLd(),
        buildWebApiJsonLd(),
        buildMachineReadableResourcesJsonLd(),
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "FreeTheAi Privacy Policy",
            url: "https://freetheai.xyz/privacy",
            description: pageDescription,
            isPartOf: { "@id": "https://freetheai.xyz/#website" },
        },
        buildBreadcrumbJsonLd([
            { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
            { name: "Privacy Policy", url: "https://freetheai.xyz/privacy" },
        ]),
    ],
});
</script>

<template>
    <main>
        <section class="policy-hero shell">
            <DitherGradient class="policy-glow" from="orange" direction="up" :opacity="0.26" />
            <span class="eyebrow">Privacy Policy</span>
            <h1>Plain-English data handling for FreeTheAi.</h1>
            <p class="hero-text">
                FreeTheAi is built to keep the free API usable, safe, and hard to abuse. We do not store your prompts, completions,
                uploaded images, or conversation history in our operational logs. We do log security and usage metadata so we can
                operate the service, enforce limits, debug failures, and fight abuse.
            </p>
            <span class="policy-badge">
                <span class="material-symbols-outlined" aria-hidden="true">event</span>
                Effective date: May 31, 2026
            </span>
        </section>

        <section class="section shell policy-section">
            <div class="privacy-columns">
                <article class="panel policy-panel policy-panel-good">
                    <span class="eyebrow">Not stored as logs</span>
                    <h2>Message content stays out of our logs.</h2>
                    <ul class="privacy-list">
                        <li>
                            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            User prompts and message text are not stored in our operational request logs.
                        </li>
                        <li>
                            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            Model completions, assistant responses, and roleplay conversation text are not stored in our operational
                            request logs.
                        </li>
                        <li>
                            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            Uploaded media, files, and image inputs are processed for the request and are not kept as message logs by
                            FreeTheAi.
                        </li>
                    </ul>
                </article>

                <article class="panel policy-panel">
                    <span class="eyebrow">Logged metadata</span>
                    <h2>We keep abuse-prevention metadata.</h2>
                    <ul class="privacy-list">
                        <li>
                            <span class="material-symbols-outlined" aria-hidden="true">shield</span>
                            IP address, approximate network/security signals, rate-limit state, and abuse or block-list matches.
                        </li>
                        <li>
                            <span class="material-symbols-outlined" aria-hidden="true">key</span>
                            API key prefix, account/user identifiers, Discord identity, server membership, check-in state, and role or
                            access eligibility.
                        </li>
                        <li>
                            <span class="material-symbols-outlined" aria-hidden="true">query_stats</span>
                            Request route, public model alias, timestamp, status code, latency, token or request-unit counts, error
                            IDs, and retry/concurrency signals.
                        </li>
                        <li>
                            <span class="material-symbols-outlined" aria-hidden="true">devices</span>
                            Client metadata such as user agent, platform labels, safe request headers, and compatibility signals needed
                            to debug API clients.
                        </li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="section shell policy-section">
            <header class="section-head">
                <span class="eyebrow">Why this exists</span>
                <h2>Security logs keep the free tier alive.</h2>
                <p>
                    The free API has to stop spam, duplicated accounts, stolen keys, proxy abuse, credential sharing,
                    denial-of-service behavior, and clients that accidentally burn shared capacity. Metadata logging is how we verify
                    users, enforce fair limits, investigate outages, and protect the community without storing private prompt or
                    output content.
                </p>
            </header>

            <div class="two-panel">
                <article class="panel policy-panel">
                    <h3>How metadata is used</h3>
                    <p>
                        We use metadata to authenticate keys, apply rate limits, validate daily check-ins, detect abuse patterns,
                        resolve public error IDs, measure reliability, and improve the API surface.
                    </p>
                </article>

                <article class="panel policy-panel">
                    <h3>How long metadata is kept</h3>
                    <p>
                        Retention depends on operational need. Normal logs may be rotated as systems are maintained; security, abuse,
                        payment, or availability investigations may require keeping relevant metadata longer.
                    </p>
                </article>
            </div>
        </section>

        <section class="section shell policy-section">
            <header class="section-head">
                <span class="eyebrow">Processing</span>
                <h2>Requests are still processed to answer you.</h2>
                <p>
                    API requests and responses are transmitted through FreeTheAi and the model/service systems needed to complete
                    your request. That transient processing is different from FreeTheAi storing prompt or output text as message
                    logs. Do not send passwords, private keys, payment data, or other sensitive secrets to any AI API.
                </p>
            </header>
        </section>

        <section class="section shell policy-section">
            <header class="section-head">
                <span class="eyebrow">Legal links</span>
                <h2>Related pages.</h2>
            </header>
            <div class="legal-foot">
                <router-link to="/terms">Terms of Use</router-link>
                <router-link to="/support">Support</router-link>
                <router-link to="/privacy">Privacy Policy</router-link>
            </div>
        </section>
    </main>
</template>
