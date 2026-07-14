<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { CatalogState, PaidPlanSnapshot } from "@/entities/paid-plan";
import { PLAN_ORDER, fetchLiveCatalog, formatNumber, formatUnitCost, snapshotState } from "@/entities/paid-plan";
import PlanCard from "./PlanCard.vue";
import PaidModelTable from "./PaidModelTable.vue";
import { CtaButton, DitherGradient } from "@/shared/ui";

const props = defineProps<{ snapshot: PaidPlanSnapshot; discordUrl: string }>();

const initialCatalog = snapshotState(props.snapshot);
const catalog = ref<CatalogState>(initialCatalog);
const selectedPlan = ref(initialCatalog.plans[0]?.id ?? PLAN_ORDER[0]);

onMounted(async () => {
    try {
        catalog.value = await fetchLiveCatalog();
    } catch (error) {
        if (import.meta.env.DEV) console.warn("Paid catalog refresh failed.", error);
    }
});

const plans = computed(() =>
    [...catalog.value.plans].sort((a, b) => {
        const ai = PLAN_ORDER.indexOf(a.id);
        const bi = PLAN_ORDER.indexOf(b.id);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.display_name.localeCompare(b.display_name);
    }),
);

const selected = computed(() => plans.value.find((plan) => plan.id === selectedPlan.value) ?? plans.value[0]);
const selectedModelIds = computed(() => new Set(selected.value?.models ?? []));

const selectedModelCount = computed(() =>
    catalog.value.groups.reduce(
        (total, group) => total + group.models.filter((model) => (model.plans ?? []).includes(selectedPlan.value) || selectedModelIds.value.has(model.id)).length,
        0,
    ),
);

const selectedMinCost = computed(() => {
    const costs = catalog.value.groups.flatMap((group) =>
        group.models.filter((model) => (model.plans ?? []).includes(selectedPlan.value) || selectedModelIds.value.has(model.id)).map((model) => model.unit_cost),
    );
    return costs.length ? Math.min(...costs) : 0;
});
</script>

<template>
    <div class="paid-plan-explorer">
        <section class="paid-plan-chooser shell" aria-labelledby="paid-plan-title">
            <DitherGradient class="paid-plan-glow" from="orange" direction="up" :opacity="0.26" />
            <div class="paid-plan-chooser-copy">
                <span class="eyebrow">Paid plans</span>
                <h2 id="paid-plan-title">Pick the lane that matches how you use the API.</h2>
                <p v-if="plans.length > 1">
                    Available plans use request units. Pick the lane that matches your client, context size, and usage pattern.
                </p>
                <p v-else>{{ selected?.description ?? "Available paid plans use request units and refresh from the live paid API catalog." }}</p>
            </div>

            <div :class="['paid-plan-options', { 'is-single': plans.length === 1 }]">
                <PlanCard
                    v-for="plan in plans"
                    :key="plan.id"
                    :plan="plan"
                    :active="selectedPlan === plan.id"
                    :period="props.snapshot.plan?.period"
                    @select="selectedPlan = plan.id"
                />
            </div>
        </section>

        <section class="section shell pricing-section paid-selected-section">
            <div class="paid-selected-summary">
                <div>
                    <span class="eyebrow">Selected plan</span>
                    <h2>{{ selected?.display_name ?? "Paid plan" }}</h2>
                </div>
                <div class="paid-selected-metrics">
                    <span>
                        <strong>{{ formatNumber(selectedModelCount) }}</strong>
                        aliases
                    </span>
                    <span>
                        <strong>{{ selectedMinCost ? formatUnitCost(selectedMinCost) : "-" }}</strong>
                        starting units
                    </span>
                    <span>
                        <strong>{{ selected?.concurrency_limit ?? "-" }}</strong>
                        concurrent
                    </span>
                </div>
                <CtaButton :href="discordUrl" target="_blank" rel="noreferrer">Get a paid key</CtaButton>
            </div>

            <PaidModelTable :groups="catalog.groups" :active-plan="selectedPlan" />
        </section>
    </div>
</template>

<style>
/* Unscoped: styles cover this feature's own markup plus its PlanCard and
   PaidModelTable children, ported verbatim from the former pricing.astro
   global style block. */
.pricing-note {
    max-width: 56ch;
    margin: 0;
    color: var(--dim);
    font-size: 0.96rem;
    line-height: 1.55;
    text-wrap: pretty;
}

.pricing-plan-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
}

.pricing-plan-cta .cta-arrow {
    opacity: 0.65;
    font-size: 0.9rem;
}

.pricing-section {
    gap: clamp(22px, 3vw, 30px);
    padding: clamp(24px, 4vw, 38px);
}

.paid-plan-explorer {
    display: grid;
    gap: 28px;
}

.paid-plan-chooser {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(250px, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(20px, 3vw, 34px);
    padding: clamp(22px, 4vw, 38px);
}

.paid-plan-glow {
    z-index: 0;
}

.paid-plan-chooser-copy,
.paid-plan-options {
    position: relative;
    z-index: 1;
}

.paid-plan-chooser-copy {
    display: grid;
    align-content: start;
    gap: 14px;
}

.paid-plan-chooser-copy h2,
.paid-selected-summary h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(2rem, 4vw, 3.1rem);
    line-height: 1;
    letter-spacing: -0.045em;
}

.paid-plan-chooser-copy p,
.paid-selected-summary p {
    margin: 0;
    color: var(--muted);
    line-height: 1.65;
}

.paid-plan-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}

.paid-plan-options.is-single {
    grid-template-columns: minmax(0, min(100%, 520px));
    justify-content: center;
}

.paid-plan-option {
    position: relative;
    display: grid;
    gap: 14px;
    min-width: 0;
    padding: clamp(16px, 2.4vw, 22px);
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: oklch(0.145 0 90.1 / 0.42);
    box-shadow: var(--sk-inset-shadow);
    transition:
        border-color 180ms var(--ease-out-smooth),
        box-shadow 180ms var(--ease-out-smooth),
        transform 180ms var(--ease-out-smooth);
}

.paid-plan-option.is-active {
    border-color: oklch(0.659 0.192 40.1 / 0.72);
    box-shadow:
        var(--sk-raised-shadow),
        0 0 0 1px oklch(0.659 0.192 40.1 / 0.18),
        0 20px 50px oklch(0.659 0.192 40.1 / 0.08);
    transform: translateY(-2px);
}

.paid-plan-badge {
    position: absolute;
    top: -10px;
    right: 14px;
    padding: 4px 10px;
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: var(--accent-text-strong);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-shadow: var(--accent-text-glow);
}

.paid-plan-option-top,
.paid-selected-summary {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
}

.paid-plan-option-price {
    color: var(--accent-text-strong);
    font-family: var(--font-serif);
    font-size: 1.45rem;
    line-height: 1;
    letter-spacing: -0.05em;
    text-shadow: var(--accent-text-glow);
    white-space: nowrap;
}

.paid-plan-option-price small {
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.paid-plan-option h3 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.45rem, 2.4vw, 2rem);
    line-height: 1;
    letter-spacing: -0.035em;
}

.paid-plan-option p {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.55;
    text-wrap: pretty;
}

.paid-plan-stat-grid,
.paid-selected-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.paid-plan-stat-grid span,
.paid-plan-limit-strip span,
.paid-selected-metrics span {
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-inset-bg);
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    line-height: 1.2;
    text-transform: uppercase;
}

.paid-plan-stat-grid strong,
.paid-plan-limit-strip strong,
.paid-selected-metrics strong {
    color: var(--accent-text);
    font-size: 0.92rem;
    text-shadow: var(--accent-text-glow);
}

.paid-plan-limit-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
}

.paid-plan-option-note {
    padding-top: 2px;
}

.paid-plan-select {
    width: 100%;
    min-height: 42px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-shell-bg);
    color: var(--text);
    box-shadow: var(--sk-raised-shadow);
    font-family: var(--font-mono);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
        border-color 150ms var(--ease-out-smooth),
        background 150ms var(--ease-out-smooth),
        color 150ms var(--ease-out-smooth),
        text-shadow 150ms var(--ease-out-smooth),
        transform var(--press-dur) var(--ease-out-smooth);
}

.paid-plan-select:active {
    transform: scale(var(--press-scale));
}

.paid-plan-option.is-active .paid-plan-select {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--accent-text-strong);
    text-shadow: var(--accent-text-glow);
}

.paid-selected-section {
    position: relative;
}

.paid-selected-summary {
    flex-wrap: wrap;
    padding-bottom: 2px;
}

.paid-selected-summary > div:first-child {
    display: grid;
    gap: 9px;
    max-width: 560px;
}

.paid-selected-metrics {
    grid-template-columns: repeat(3, minmax(110px, 1fr));
    min-width: min(100%, 430px);
}

.paid-table-panel {
    display: grid;
    gap: 16px;
    min-width: 0;
}

.paid-model-table {
    display: grid;
    gap: 6px;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
}

.paid-model-table::-webkit-scrollbar {
    height: 6px;
}

.paid-model-table::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: var(--sk-border);
}

.paid-model-row {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 82px 98px 132px 136px 42px;
    gap: 12px;
    align-items: center;
    min-width: 900px;
    padding: 10px 12px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}

.paid-model-row-head {
    padding: 2px 12px 6px;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.paid-model-name {
    min-width: 0;
    display: grid;
    gap: 6px;
}

.paid-model-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.paid-model-row code {
    min-width: 0;
    overflow: hidden;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pricing-route-pill {
    width: fit-content;
    max-width: 100%;
    padding: 4px 7px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: oklch(1 0 0 / 0.035);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
}

.paid-model-plans {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-width: 0;
}

.paid-model-row strong {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 700;
    text-shadow: var(--accent-text-glow);
    white-space: nowrap;
}

.paid-model-empty {
    padding: 18px;
    border: 1px dashed var(--sk-border);
    border-radius: var(--radius-sm);
    color: var(--muted);
    font-size: 0.9rem;
}

.pricing-model-copy {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    min-height: 30px;
    padding: 0;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-inset-bg);
    color: var(--muted);
    box-shadow: var(--sk-inset-shadow);
    cursor: pointer;
    transition:
        border-color 150ms var(--ease-out-smooth),
        color 150ms var(--ease-out-smooth),
        transform var(--press-dur) var(--ease-out-smooth);
}

.pricing-model-copy:hover {
    color: var(--text);
    border-color: oklch(0.659 0.192 40.1 / 0.42);
}

.pricing-model-copy:active {
    transform: scale(var(--press-scale));
}

@media (max-width: 1120px) {
    .paid-plan-chooser {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .paid-model-table {
        gap: 10px;
        overflow-x: visible;
    }

    .paid-model-row {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        min-width: 0;
        padding: 14px;
        border-radius: var(--radius);
        background: var(--sk-inset-bg);
        box-shadow: var(--sk-inset-shadow);
    }

    .paid-model-row-head {
        display: none;
    }

    .paid-model-row > * {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .paid-model-row > *::before {
        content: attr(data-label);
        color: var(--dim);
        font-family: var(--font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .paid-model-row > :nth-child(1),
    .paid-model-row > :nth-child(6) {
        grid-column: 1 / -1;
    }

    .paid-model-row > :nth-child(6) {
        align-items: flex-end;
    }

    .paid-model-name {
        gap: 8px;
    }

    .paid-model-name code {
        font-size: 0.85rem;
    }
}

@media (max-width: 560px) {
    .paid-plan-options,
    .paid-plan-stat-grid,
    .paid-plan-limit-strip,
    .paid-selected-metrics {
        grid-template-columns: 1fr;
    }

    .paid-plan-chooser {
        padding: 18px;
    }

    .pricing-section {
        padding: 18px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .paid-plan-option,
    .paid-plan-option.is-active,
    .paid-plan-select,
    .paid-plan-select:active,
    .pricing-model-copy,
    .pricing-model-copy:active {
        transition: none;
        transform: none;
    }
}
</style>
