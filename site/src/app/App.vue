<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { siteConfig } from "@/shared/config/site";
import { themeInlineBootstrap } from "@/shared/lib/theme/singleton";
import { SiteHeader } from "@/widgets/header";
import { SiteFooter } from "@/widgets/footer";
import { MobileNav } from "@/widgets/mobile-nav";
import { DitherShader } from "@/widgets/background";
import { ToastRegion } from "@/shared/ui";

const fontHref =
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=STIX+Two+Text:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap";

useHead({
    htmlAttrs: { lang: "en" },
    meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width,initial-scale=1" },
        { name: "theme-color", content: "oklch(0.168 0 0)" },
        { name: "robots", content: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" },
        { name: "googlebot", content: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" },
        { name: "bingbot", content: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" },
        { name: "applebot", content: "all" },
        { name: "application-name", content: siteConfig.title },
        { name: "apple-mobile-web-app-title", content: siteConfig.title },
        { name: "alternate-name", content: siteConfig.aliases.join(", ") },
        { name: "brand-aliases", content: siteConfig.aliases.join(", ") },
        { name: "author", content: siteConfig.author.name },
        { name: "publisher", content: siteConfig.title },
        { name: "DC.alternative", content: siteConfig.aliases.join(", ") },
        { name: "classification", content: "Developer API, AI API Gateway" },
        { name: "category", content: "Developer Tools" },
        { name: "coverage", content: "Worldwide" },
        { name: "distribution", content: "Global" },
        { name: "ai-summary", content: siteConfig.description },
        { name: "ai-crawler-policy", content: "index,follow,snippet,cite,answer" },
        { name: "api-base-url", content: "https://api.freetheai.xyz/v1" },
        { name: "model-catalog", content: "https://freetheai.xyz/models.json" },
        { name: "paid-plan-catalog", content: "https://freetheai.xyz/paid-plan.json" },
        { name: "llms-txt", content: "https://freetheai.xyz/llms.txt" },
        { name: "ai-guide", content: "https://freetheai.xyz/ai.txt" },
        { name: "DC.publisher", content: siteConfig.title },
        { name: "DC.creator", content: siteConfig.author.name },
        { name: "DC.language", content: "en-US" },
        { name: "DC.type", content: "Service" },
        { name: "DC.format", content: "text/html" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: siteConfig.defaults.locale },
        { property: "og:site_name", content: siteConfig.title },
        { name: "twitter:card", content: siteConfig.defaults.twitterCard },
    ],
    link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "preload", as: "style", href: fontHref },
        { rel: "stylesheet", href: fontHref, media: "print", onload: "this.media='all'" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "sitemap", href: "/sitemap-index.xml" },
        { rel: "alternate", type: "application/json", title: "FreeTheAi model catalog", href: "/models.json" },
        { rel: "alternate", type: "application/json", title: "FreeTheAi paid plan", href: "/paid-plan.json" },
        { rel: "alternate", type: "text/plain", title: "FreeTheAi AI crawler guide", href: "/ai.txt" },
        { rel: "llms.txt", href: "/llms.txt" },
        { rel: "alternate", type: "text/plain", title: "FreeTheAi LLM guide", href: "/llms.txt" },
    ],
    noscript: [{ innerHTML: `<link rel="stylesheet" href="${fontHref}" />` }],
    script: [{ innerHTML: themeInlineBootstrap() }],
});

const route = useRoute();
const isNotFoundRoute = computed(() => route.name === "not-found" || route.name === "catch-all");
</script>

<template>
    <div style="position: fixed; inset: 0; z-index: -1">
        <DitherShader :cell-size="16" :amplitude="0.32" :speed="0.6" :interval="220" />
    </div>

    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="page-shell">
        <SiteHeader />

        <div class="site-main" id="main-content">
            <router-view />
        </div>

        <SiteFooter :flush="isNotFoundRoute" />
        <MobileNav />
        <ToastRegion />
    </div>
</template>
