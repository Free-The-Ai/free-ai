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
const closing = ref(false);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const menu = ref<HTMLElement | null>(null);
const menuId = useId();
const panelStyle = ref("");
let closeTimer: number | undefined;

function menuItems(): HTMLButtonElement[] {
    return menu.value ? [...menu.value.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]')] : [];
}

function updatePosition(): void {
    const triggerEl = trigger.value;
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const MIN_H = 200;
    let top: number;
    let maxH: number;
    let origin: string;
    if (spaceBelow >= MIN_H || spaceBelow >= spaceAbove) {
        top = rect.bottom;
        maxH = Math.max(Math.min(spaceBelow - 8, 320), MIN_H);
        origin = "top center";
    } else {
        top = Math.max(8, rect.top - Math.min(spaceAbove - 8, 320));
        maxH = Math.max(Math.min(spaceAbove - 8, 320), MIN_H);
        origin = "bottom center";
    }
    panelStyle.value = `left:${rect.left}px;top:${top}px;width:${rect.width}px;--max-h:${maxH}px;--origin:${origin};`;
}

async function openMenu(focus: "first" | "last" = "first"): Promise<void> {
    if (closeTimer) { window.clearTimeout(closeTimer); closeTimer = undefined; }
    if (!open.value) soundPlay("overlay.expand");
    closing.value = false;
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
    if (!open.value) return;
    closing.value = true;
    if (closeTimer) window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
        open.value = false;
        closing.value = false;
        closeTimer = undefined;
    }, 150);
    if (restoreFocus) trigger.value?.focus();
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
    if (closeTimer) window.clearTimeout(closeTimer);
});
</script>

<template>
    <div ref="root" class="kb-menu-root">
        <button
            ref="trigger"
            type="button"
            class="catalog-filter-trigger"
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
            <div
                v-if="open"
                ref="menu"
                class="catalog-filter-content"
                :class="{ 'is-closing': closing }"
                :style="panelStyle"
                role="menu"
                :aria-label="triggerLabel"
                @keydown="onMenuKeydown"
            >
                <button
                    v-for="option in props.options"
                    :key="option.value"
                    type="button"
                    role="menuitemcheckbox"
                    :aria-checked="option.checked"
                    class="catalog-filter-menu-item"
                    :class="{ 'is-active': option.checked }"
                    @click="onToggleOption(option.value)"
                >
                    <span class="catalog-filter-checkbox">
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
.catalog-filter-trigger[data-expanded] .kb-menu__chevron {
    transform: rotate(180deg);
}
</style>

<style>
/* ── Dropdown panel (teleported to body) ──
   UI laws applied:
   - Shadows over borders: elevated element uses shadow-ring, not 1px border
   - Concentric border radius: panel = radius-sm + padding
   - Interruptible animations: CSS transitions, not keyframes
   - Subtle exit: opacity + translateY, softer/shorter than enter
   - Transition only what changes: opacity, transform only */

.catalog-filter-content {
    position: fixed;
    z-index: 10000;
    padding: 4px;
    max-height: var(--max-h, 320px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    border-radius: calc(var(--radius-sm) + 4px);
    background: var(--sk-shell-bg);
    box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.06),
        0 4px 6px -1px rgba(0, 0, 0, 0.3),
        0 10px 15px -3px rgba(0, 0, 0, 0.2),
        0 0 6px 0px rgba(0, 0, 0, 0.15);
    transform-origin: var(--origin, top center);
    opacity: 1;
    transform: scale(1) translateY(0);
    transition-property: opacity, transform;
    transition-duration: 150ms;
    transition-timing-function: var(--ease-out-smooth);
}

.catalog-filter-content.is-closing {
    opacity: 0;
    transform: scale(0.97) translateY(-4px);
    transition-duration: 120ms;
    transition-timing-function: var(--ease-in-smooth);
}

.catalog-filter-content::-webkit-scrollbar {
    width: 5px;
}
.catalog-filter-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
}

.catalog-filter-content .catalog-filter-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 36px;
    padding: 7px 10px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    cursor: pointer;
    transition-property: background, color;
    transition-duration: 120ms;
    transition-timing-function: var(--ease-out-smooth);
    user-select: none;
}
.catalog-filter-content .catalog-filter-menu-item:hover {
    background: rgba(255, 255, 255, 0.04);
}
.catalog-filter-content .catalog-filter-menu-item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
}
.catalog-filter-content .catalog-filter-menu-item.is-active {
    color: var(--accent-text);
    text-shadow: var(--accent-text-glow);
    background: var(--accent-muted);
}
.catalog-filter-content .catalog-filter-checkbox {
    flex: 0 0 16px;
    width: 16px;
    color: var(--accent);
}
.catalog-filter-content .catalog-filter-option-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.catalog-filter-content .catalog-filter-option-count {
    flex: 0 0 auto;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
}

/* ── Trigger: scale on press (UI law #12) ── */
.catalog-filter-trigger {
    transition-property: border-color, box-shadow, transform;
    transition-duration: 150ms;
    transition-timing-function: var(--ease-out-smooth);
}
.catalog-filter-trigger:active {
    scale: 0.97;
}
.catalog-filter-trigger .kb-menu__chevron {
    transition: transform 200ms var(--ease-out-smooth);
}
</style>
