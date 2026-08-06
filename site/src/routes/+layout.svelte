<script lang="ts">
    import type { Snippet } from "svelte";
    import { onMount } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import "@/app/styles/global.css";
    import "@/app/styles/kit.css";
    import { siteConfig } from "@/shared/config/site";
    import { themeInlineBootstrap } from "@/shared/lib/theme/singleton";
    import { bootstrapClientSystems } from "@/app/providers";
    import { initGlobalInteractions } from "@/app/interactions";
    import { SiteHeader } from "@/widgets/header";
    import { SiteFooter } from "@/widgets/footer";
    import { MobileNav } from "@/widgets/mobile-nav";
    import { ToastRegion, ProgressiveBlur } from "@/shared/ui";

    let { children }: { children: Snippet } = $props();

    const fontHref =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=STIX+Two+Text:ital,wght@0,400;0,500;0,600;0,700;1,400&display=optional";

    const isNotFoundRoute = $derived(page.status === 404);

    onMount(() => {
        bootstrapClientSystems();
        initGlobalInteractions();
    });

    // Router-driven navigation sound, replacing the previous vue-router
    // `router.beforeEach` hook. `afterNavigate` also fires once for the
    // initial load (type "enter"), which the original skipped too.
    afterNavigate((navigation) => {
        if (navigation.type === "enter") return;
        const soundPlay = (window as unknown as { __soundPlay?: (role: string) => void }).__soundPlay;
        soundPlay?.("navigation.forward");
    });
</script>

<svelte:head>
    <meta name="theme-color" content="oklch(0.168 0 0)" />
    <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta name="bingbot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta name="applebot" content="all" />
    <meta name="application-name" content={siteConfig.title} />
    <meta name="apple-mobile-web-app-title" content={siteConfig.title} />
    <meta name="alternate-name" content={siteConfig.aliases.join(", ")} />
    <meta name="brand-aliases" content={siteConfig.aliases.join(", ")} />
    <meta name="author" content={siteConfig.author.name} />
    <meta name="publisher" content={siteConfig.title} />
    <meta name="DC.alternative" content={siteConfig.aliases.join(", ")} />
    <meta name="classification" content="Developer API, AI API Gateway" />
    <meta name="category" content="Developer Tools" />
    <meta name="coverage" content="Worldwide" />
    <meta name="distribution" content="Global" />
    <meta name="ai-summary" content={siteConfig.description} />
    <meta name="ai-crawler-policy" content="index,follow,snippet,cite,answer" />
    <meta name="api-base-url" content="https://api.freetheai.xyz/v1" />
    <meta name="model-catalog" content="https://freetheai.xyz/models.json" />
    <meta name="paid-plan-catalog" content="https://freetheai.xyz/paid-plan.json" />
    <meta name="llms-txt" content="https://freetheai.xyz/llms.txt" />
    <meta name="ai-guide" content="https://freetheai.xyz/ai.txt" />
    <meta name="DC.publisher" content={siteConfig.title} />
    <meta name="DC.creator" content={siteConfig.author.name} />
    <meta name="DC.language" content="en-US" />
    <meta name="DC.type" content="Service" />
    <meta name="DC.format" content="text/html" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content={siteConfig.defaults.locale} />
    <meta property="og:site_name" content={siteConfig.title} />
    <meta name="twitter:card" content={siteConfig.defaults.twitterCard} />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    {@html `<link rel="preload" as="style" href="${fontHref}" />`}
    {@html `<link rel="stylesheet" href="${fontHref}" media="print" onload="this.media='all'" />`}
    <link rel="preload" as="font" type="font/woff2" href="/fonts/material-symbols-outlined-subset.woff2" crossorigin="anonymous" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <link rel="alternate" type="application/json" title="FreeTheAi model catalog" href="/models.json" />
    <link rel="alternate" type="application/json" title="FreeTheAi paid plan" href="/paid-plan.json" />
    <link rel="alternate" type="text/plain" title="FreeTheAi AI crawler guide" href="/ai.txt" />
    <link rel="llms.txt" href="/llms.txt" />
    <link rel="alternate" type="text/plain" title="FreeTheAi LLM guide" href="/llms.txt" />

    {@html `<noscript><link rel="stylesheet" href="${fontHref}" /></noscript>`}
    {@html `<script>${themeInlineBootstrap()}</` + `script>`}
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>
<div class="page-shell">
    <ProgressiveBlur />
    <SiteHeader />

    <div class="site-main" id="main-content">
        {@render children()}
    </div>

    <SiteFooter flush={isNotFoundRoute} />
    <MobileNav />
    <ToastRegion />
</div>
