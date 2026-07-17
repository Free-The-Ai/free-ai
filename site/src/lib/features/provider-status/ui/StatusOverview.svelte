<script lang="ts">
    import type { ProviderHealth } from "@/entities/provider";
    import type { ChartConfig } from "@/shared/ui/charts";
    import { Bar, BarChart, Grid, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "@/shared/ui/charts";

    let { providers }: { providers: ProviderHealth[] } = $props();

    // Models per provider — real model_count snapshot, top 10 by catalog size.
    const barData = $derived(
        [...providers]
            .filter((p) => p.model_count > 0)
            .sort((a, b) => b.model_count - a.model_count)
            .slice(0, 10)
            .map((p) => ({ prefix: p.prefix, models: p.model_count })),
    );
    const barConfig: ChartConfig = { models: { label: "Models", color: "blue" } };

    // Status split — real up/degraded/down counts; zero buckets are dropped.
    const statusData = $derived.by(() => {
        const counts = { up: 0, degraded: 0, down: 0 };
        for (const p of providers) {
            if (p.status === "up") counts.up++;
            else if (p.status === "degraded") counts.degraded++;
            else if (p.status === "down") counts.down++;
        }
        return (["up", "degraded", "down"] as const)
            .filter((k) => counts[k] > 0)
            .map((k) => ({ name: k, value: counts[k] }));
    });
    const statusConfig: ChartConfig = {
        up: { label: "Up", color: "green" },
        degraded: { label: "Degraded", color: "orange" },
        down: { label: "Down", color: "red" },
    };
</script>

<section class="status-overview" aria-label="Health overview">
    <article class="shell overview-card">
        <h3 class="overview-title">Models by provider</h3>
        <div class="overview-chart">
            <BarChart data={barData} config={barConfig} bloom="low">
                <Grid />
                <XAxis dataKey="prefix" />
                <YAxis />
                <Bar dataKey="models" variant="gradient" />
                <Tooltip labelKey="prefix" />
            </BarChart>
        </div>
    </article>

    <article class="shell overview-card">
        <h3 class="overview-title">Provider status</h3>
        <div class="overview-chart">
            <PieChart
                data={statusData}
                config={statusConfig}
                dataKey="value"
                nameKey="name"
                innerRadius={0.55}
                bloom="low"
            >
                <Pie variant="gradient" />
                <Legend align="center" />
                <Tooltip />
            </PieChart>
        </div>
    </article>
</section>

<style>
.status-overview {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}
.overview-card {
    display: grid;
    gap: 10px;
    padding: 16px 16px 12px;
    border-radius: var(--radius);
}
.overview-title {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
}
.overview-chart {
    position: relative;
    height: 220px;
    width: 100%;
}
@media (max-width: 640px) {
    .status-overview {
        grid-template-columns: 1fr;
    }
    .overview-chart {
        height: 190px;
    }
}
</style>
