<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { soundPlay } from "@/shared/lib/sound/singleton";
import CheckmarkIcon from "./icons/CheckmarkIcon.vue";
import ChevronDownIcon from "./icons/ChevronDownIcon.vue";

export interface DropdownMenuOption {
    value: string;
    label: string;
    count?: number;
    checked: boolean;
}

const props = defineProps<{
    triggerLabel: string;
    valueLabel: string;
    activeCount: number;
    options: DropdownMenuOption[];
}>();
const emit = defineEmits<{ toggle: [string] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const menu = ref<HTMLElement | null>(null);
const menuId = useId();
const panelStyle = ref("");

function menuItems(): HTMLButtonElement[] {
    return menu.value ? [...menu.value.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]')] : [];
}

function updatePosition(): void {
    const triggerEl = trigger.value;
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const maxH = Math.min(spaceBelow - 8, 320);
    panelStyle.value = `position:fixed;left:${rect.left}px;top:${rect.bottom}px;width:${rect.width}px;--anchor-width:${rect.width}px;--available-height:${Math.max(maxH, 100)}px;--transform-origin:top center;`;
}

async function openMenu(focus: "first" | "last" = "first"): Promise<void> {
    if (!open.value) soundPlay("overlay.expand");
    open.value = true;
    await nextTick();
    updatePosition();
    const items = menuItems();
    (focus === "last" ? items.at(-1) : items[0])?.focus();
}

function toggleOpen(): void {
    if (open.value) close();
    else void openMenu();
}

function close(restoreFocus = false): void {
    open.value = false;
    if (restoreFocus) nextTick(() => trigger.value?.focus());
}

function onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void openMenu("first");
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        void openMenu("last");
    }
}

function onMenuKeydown(event: KeyboardEvent): void {
    const items = menuItems();
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
    } else if (event.key === "Tab") {
        close();
        return;
    } else {
        return;
    }
    event.preventDefault();
    items[next]?.focus();
}

function onDocumentClick(event: MouseEvent): void {
    if (open.value && root.value && !root.value.contains(event.target as Node) && menu.value && !menu.value.contains(event.target as Node)) close();
}

function onToggleOption(value: string): void {
    soundPlay("interaction.toggle");
    emit("toggle", value);
}

watch(open, (isOpen) => {
    if (isOpen) {
        window.addEventListener("scroll", updatePosition, { passive: true });
        window.addEventListener("resize", updatePosition, { passive: true });
    } else {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
    }
});

onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => {
    document.removeEventListener("click", onDocumentClick);
    window.removeEventListener("scroll", updatePosition);
    window.removeEventListener("resize", updatePosition);
});
</script>

<template>
    <div ref="root" class="kb-menu-root">
        <button
            ref="trigger"
            type="button"
            class="kb-menu__trigger catalog-filter-trigger"
            :class="{ 'is-active': activeCount > 0 }"
            aria-haspopup="menu"
            :aria-expanded="open"
            :data-expanded="open ? '' : undefined"
            :aria-controls="menuId"
            @click="toggleOpen"
            @keydown="onTriggerKeydown"
        >
            <span class="catalog-filter-label">{{ triggerLabel }}</span>
            <span class="catalog-filter-value">{{ valueLabel }}</span>
            <span v-if="activeCount > 0" class="catalog-filter-count">{{ activeCount }}</span>
            <ChevronDownIcon class="kb-menu__chevron" />
        </button>
        <Teleport to="body">
            <div v-if="open" ref="menu" class="kb-menu__content catalog-filter-content" :style="panelStyle" role="menu" :aria-label="triggerLabel" @keydown="onMenuKeydown">
                <button
                    v-for="option in props.options"
                    :key="option.value"
                    type="button"
                    role="menuitemcheckbox"
                    :aria-checked="option.checked"
                    class="kb-menu__item catalog-filter-menu-item"
                    :class="{ 'is-active': option.checked }"
                    @click="onToggleOption(option.value)"
                >
                    <span class="kb-menu__checkbox-indicator catalog-filter-checkbox">
                        <CheckmarkIcon v-if="option.checked" />
                    </span>
                    <span class="catalog-filter-option-name">{{ option.label }}</span>
                    <span v-if="option.count !== undefined" class="catalog-filter-option-count">{{ option.count }}</span>
                </button>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.kb-menu-root {
    position: relative;
    display: inline-flex;
}
.kb-menu__trigger[aria-expanded="true"] .kb-menu__chevron,
.catalog-filter-trigger[data-expanded] .kb-menu__chevron {
    transform: rotate(180deg);
}
</style>

<style>
/* Teleported panel needs position:fixed because it's no longer inside
   the positioner wrapper. The inline style sets width, --anchor-width,
   --available-height, and --transform-origin dynamically. */
.kb-menu__content.catalog-filter-content {
    position: fixed;
    z-index: 10000;
}
</style>
