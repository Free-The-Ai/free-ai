<script lang="ts">
    import type { PaidPlan } from "@/entities/paid-plan";
    import { PLAN_COPY, formatNumber, formatPlanPrice, limitEntries, planPeriod, LIMIT_LABELS } from "@/entities/paid-plan";
    import { DitherButton } from "@/shared/ui";

    let { plan, active, period, onselect }: { plan: PaidPlan; active: boolean; period?: string; onselect?: () => void } = $props();

    const copy = $derived(
        PLAN_COPY[plan.id] ?? {
            tag: "Paid plan",
            bestFor: plan.description ?? "Paid API access.",
            accent: "Request-unit pricing with a dedicated paid model catalog.",
        },
    );
    const resolvedPeriod = $derived(planPeriod(plan, period));
    const limits = $derived(limitEntries(plan).slice(0, 3));
</script>

<article class={["paid-plan-option", { "is-active": active }]}>
    {#if active}<span class="paid-plan-badge">Recommended</span>{/if}
    <div class="paid-plan-option-top">
        <span class="pricing-route-pill">{copy.tag}</span>
        <span class="paid-plan-option-price">
            {formatPlanPrice(plan)}
            <small>{resolvedPeriod ? ` / ${resolvedPeriod}` : ""}</small>
        </span>
    </div>
    <h3>{plan.display_name}</h3>
    <p>{copy.bestFor}</p>
    <div class="paid-plan-stat-grid">
        <span>
            <strong>{formatNumber(plan.model_count ?? plan.models?.length ?? 0)}</strong>
            models
        </span>
        <span>
            <strong>{plan.concurrency_limit ?? "-"}</strong>
            concurrent
        </span>
    </div>
    <div class="paid-plan-limit-strip">
        {#each limits as entry (entry.key)}
            <span>
                <strong>{formatNumber(entry.value.limit ?? 0)}</strong>
                {LIMIT_LABELS[entry.key] ?? entry.key}
            </span>
        {/each}
    </div>
    <p class="paid-plan-option-note">{copy.accent}</p>
    <DitherButton
        class="paid-plan-select-dither"
        color={active ? "green" : "blue"}
        variant={active ? "solid" : "gradient"}
        bloom="low"
        data-sound="interaction.tap"
        onclick={() => onselect?.()}
    >
        {active ? "Selected" : `Compare ${plan.display_name}`}
    </DitherButton>
</article>

<style>
.paid-plan-select-dither {
    width: 100%;
    min-height: 42px;
    margin-top: auto;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
</style>
