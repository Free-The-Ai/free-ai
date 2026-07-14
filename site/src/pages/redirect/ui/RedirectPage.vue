<script setup lang="ts">
import { onMounted } from "vue";
import { useSeo } from "@/shared/lib/seo";
import { siteConfig } from "@/shared/config/site";
import { CtaButton } from "@/shared/ui";
import { buildDefaultPageJsonLd } from "@/shared/lib/jsonLd";

useSeo({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
    jsonLd: buildDefaultPageJsonLd(),
});

onMounted(() => {
    const path = "/home" + window.location.search + window.location.hash;
    window.location.replace(path);
});
</script>

<template>
    <main class="root-redirect-main">
        <noscript>
            <meta http-equiv="refresh" content="0;url=/home" />
        </noscript>
        <section class="root-redirect-card shell">
            <span class="root-redirect-logo" aria-hidden="true">
                <svg viewBox="0 0 120 120" width="72" height="72">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--sk-border)" stroke-width="4" />
                    <circle class="root-redirect-spinner" cx="60" cy="60" r="54" fill="none" stroke="var(--accent-text)" stroke-width="4" stroke-linecap="round" stroke-dasharray="160 200" />
                </svg>
            </span>
            <h1>FreeTheAi</h1>
            <p>Free OpenAI-compatible API with 80+ active models. Loading the full site at <router-link to="/home">/home</router-link>.</p>
            <CtaButton to="/home">Open FreeTheAi</CtaButton>
        </section>
    </main>
</template>

<style scoped>
.root-redirect-main {
    display: grid;
    place-items: center;
    min-height: 60vh;
    padding: 32px 0;
}
.root-redirect-card {
    display: grid;
    gap: 14px;
    max-width: 520px;
    padding: 32px;
    text-align: center;
}
.root-redirect-card h1 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    letter-spacing: -0.02em;
}
.root-redirect-card p {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.55;
}
.root-redirect-card .primary-button {
    justify-self: center;
}
.root-redirect-card .cta-arrow {
    opacity: 0.65;
    font-size: 0.9rem;
}
.root-redirect-logo {
    display: grid;
    place-items: center;
    margin: 0 auto;
}
.root-redirect-spinner {
    transform-origin: center;
    animation: root-redirect-spin 1.2s linear infinite;
}
@keyframes root-redirect-spin {
    to {
        transform: rotate(360deg);
    }
}
@media (prefers-reduced-motion: reduce) {
    .root-redirect-spinner {
        animation: none;
    }
}
</style>
