import type { SetupCategory } from "./setup-guides";

export interface IntentPageFAQ {
    question: string;
    answer: string;
}

export interface IntentPageItem {
    title: string;
    text: string;
}

export interface IntentPage {
    slug: string;
    eyebrow: string;
    title: string;
    h1: string;
    description: string;
    lede: string;
    keywords: string[];
    audience: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    setupCategory?: SetupCategory;
    setupSlugs: string[];
    config: IntentPageItem[];
    strengths: IntentPageItem[];
    routes: IntentPageItem[];
    faqs: IntentPageFAQ[];
}

/**
 * var INTENT_PAGES
 * type Record<string, IntentPage>
 * desc Search-intent landing pages for terms where FreeTheAi needs stronger
 *      non-brand discovery across roleplay, coding-agent, and OpenAI API users.
 */
export const INTENT_PAGES: Record<string, IntentPage> = {
    roleplay: {
        slug: "roleplay-api",
        eyebrow: "Roleplay API",
        title: "Free Roleplay AI API for SillyTavern, Janitor AI, and Chub AI",
        h1: "A free OpenAI-compatible API for roleplay clients.",
        description:
            "Use FreeTheAi with SillyTavern, Janitor AI, Chub AI, RisuAI, and other roleplay frontends. OpenAI-compatible chat completions, streaming, model aliases, and a free Discord key.",
        lede:
            "FreeTheAi gives roleplay users one OpenAI-compatible endpoint that works with popular character chat clients. Get a free key in Discord, paste the base URL into your frontend, and choose an exact model alias from the live catalog.",
        keywords: [
            "roleplay ai api",
            "free roleplay api",
            "sillytavern api provider",
            "janitor ai proxy api",
            "chub ai proxy",
            "risuai api",
            "openai compatible roleplay api",
            "free ai roleplay models",
        ],
        audience: "SillyTavern, Janitor AI, Chub AI, RisuAI, and character-chat users.",
        primaryLabel: "Open roleplay setup guides",
        primaryHref: "/setup#roleplay",
        secondaryLabel: "Browse roleplay models",
        secondaryHref: "/models",
        setupCategory: "roleplay",
        setupSlugs: ["sillytavern", "janitor-ai", "chub-ai", "risuai"],
        config: [
            {
                title: "Base URL",
                text: "https://api.freetheai.xyz/v1",
            },
            {
                title: "Janitor-style full proxy URL",
                text: "https://api.freetheai.xyz/v1/chat/completions",
            },
            {
                title: "Auth",
                text: "Authorization: Bearer YOUR_FREETHEAI_KEY",
            },
        ],
        strengths: [
            {
                title: "Client-ready",
                text: "Works anywhere that accepts a custom OpenAI-compatible base URL or full chat completions proxy URL.",
            },
            {
                title: "Streaming-first",
                text: "Use streaming in roleplay clients so long responses start showing immediately instead of waiting for a full completion.",
            },
            {
                title: "Live catalog",
                text: "Copy exact aliases from the model catalog instead of guessing names. The catalog is the source of truth.",
            },
        ],
        routes: [
            {
                title: "POST /v1/chat/completions",
                text: "The main route for SillyTavern, Janitor AI, Chub AI, RisuAI, and most character chat frontends.",
            },
            {
                title: "GET /v1/models",
                text: "Authenticated model list for clients that can fetch a dropdown from your key.",
            },
            {
                title: "GET /v1/models/full",
                text: "Expanded catalog for context windows, output limits, image support, and access labels on the public site.",
            },
        ],
        faqs: [
            {
                question: "Does FreeTheAi work with SillyTavern?",
                answer:
                    "Yes. Select Chat Completion, choose Custom OpenAI-compatible, set the base URL to https://api.freetheai.xyz/v1, paste your key, and choose an alias from the model catalog.",
            },
            {
                question: "What URL should Janitor AI use?",
                answer:
                    "Janitor AI usually wants the full proxy path. Use https://api.freetheai.xyz/v1/chat/completions and your FreeTheAi API key.",
            },
            {
                question: "Where do I find roleplay model names?",
                answer:
                    "Use https://freetheai.xyz/models and copy exact aliases. If a model is hidden from your key, it requires a different access tier or role.",
            },
        ],
    },
    coding: {
        slug: "coding-agent-api",
        eyebrow: "Coding agents",
        title: "OpenAI-Compatible API for Cline, OpenCode, Roo Code, and Coding Agents",
        h1: "One endpoint for coding agents and editor tools.",
        description:
            "Connect FreeTheAi to OpenCode, Cline, Roo Code, Kilo Code, Zed, Continue.dev, Aider, and other coding agents with an OpenAI-compatible base URL.",
        lede:
            "FreeTheAi works with coding agents that support custom OpenAI-compatible providers. Add the base URL, paste your key, choose a model alias, and let the client handle streaming and tools.",
        keywords: [
            "coding agent api",
            "cline openai compatible api",
            "opencode openai compatible api",
            "roo code api provider",
            "kilo code api provider",
            "zed ai custom provider",
            "continue dev openai compatible",
            "aider openai compatible api",
        ],
        audience: "OpenCode, Cline, Roo Code, Kilo Code, Zed, Continue.dev, Aider, and editor-agent users.",
        primaryLabel: "Open coding setup guides",
        primaryHref: "/setup#coding",
        secondaryLabel: "See API docs",
        secondaryHref: "/docs",
        setupCategory: "coding",
        setupSlugs: ["opencode", "cline", "roo-code", "kilo-code", "zed", "continue-dev", "aider"],
        config: [
            {
                title: "Base URL",
                text: "https://api.freetheai.xyz/v1",
            },
            {
                title: "Provider type",
                text: "OpenAI Compatible",
            },
            {
                title: "Model field",
                text: "Use an exact alias from https://freetheai.xyz/models",
            },
        ],
        strengths: [
            {
                title: "Tool-friendly routes",
                text: "Chat completions, Messages, and Responses compatibility cover the common surfaces used by coding agents.",
            },
            {
                title: "Exact setup guides",
                text: "The setup pages include copy-paste config blocks for editor agents instead of generic SDK advice.",
            },
            {
                title: "Model metadata",
                text: "The site catalog exposes public context, output, and capability fields so clients can be configured accurately.",
            },
        ],
        routes: [
            {
                title: "POST /v1/chat/completions",
                text: "Default route for OpenAI-compatible editor integrations and many agent tools.",
            },
            {
                title: "POST /v1/messages",
                text: "Anthropic-style compatibility route for clients that speak Messages format.",
            },
            {
                title: "POST /v1/responses",
                text: "Responses-style compatibility route for clients and SDKs moving toward the newer OpenAI surface.",
            },
        ],
        faqs: [
            {
                question: "Can Cline use FreeTheAi?",
                answer:
                    "Yes. Pick OpenAI Compatible in Cline, set Base URL to https://api.freetheai.xyz/v1, paste your key, and type an exact model alias.",
            },
            {
                question: "Can OpenCode use FreeTheAi?",
                answer:
                    "Yes. Add a custom provider with @ai-sdk/openai-compatible and baseURL https://api.freetheai.xyz/v1, then list the aliases you want in opencode.json.",
            },
            {
                question: "Do coding agents need a paid plan?",
                answer:
                    "The free API works for compatible clients, but optional paid plans provide separate higher-power model access and plan limits for heavier use.",
            },
        ],
    },
    compatible: {
        slug: "openai-compatible-api",
        eyebrow: "OpenAI-compatible",
        title: "Free OpenAI-Compatible API Gateway With No Credit Card",
        h1: "Drop-in OpenAI-compatible API access.",
        description:
            "FreeTheAi is a free OpenAI-compatible API gateway with Discord key signup, chat completions, streaming, tool calling, Messages, Responses, and a live model catalog.",
        lede:
            "If your app, SDK, or AI client lets you set an OpenAI-compatible base URL, it can usually talk to FreeTheAi. Change the base URL, use your FreeTheAi key, and pick an exact model alias from the catalog.",
        keywords: [
            "free openai compatible api",
            "openai compatible api gateway",
            "free ai api no credit card",
            "free llm api",
            "openai api alternative",
            "chat completions api free",
            "anthropic messages api free",
            "responses api compatible",
        ],
        audience: "Developers, students, hobby projects, Discord bots, AI clients, and agent frameworks.",
        primaryLabel: "Start in 60 seconds",
        primaryHref: "/quickstart",
        secondaryLabel: "Read API docs",
        secondaryHref: "/docs",
        setupSlugs: ["opencode", "sillytavern", "cline", "janitor-ai", "librechat", "open-webui"],
        config: [
            {
                title: "Base URL",
                text: "https://api.freetheai.xyz/v1",
            },
            {
                title: "Auth header",
                text: "Authorization: Bearer YOUR_FREETHEAI_KEY",
            },
            {
                title: "Model source",
                text: "GET /v1/models or https://freetheai.xyz/models",
            },
        ],
        strengths: [
            {
                title: "Drop-in SDK support",
                text: "Use standard OpenAI SDK configuration with a custom base URL and your FreeTheAi key.",
            },
            {
                title: "Multiple compatibility routes",
                text: "Chat Completions, Messages, and Responses share one public gateway.",
            },
            {
                title: "No card to start",
                text: "The free tier starts from Discord signup and daily check-in. Optional paid slots are separate.",
            },
        ],
        routes: [
            {
                title: "POST /v1/chat/completions",
                text: "OpenAI-compatible chat endpoint with streaming and tool calling where supported by the selected model.",
            },
            {
                title: "POST /v1/messages",
                text: "Anthropic-style Messages route for Claude-style clients and frameworks.",
            },
            {
                title: "POST /v1/responses",
                text: "Responses-compatible route for newer OpenAI-style integrations.",
            },
        ],
        faqs: [
            {
                question: "Is FreeTheAi OpenAI-compatible?",
                answer:
                    "Yes. Use https://api.freetheai.xyz/v1 as the base URL with your FreeTheAi API key and exact model aliases from the catalog.",
            },
            {
                question: "Does the free API require a credit card?",
                answer:
                    "No. Users get a free key in Discord with /signup and unlock it daily with /checkin.",
            },
            {
                question: "Which endpoint should I use first?",
                answer:
                    "Use POST /v1/chat/completions first. Use /v1/messages or /v1/responses only when your client expects those protocols.",
            },
        ],
    },
};
