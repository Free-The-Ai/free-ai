<script setup lang="ts">
import { siteConfig } from "@/shared/config/site";

// `flush` matches the 404 page's original `body .site-footer { margin-top: 0 }`
// override, scoped here instead of leaking a global selector.
defineProps<{ flush?: boolean }>();
</script>

<template>
    <footer class="site-footer" :style="flush ? { marginTop: 0 } : undefined" aria-label="Site footer">
        <div class="footer-links">
            <router-link to="/quickstart">Quickstart</router-link>
            <router-link to="/setup">Setup guides</router-link>
            <router-link to="/roleplay-api">Roleplay API</router-link>
            <router-link to="/coding-agent-api">Coding agent API</router-link>
            <router-link to="/openai-compatible-api">OpenAI-compatible API</router-link>
            <router-link to="/models">Models</router-link>
            <router-link to="/pricing">Pricing</router-link>
            <router-link to="/status">Status</router-link>
            <router-link to="/docs">Docs</router-link>
            <router-link to="/privacy">Privacy</router-link>
            <router-link to="/terms">Terms</router-link>
            <router-link to="/support">Support</router-link>
            <router-link to="/team">Team</router-link>
            <router-link to="/what-is-free-the-ai">What is FreeTheAi</router-link>
            <a :href="siteConfig.socials.github" target="_blank" rel="noreferrer">GitHub</a>
            <a :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">Discord</a>
            <a :href="siteConfig.socials.linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
            <a class="footer-donate-link" :href="siteConfig.socials.donate" target="_blank" rel="noreferrer">
                <span aria-hidden="true">&#9829;</span>
                Donate
            </a>
        </div>
        <div class="footer-bottom">free tier stays free. paid slots are optional. support and issue reports are available on the support page.</div>
    </footer>
</template>
