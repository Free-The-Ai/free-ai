<script setup lang="ts">
import { onMounted } from "vue";
import { useSeo } from "@/shared/lib/seo";
import { siteConfig } from "@/shared/config/site";
import { buildDefaultPageJsonLd } from "@/shared/lib/jsonLd";

useSeo({
    title: "Page not found - FreeTheAi",
    description: siteConfig.description,
    path: "/404",
    jsonLd: buildDefaultPageJsonLd(),
});

onMounted(() => {
    let attempts = 50;
    const poll = () => {
        const soundPlay = (window as unknown as { __soundPlay?: (role: string) => void }).__soundPlay;
        if (typeof soundPlay === "function") {
            soundPlay("notification.error");
        } else if (attempts > 0) {
            attempts -= 1;
            setTimeout(poll, 100);
        }
    };
    poll();
});
</script>

<template>
    <main class="not-found-main">
        <section class="not-found-card shell">
            <span class="not-found-watermark" aria-hidden="true">404</span>
            <span class="eyebrow">Error</span>
            <h1>Page not found.</h1>
            <p class="not-found-lede">
                The page you tried to open doesn't exist. The free OpenAI-compatible API and the full site are still right here.
            </p>
            <router-link class="primary-button not-found-home" to="/home">
                <span class="material-symbols-outlined" aria-hidden="true">home</span>
                <span>Back to home</span>
            </router-link>
        </section>
    </main>
</template>

<style scoped>
.not-found-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: 32px 16px;
}
.not-found-card {
    position: relative;
    display: grid;
    gap: 18px;
    width: 100%;
    max-width: 520px;
    padding: clamp(36px, 6vw, 56px) clamp(28px, 5vw, 48px);
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-shell-bg);
    box-shadow: var(--sk-raised-shadow);
    text-align: center;
    overflow: hidden;
}
.not-found-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    font-family: var(--font-mono);
    font-size: clamp(7rem, 22vw, 13rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--accent);
    opacity: 0.06;
    pointer-events: none;
    user-select: none;
}
.not-found-card .eyebrow {
    position: relative;
    z-index: 1;
    justify-self: center;
    color: var(--dim);
}
.not-found-card h1 {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(2rem, 4.5vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
}
.not-found-lede {
    position: relative;
    z-index: 1;
    margin: 0;
    color: var(--muted);
    font-size: 0.98rem;
    line-height: 1.55;
}
.not-found-home {
    position: relative;
    z-index: 1;
    justify-self: center;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.not-found-home .material-symbols-outlined {
    font-size: 1.1rem;
}
</style>
