<script setup lang="ts">
import { computed, ref } from "vue";
import type { ProviderHealth } from "@/entities/provider";
import { formatPercent } from "@/shared/lib/format";
import { Drawer } from "@/shared/ui";

const props = defineProps<{ provider: ProviderHealth }>();
const emit = defineEmits<{ close: [] }>();

const open = ref(true);
const isAffected = computed(() => props.provider.status === "degraded" || props.provider.status === "down");

function onOpenUpdate(value: boolean): void {
    open.value = value;
    if (!value) emit("close");
}

function formatTimestamp(iso: string | null | undefined): string {
    if (!iso) return "never";
    try {
        return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return "unknown";
    }
}
</script>

<template>
    <Drawer :model-value="open" :label="`${provider.prefix} provider status`" @update:model-value="onOpenUpdate" :popup-class="`provider-popover is-${provider.status}`">
        <div class="popover-status-strip" />

        <div class="popover-header">
            <h3 class="popover-heading">{{ provider.prefix }}/</h3>
            <p class="popover-sub">
                Status: <strong>{{ provider.status }}</strong> &middot;
                {{ provider.model_count.toLocaleString() }} {{ provider.model_count === 1 ? "model" : "models" }}
                <template v-if="isAffected">{{ provider.status === "down" ? " — affected" : " — at risk" }}</template>
            </p>
        </div>

        <div class="popover-body">
            <dl class="detail-section">
                <h4 class="detail-section-title">Reliability</h4>
                <dt>60m error rate</dt>
                <dd :class="{ zero: provider.error_rate_60m === 0 }">{{ formatPercent(provider.error_rate_60m) }}</dd>
                <dt>30m errors</dt>
                <dd>{{ provider.errors_30m.toLocaleString() }}</dd>
                <dt>60m errors</dt>
                <dd>{{ provider.errors_60m.toLocaleString() }}</dd>
            </dl>
            <dl class="detail-section">
                <h4 class="detail-section-title">Throughput</h4>
                <dt>60m requests</dt>
                <dd>{{ provider.requests_60m.toLocaleString() }}</dd>
                <dt>30m successes</dt>
                <dd>{{ provider.successes_30m.toLocaleString() }}</dd>
                <dt>60m successes</dt>
                <dd>{{ provider.successes_60m.toLocaleString() }}</dd>
            </dl>
            <dl class="detail-section">
                <h4 class="detail-section-title">Activity</h4>
                <dt>Last success</dt>
                <dd>{{ formatTimestamp(provider.last_success_at) }}</dd>
                <dt>Last error</dt>
                <dd :class="{ zero: !provider.last_error_at }">{{ formatTimestamp(provider.last_error_at) }}</dd>
            </dl>
            <router-link v-if="provider.model_count > 0" class="catalog-link" :to="`/models?prefix=${provider.prefix}`">
                View all in model catalog <span class="catalog-link-arrow">&rarr;</span>
            </router-link>
        </div>
    </Drawer>
</template>
