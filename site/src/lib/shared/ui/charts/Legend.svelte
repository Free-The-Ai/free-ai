<script lang="ts">
    import { useCommonChart } from "@/shared/lib/dither/chart-context";
    import { rgb } from "@/shared/lib/dither/palette";

    let { isClickable = false, align = "right" }: { isClickable?: boolean; align?: "left" | "center" | "right" } = $props();

    const chart = useCommonChart();
    const entries = $derived(
        chart.names.map((name) => {
            const emphasis = chart.selectedDataKey ?? chart.focusDataKey;
            return {
                name,
                label: chart.labelOf(name),
                swatch: rgb(chart.seedOf(name).fill),
                dimmed: emphasis !== null && emphasis !== name,
            };
        }),
    );
</script>

<div class={["dk-dom", "dk-legend", `dk-legend--${align}`]}>
    {#each entries as e (e.name)}
        <button
            type="button"
            disabled={!isClickable}
            class={["dk-legend-item", { "dk-legend-item--clickable": isClickable, "dk-legend-item--dimmed": e.dimmed }]}
            onclick={() => chart.selectDataKey(chart.selectedDataKey === e.name ? null : e.name)}
            onpointerenter={() => chart.setFocusDataKey(e.name)}
            onpointerleave={() => chart.setFocusDataKey(null)}
            onfocus={() => chart.setFocusDataKey(e.name)}
            onblur={() => chart.setFocusDataKey(null)}
        >
            <span class="dk-swatch" style={`background-color: ${e.swatch}`}></span>
            {e.label}
        </button>
    {/each}
</div>
