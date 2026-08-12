<script lang="ts">
    import { buildSeo } from "@/shared/lib/seo";
    import { siteConfig } from "@/shared/config/site";
    import {
        buildBreadcrumbJsonLd,
        buildMachineReadableResourcesJsonLd,
        buildOrganizationJsonLd,
        buildPaidPlanJsonLd,
        buildSoftwareJsonLd,
        buildWebsiteJsonLd,
        buildWebApiJsonLd,
    } from "@/shared/lib/jsonLd";
    import { PaidPlanExplorer, FreeTierTable } from "@/features/paid-plan-explorer";
    import { paidPlanData } from "@/entities/paid-plan";
    import { SeoHead } from "@/shared/ui";
    const comparisonRows: [string, string, string][] = [
        ["Models", "80+ (general AI catalog)", "40 (roleplay catalog)"],
        ["Rate limit", "10–35 req/min (by invite tier)", "Request-unit pricing"],
        ["Concurrency", "1–3 connections", "2 connections"],
        ["Daily check-in", "Required", "Not required"],
        ["Streaming", "Included", "Included"],
        ["Tool calling", "Included", "Included"],
        ["OpenAI format", "Chat + Responses + Anthropic", "Chat + Responses + Anthropic"],
        ["Support", "Discord community", "Discord + priority response"],
    ];
    const paidPlan = paidPlanData as unknown as {
        plan: { price: string; period: string; summary: string };
        plans: Record<string, unknown>[];
        model_groups: { models: unknown[] }[];
        updated_at?: string;
    };

    const seo = buildSeo({
        title: "FreeTheAi Paid API Plans - Request-Unit Pricing",
        description: "Compare currently available FreeTheAi paid API plans, request-unit limits, live model counts, context windows, and current paid model aliases.",
        keywords: "FreeTheAi paid API, paid AI API pricing, OpenAI compatible paid API, roleplay AI API plan, request unit pricing, paid model catalog",
        path: "/pricing",
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            buildMachineReadableResourcesJsonLd({
                paidModelCount: paidPlan.model_groups.reduce((total, group) => total + group.models.length, 0),
                paidUpdatedAt: paidPlan.updated_at,
            }),
            buildPaidPlanJsonLd(paidPlan.plan, paidPlan.plans as Parameters<typeof buildPaidPlanJsonLd>[1]),
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: "Pricing", url: "https://freetheai.xyz/pricing" },
            ]),
        ],
    });
</script>

<SeoHead {seo} />

<main class="pricing-main" jp-dense>
    <section class="pricing-free shell" aria-labelledby="free-access-title">
        <span class="eyebrow">Free access</span>
        <h2 id="free-access-title">Every free key, at a glance.</h2>
        <p>
            One Discord key, one base URL, zero billing. Keep your key hot with a daily <code>/checkin</code>; invite friends
            to raise your rate limit. Fair-use invites unlock more headroom for everyone.
        </p>
        <FreeTierTable />
        <p class="pricing-free-note">
            Need more concurrency or a guaranteed lane? Paid slots below — or read the
            <a href="/access-policy.json">machine-readable access policy</a>.
        </p>
    </section>
Fbe
    <section class="pricing-compare shell" aria-labelledby="compare-title">
        <span class="eyebrow">Compare</span>
        <h2 id="compare-title">Free vs. Paid — at a glance.</h2>
        <div class="pricing-compare-table" role="table" aria-label="Free vs paid feature comparison">
            <div class="pricing-compare-row pricing-compare-row-head" role="row">
                <span role="columnheader"></span>
                <span role="columnheader">Free</span>
                <span role="columnheader">Paid ($5/mo)</span>
            </div>
            {#each comparisonRows as [feature, free, paid] (feature)}
                <div class="pricing-compare-row" role="row">
                    <span role="cell" class="pricing-compare-feature">{feature}</span>
                    <span role="cell" data-label="Free">{free}</span>
                    <span role="cell" data-label="Paid">{paid}</span>
                </div>
            {/each}
        </div>
        <p class="pricing-compare-note">
            The free tier covers the full general AI catalog. Paid slots unlock the dedicated roleplay model set
            with request-unit billing and no daily check-in.
        </p>
    </section>

    <PaidPlanExplorer snapshot={paidPlanData} discordUrl={siteConfig.socials.discord} />
</main>

<style>
.pricing-main {
    gap: 28px;
    padding: 22px 0 64px;
}

.pricing-free {
    display: grid;
    gap: 14px;
    padding: clamp(22px, 4vw, 38px);
    align-content: start;
}

.pricing-free h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 3.4vw, 2.6rem);
    line-height: 1;
    letter-spacing: -0.04em;
}

.pricing-free p {
    margin: 0;
    max-width: 68ch;
    color: var(--dim);
    font-size: 0.96rem;
    line-height: 1.6;
    text-wrap: pretty;
}

.pricing-free-note a {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
}

.pricing-compare {
    display: grid;
    gap: 16px;
    padding: clamp(22px, 4vw, 38px);
    align-content: start;
}

.pricing-compare h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 3.4vw, 2.6rem);
    line-height: 1;
    letter-spacing: -0.04em;
}

.pricing-compare-table {
    display: grid;
    gap: 2px;
}

.pricing-compare-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
}

.pricing-compare-row-head {
    background: transparent;
    border-color: transparent;
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.pricing-compare-feature {
    font-weight: 500;
    color: var(--text);
}

.pricing-compare-note {
    margin: 0;
    max-width: 68ch;
    color: var(--dim);
    font-size: 0.92rem;
    line-height: 1.55;
    text-wrap: pretty;
}

@media (max-width: 40em) {
    .pricing-compare-row {
        grid-template-columns: 1fr 1fr;
    }
    .pricing-compare-feature {
        grid-column: 1 / -1;
        font-size: 0.82rem;
        color: var(--dim);
    }
}
</style>
