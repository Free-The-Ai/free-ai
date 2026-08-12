<script lang="ts">
    import { buildSeo } from "@/shared/lib/seo";
    import { DitherGradient, SeoHead } from "@/shared/ui";
    import {
        buildBreadcrumbJsonLd,
        buildMachineReadableResourcesJsonLd,
        buildOrganizationJsonLd,
        buildSoftwareJsonLd,
        buildWebsiteJsonLd,
        buildWebApiJsonLd,
    } from "@/shared/lib/jsonLd";
    import TermsContent from "./TermsContent.svelte";

    const pageTitle = "Terms of Service | FreeTheAi";
    const pageDescription =
        "FreeTheAi Terms of Service covering service description, acceptable use, data protection, intellectual property, liability limitations, dispute resolution, and worldwide legal compliance.";

    const seo = buildSeo({
        title: pageTitle,
        description: pageDescription,
        path: "/terms",
        keywords: "FreeTheAi terms, FreeTheAi terms of service, free ai api terms, api acceptable use, data protection, GDPR, CCPA",
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            buildMachineReadableResourcesJsonLd(),
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "FreeTheAi Terms of Service",
                url: "https://freetheai.xyz/terms",
                description: pageDescription,
                isPartOf: { "@id": "https://freetheai.xyz/#website" },
            },
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: "Terms of Service", url: "https://freetheai.xyz/terms" },
            ]),
        ],
    });
</script>

<SeoHead {seo} />

<main class="jp-dense">

    <TermsContent />

</main>
