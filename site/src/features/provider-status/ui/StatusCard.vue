<script setup lang="ts">
import { computed } from "vue";
import type { ProviderHealth } from "@/entities/provider";
import { formatPercent } from "@/shared/lib/format";
import { DitherAvatar } from "@/shared/ui";

const props = defineProps<{ provider: ProviderHealth; isSelected: boolean }>();
const emit = defineEmits<{ select: []; close: [] }>();

const isAffected = computed(() => props.provider.status === "degraded" || props.provider.status === "down");
const showBlast = computed(() => isAffected.value && props.provider.model_count > 0);

function handleClick(): void {
    if (props.isSelected) emit("close");
    else emit("select");
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
    }
}
</script>

<template>
    <article
        :class="['status-card', `is-${provider.status}`, { 'is-selected': isSelected }]"
        tabindex="0"
        role="button"
        :aria-label="`${provider.prefix} provider status ${provider.status}`"
        data-sound="interaction.tap"
        @click="handleClick"
        @keydown="onKeydown"
    >
        <div class="status-card-top">
            <DitherAvatar :name="provider.prefix" :size="20" :animate="false" class="status-card-avatar" />
            <strong>{{ provider.prefix }}/</strong>
            <span v-if="showBlast" class="status-card-blast">
                {{ provider.status === "down" ? "Affected" : "At risk" }}
                <strong>{{ provider.model_count.toLocaleString() }}</strong>
            </span>
            <span v-else>{{ provider.status }}</span>
        </div>
        <div class="status-card-main">
            <span>{{ provider.model_count.toLocaleString() }}</span>
            <small>{{ provider.model_count === 1 ? "model" : "models" }}</small>
        </div>
        <div class="status-card-meta">
            <span>30m errors</span>
            <strong>{{ formatPercent(provider.error_rate_30m) }}</strong>
            <span>requests</span>
            <strong>{{ provider.requests_30m.toLocaleString() }}</strong>
        </div>
    </article>
</template>

<style scoped>
.status-card-avatar {
    flex: none;
    border-radius: 4px;
    overflow: hidden;
}
</style>
