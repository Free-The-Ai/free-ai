<script lang="ts">
    import { accessPolicyData } from "@/entities/access-policy";

    const tiers = accessPolicyData.invite_tiers;
</script>

<div class="free-tier-table" role="table" aria-label="Free access invite tiers">
    <div class="free-tier-row free-tier-row-head" role="row">
        <span role="columnheader">Tier</span>
        <span role="columnheader">Invites</span>
        <span role="columnheader">Requests / min</span>
        <span role="columnheader">Concurrent</span>
    </div>
    {#each tiers as tier (tier.level)}
        <div class="free-tier-row" role="row">
            <span role="cell" data-label="Tier">Level {tier.level}</span>
            <span role="cell" data-label="Invites">{tier.minimum_invites === 0 ? "None" : `${tier.minimum_invites}+`}</span>
            <span role="cell" data-label="Requests / min">{tier.rate_limit_per_minute}</span>
            <span role="cell" data-label="Concurrent">{tier.concurrency_limit}</span>
        </div>
    {/each}
</div>

<style>
.free-tier-table {
    display: grid;
    gap: 2px;
}
.free-tier-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.3fr 1fr;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
}
.free-tier-row-head {
    background: transparent;
    border-color: transparent;
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
@media (max-width: 40em) {
    .free-tier-row {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
