<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { CATEGORY_LABELS, CATEGORY_ORDER, SETUP_GUIDES, setupGuidesByCategory } from "@/entities/setup-guide";
import { siteConfig } from "@/shared/config/site";
import { DitherButton, Logo } from "@/shared/ui";

const route = useRoute();
const currentPath = computed(() => route.path);

const navLinks: [string, string][] = [
    ["/home", "Home"],
    ["/docs", "Docs"],
    ["/models", "Models"],
    ["/pricing", "Pricing"],
    ["/status", "Status"],
];

const setupCategories = setupGuidesByCategory();
const setupGuideCount = SETUP_GUIDES.length;
const isSetupActive = computed(() => currentPath.value === "/setup" || currentPath.value.startsWith("/setup/"));

const dropdownOpen = ref(false);
const dropdownRoot = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLButtonElement | null>(null);

function toggleDropdown(): void {
    dropdownOpen.value = !dropdownOpen.value;
}

function closeDropdown(): void {
    dropdownOpen.value = false;
}

function onDocumentClick(event: MouseEvent): void {
    if (dropdownOpen.value && dropdownRoot.value && !dropdownRoot.value.contains(event.target as Node)) closeDropdown();
}

function onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && dropdownOpen.value) {
        closeDropdown();
        triggerEl.value?.focus();
    }
}

function onPanelFocusOut(event: FocusEvent): void {
    const panel = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (!panel.contains(related) && !dropdownRoot.value?.querySelector(".nav-dropdown-trigger")?.contains(related)) closeDropdown();
}

const themeToggleEl = ref<HTMLButtonElement | null>(null);

function onThemeToggle(): void {
    const toggle = (window as unknown as { __themeToggle?: () => string }).__themeToggle;
    if (!toggle) return;
    const scheme = toggle();
    themeToggleEl.value?.setAttribute("data-scheme", scheme);
}

onMounted(() => {
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown);
});
onBeforeUnmount(() => {
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onDocumentKeydown);
});
</script>

<template>
    <header class="site-header">
        <nav class="nav" aria-label="Main navigation">
            <router-link class="brand" to="/home"><Logo :width="160" /></router-link>
            <div class="nav-links">
                <router-link
                    v-for="[href, label] in navLinks"
                    :key="href"
                    :to="href"
                    :class="{ 'is-active': currentPath === href }"
                    :aria-current="currentPath === href ? 'page' : undefined"
                >
                    {{ label }}
                </router-link>
                <div ref="dropdownRoot" :class="['nav-dropdown', { 'is-active': isSetupActive, 'is-open': dropdownOpen }]">
                    <button
                        ref="triggerEl"
                        type="button"
                        :class="['nav-dropdown-trigger', { 'is-active': isSetupActive }]"
                        aria-haspopup="true"
                        aria-controls="setup-guides-menu"
                        :aria-expanded="dropdownOpen"
                        @click="toggleDropdown"
                    >
                        Setup
                        <span class="nav-dropdown-caret" aria-hidden="true"></span>
                    </button>
                    <div id="setup-guides-menu" class="nav-dropdown-panel" aria-label="Setup guides" @focusout="onPanelFocusOut">
                        <div class="nav-dropdown-head">
                            <router-link to="/setup" class="nav-dropdown-head-link">
                                <strong>Setup guides</strong>
                                <span>{{ setupGuideCount }} apps and clients</span>
                            </router-link>
                        </div>
                        <template v-for="category in CATEGORY_ORDER" :key="category">
                            <div v-if="setupCategories[category]?.length" class="nav-dropdown-group">
                                <span class="nav-dropdown-group-label">{{ CATEGORY_LABELS[category] }}</span>
                                <router-link
                                    v-for="guide in setupCategories[category]"
                                    :key="guide.slug"
                                    :to="`/setup/${guide.slug}`"
                                    class="nav-dropdown-item"
                                >
                                    <img v-if="guide.logoUrl" :src="guide.logoUrl" alt="" class="nav-dropdown-icon" width="16" height="16" loading="lazy" />
                                    <strong>{{ guide.name }}</strong>
                                    <span>{{ guide.tagline }}</span>
                                </router-link>
                            </div>
                        </template>
                    </div>
                </div>
                <a :href="siteConfig.socials.github" target="_blank" rel="noreferrer">GitHub</a>
            </div>
            <div class="nav-actions">
                <button ref="themeToggleEl" type="button" class="theme-toggle" aria-label="Toggle color scheme" title="Toggle theme" @click="onThemeToggle">
                    <span class="theme-toggle-icon" aria-hidden="true">◎</span>
                </button>
                <DitherButton
                    :href="siteConfig.socials.discord"
                    target="_blank"
                    rel="noreferrer"
                    color="blue"
                    size="sm"
                    data-sound="interaction.confirm"
                >Join Discord</DitherButton>
                <DitherButton
                    :href="siteConfig.socials.donate"
                    target="_blank"
                    rel="noreferrer"
                    color="pink"
                    size="sm"
                    data-sound="interaction.confirm"
                    aria-label="Donate to FreeTheAi on Buy Me a Coffee"
                >
                    <span class="donate-button-icon" aria-hidden="true">&#9829;</span>
                    Donate
                </DitherButton>
            </div>
        </nav>
    </header>
</template>
