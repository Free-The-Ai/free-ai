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
    import { PaidPlanExplorer } from "@/features/paid-plan-explorer";
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
    <PaidPlanExplorer snapshot={paidPlanData} discordUrl={siteConfig.socials.discord} />
</main>

<style>
.pricing-main {
    gap: 28px;
    padding: 22px 0 64px;
}
</style>
