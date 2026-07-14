<script setup lang="ts">
import { computed } from "vue";
import type { PaidPlan } from "@/entities/paid-plan";
import { PLAN_COPY, formatNumber, formatPlanPrice, limitEntries, planPeriod, LIMIT_LABELS } from "@/entities/paid-plan";
import { DitherButton } from "@/shared/ui";

const props = defineProps<{ plan: PaidPlan; active: boolean; period?: string }>();
const emit = defineEmits<{ select: [] }>();

const copy = computed(
    () =>
        PLAN_COPY[props.plan.id] ?? {
            tag: "Paid plan",
            bestFor: props.plan.description ?? "Paid API access.",
            accent: "Request-unit pricing with a dedicated paid model catalog.",
        },
);
const period = computed(() => planPeriod(props.plan, props.period));
const limits = computed(() => limitEntries(props.plan).slice(0, 3));
</script>

<style scoped>
.paid-plan-select-dither {
    width: 100%;
    min-height: 42px;
    margin-top: auto;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
</style>

<template>
    <article :class="['paid-plan-option', { 'is-active': active }]">
        <span v-if="active" class="paid-plan-badge">Recommended</span>
        <div class="paid-plan-option-top">
            <span class="pricing-route-pill">{{ copy.tag }}</span>
            <span class="paid-plan-option-price">
                {{ formatPlanPrice(plan) }}
                <small>{{ period ? ` / ${period}` : "" }}</small>
            </span>
        </div>
        <h3>{{ plan.display_name }}</h3>
        <p>{{ copy.bestFor }}</p>
        <div class="paid-plan-stat-grid">
            <span>
                <strong>{{ formatNumber(plan.model_count ?? plan.models?.length ?? 0) }}</strong>
                models
            </span>
            <span>
                <strong>{{ plan.concurrency_limit ?? "-" }}</strong>
                concurrent
            </span>
        </div>
        <div class="paid-plan-limit-strip">
            <span v-for="entry in limits" :key="entry.key">
                <strong>{{ formatNumber(entry.value.limit ?? 0) }}</strong>
                {{ LIMIT_LABELS[entry.key] ?? entry.key }}
            </span>
        </div>
        <p class="paid-plan-option-note">{{ copy.accent }}</p>
        <DitherButton
            class="paid-plan-select-dither"
            :color="active ? 'green' : 'blue'"
            :variant="active ? 'solid' : 'gradient'"
            bloom="low"
            data-sound="interaction.tap"
            @click="emit('select')"
        >
            {{ active ? "Selected" : `Compare ${plan.display_name}` }}
        </DitherButton>
    </article>
</template>
