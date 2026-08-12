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

<main class="pricing-main">
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
</style>
