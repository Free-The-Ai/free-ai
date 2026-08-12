<script lang="ts">
    import { accessPolicyData } from "@/entities/access-policy";

    const tiers = accessPolicyData.invite_tiers;
</script>

<div class="free-tier-table" role="table" aria-label="Free access invite tiers">
    <div class="free-tier-row free-tier-row-head" role="row">
        <span role="columnheader">Tier</span>
        <span role="columnheader">Invites</span>
        <span role="columnheader">Req / min</span>
        <span role="columnheader">Concurrent</span>
    </div>
    {#each tiers as tier (tier.level)}
        <div class="free-tier-row" class:free-tier-highlight={tier.level >= 4} role="row">
            <span role="cell" data-label="Tier" class="free-tier-level">Lv.{tier.level}</span>
            <span role="cell" data-label="Invites">{tier.minimum_invites === 0 ? "—" : `${tier.minimum_invites}+`}</span>
            <span role="cell" data-label="Requests / min" class="free-tier-rate">{tier.rate_limit_per_minute}</span>
            <span role="cell" data-label="Concurrent">{tier.concurrency_limit}</span>
        </div>
    {/each}
</div>
<p class="free-tier-note">Invite friends to level up. Each invite unlocks faster rates.</p>

<style>
.free-tier-table {
    display: grid;
    gap: 1px;
    background: var(--border);
    border-radius: var(--radius);
    overflow: hidden;
}
.free-tier-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1.2fr 1fr;
    gap: 8px;
    align-items: center;
    padding: 9px 14px;
    background: var(--surface);
    font-family: var(--font-mono);
    font-size: 0.74rem;
}
.free-tier-row-head {
    background: oklch(1 0 0 / 0.04);
    color: var(--dim);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 7px 14px;
}
.free-tier-level {
    font-weight: 600;
    color: var(--text);
}
.free-tier-rate {
    color: var(--accent-text);
}
.free-tier-highlight {
    background: oklch(1 0 0 / 0.025);
}
.free-tier-note {
    margin: 10px 0 0;
    font-family: var(--font-mono);
    font-size: 0.66rem;
    line-height: 1.6;
    color: var(--dim);
}
@media (max-width: 40em) {
    .free-tier-row {
        grid-template-columns: 1fr 1fr;
        padding: 8px 12px;
    }
}
</style>
