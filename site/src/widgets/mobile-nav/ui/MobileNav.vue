<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { siteConfig } from "@/shared/config/site";
import { CtaButton, Drawer } from "@/shared/ui";

const route = useRoute();
const currentPath = computed(() => route.path);

const ICONS: Record<string, string> = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .6-1.4l7-6a2 2 0 0 1 2.8 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" /></svg>',
    models: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>',
    pricing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>',
    status: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-3l-2.5 5-4.5-10-3.5 7H2" /></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="5" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="12" cy="19" r="2" /><circle cx="19" cy="19" r="2" /></svg>',
};

const TABS: [string, string, string][] = [
    ["/home", "Home", "home"],
    ["/models", "Models", "models"],
    ["/pricing", "Pricing", "pricing"],
    ["/status", "Status", "status"],
];

const MORE: [string, string, boolean, string][] = [
    ["/docs", "Docs", false, "description"],
    ["/setup", "Setup", false, "settings"],
    ["/roleplay-api", "Roleplay API", false, "theater_comedy"],
    ["/coding-agent-api", "Coding API", false, "code"],
    ["/privacy", "Privacy", false, "shield"],
    ["/terms", "Terms", false, "gavel"],
    [siteConfig.socials.github, "Repo", true, "code"],
    [siteConfig.socials.discord, "Join Discord", true, "chat"],
    [siteConfig.socials.donate, "Donate", true, "favorite"],
];

const moreOpen = ref(false);

function closeMore(): void {
    moreOpen.value = false;
}

function onMoreOpenUpdate(value: boolean): void {
    moreOpen.value = value;
}
</script>

<template>
    <div class="mobile-nav">
        <nav class="bottom-tab-bar" aria-label="Mobile navigation">
            <router-link
                v-for="[href, label, icon] in TABS"
                :key="href"
                :to="href"
                :class="['bottom-tab', { 'is-active': currentPath === href }]"
                :aria-current="currentPath === href ? 'page' : undefined"
                :data-sound="currentPath === href ? 'interaction.subtle' : 'interaction.tap'"
            >
                <span class="bottom-tab-icon" v-html="ICONS[icon]" />
                <span class="bottom-tab-label">{{ label }}</span>
            </router-link>
            <button
                type="button"
                :class="['bottom-tab', { 'is-active': moreOpen }]"
                aria-label="More navigation"
                :aria-expanded="moreOpen"
                aria-controls="mobile-more-menu"
                :data-sound="moreOpen ? 'overlay.close' : 'overlay.open'"
                @click="moreOpen = !moreOpen"
            >
                <span class="bottom-tab-icon" v-html="ICONS.more" />
                <span class="bottom-tab-label">More</span>
            </button>
        </nav>

        <Drawer variant="nav" label="More navigation" :model-value="moreOpen" @update:model-value="onMoreOpenUpdate" popup-class="more-sheet">
            <div id="mobile-more-menu" class="more-menu">
                <div class="more-menu-head">
                    <span class="more-menu-title">More</span>
                    <CtaButton :href="siteConfig.socials.discord" target="_blank" rel="noreferrer" size="sm" @click="closeMore">Get a free key</CtaButton>
                </div>
                <nav class="more-menu-links" aria-label="More navigation">
                    <template v-for="([href, label, external, icon], index) in MORE" :key="href">
                        <div v-if="index === 6" class="more-menu-divider" aria-hidden="true" />
                        <a
                            v-if="external"
                            :href="href"
                            :class="['more-menu-link', { 'is-active': currentPath === href }]"
                            target="_blank"
                            rel="noreferrer"
                            @click="closeMore"
                        >
                            <span class="material-symbols-outlined" aria-hidden="true">{{ icon }}</span>
                            <span>{{ label }}</span>
                        </a>
                        <router-link
                            v-else
                            :to="href"
                            :class="['more-menu-link', { 'is-active': currentPath === href }]"
                            @click="closeMore"
                        >
                            <span class="material-symbols-outlined" aria-hidden="true">{{ icon }}</span>
                            <span>{{ label }}</span>
                        </router-link>
                    </template>
                </nav>
            </div>
        </Drawer>
    </div>
</template>
