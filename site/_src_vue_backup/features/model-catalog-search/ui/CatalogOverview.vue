<script setup lang="ts">
import { computed } from "vue";
import type { Model } from "@/entities/model";
import { modelSupportsAudio, modelSupportsImage } from "@/entities/model";
import type { ChartConfig } from "@/shared/ui/charts";
import { Bar, BarChart, Grid, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "@/shared/ui/charts";

const props = defineProps<{ models: Model[] }>();

// Models per provider prefix — real catalog counts, top 10 by size.
const providerData = computed(() => {
    const counts = new Map<string, number>();
    for (const m of props.models) counts.set(m.prefix, (counts.get(m.prefix) ?? 0) + 1);
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([prefix, models]) => ({ prefix, models }));
});
const providerConfig: ChartConfig = { models: { label: "Models", color: "blue" } };

// Capability split — every model lands in exactly one bucket (audio > image > chat).
const capabilityData = computed(() => {
    const counts = { chat: 0, image: 0, audio: 0 };
    for (const m of props.models) {
        if (modelSupportsAudio(m)) counts.audio++;
        else if (modelSupportsImage(m)) counts.image++;
        else counts.chat++;
    }
    return (["chat", "image", "audio"] as const)
        .filter((k) => counts[k] > 0)
        .map((k) => ({ name: k, value: counts[k] }));
});
const capabilityConfig: ChartConfig = {
    chat: { label: "Chat", color: "blue" },
    image: { label: "Image", color: "purple" },
    audio: { label: "Audio", color: "green" },
};
</script>

<template>
    <section v-if="models.length > 0" class="catalog-overview" aria-label="Catalog overview">
        <article class="shell catalog-overview-card">
            <h3 class="catalog-overview-title">Models by provider</h3>
            <div class="catalog-overview-chart">
                <BarChart :data="providerData" :config="providerConfig" bloom="low">
                    <Grid />
                    <XAxis data-key="prefix" />
                    <YAxis />
                    <Bar data-key="models" variant="gradient" />
                    <Tooltip label-key="prefix" />
                </BarChart>
            </div>
        </article>

        <article class="shell catalog-overview-card">
            <h3 class="catalog-overview-title">By capability</h3>
            <div class="catalog-overview-chart">
                <PieChart
                    :data="capabilityData"
                    :config="capabilityConfig"
                    data-key="value"
                    name-key="name"
                    :inner-radius="0.55"
                    bloom="low"
                >
                    <Pie variant="gradient" />
                    <Legend align="center" />
                    <Tooltip />
                </PieChart>
            </div>
        </article>
    </section>
</template>

<style scoped>
.catalog-overview {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}
.catalog-overview-card {
    display: grid;
    gap: 10px;
    padding: 16px 16px 12px;
    border-radius: var(--radius);
}
.catalog-overview-title {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
}
.catalog-overview-chart {
    position: relative;
    height: 220px;
    width: 100%;
}
@media (max-width: 640px) {
    .catalog-overview {
        grid-template-columns: 1fr;
    }
    .catalog-overview-chart {
        height: 190px;
    }
}
</style>
