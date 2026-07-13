<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from "vue";
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

function menuItems(): HTMLButtonElement[] {
    return menu.value ? [...menu.value.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]')] : [];
}

async function openMenu(focus: "first" | "last" = "first"): Promise<void> {
    if (!open.value) soundPlay("overlay.expand");
    open.value = true;
    await nextTick();
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
    if (open.value && root.value && !root.value.contains(event.target as Node)) close();
}

function onToggleOption(value: string): void {
    soundPlay("interaction.toggle");
    emit("toggle", value);
}

onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));
</script>

<template>
    <div ref="root" class="kb-menu-root">
        <button
            ref="trigger"
            type="button"
            class="kb-menu__trigger"
            :class="{ 'is-active': activeCount > 0 }"
            aria-haspopup="menu"
            :aria-expanded="open"
            :aria-controls="menuId"
            @click="toggleOpen"
            @keydown="onTriggerKeydown"
        >
            <span class="catalog-filter-label">{{ triggerLabel }}</span>
            <span class="catalog-filter-value">{{ valueLabel }}</span>
            <span v-if="activeCount > 0" class="catalog-filter-count">{{ activeCount }}</span>
            <ChevronDownIcon class="kb-menu__chevron" />
        </button>
        <div v-if="open" class="kb-menu__positioner">
            <div :id="menuId" ref="menu" class="kb-menu__content" role="menu" :aria-label="triggerLabel" @keydown="onMenuKeydown">
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
        </div>
    </div>
</template>

<style scoped>
.kb-menu-root {
    position: relative;
    display: inline-flex;
}
.kb-menu__trigger[aria-expanded="true"] .kb-menu__chevron {
    transform: rotate(180deg);
}
</style>
