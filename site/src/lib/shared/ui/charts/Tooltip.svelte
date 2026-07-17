<script lang="ts">
    import { fade } from "svelte/transition";
    import { useCommonChart } from "@/shared/lib/dither/chart-context";
    import { rgb } from "@/shared/lib/dither/palette";
    import { styleToCss } from "@/shared/lib/dom";

    let {
        labelKey,
        valueFormatter,
        variant = "default",
    }: {
        labelKey?: string;
        valueFormatter?: (value: number, name: string) => string;
        variant?: "default" | "frosted-glass";
    } = $props();

    const chart = useCommonChart();
    const show = $derived(chart.ready && chart.hoverIndex != null);
    const index = $derived(chart.hoverIndex ?? 0);
    const heading = $derived(chart.heading(index, labelKey));
    const items = $derived(chart.itemsAt(index));

    // Position glides via CSS transitions on top/left (declared in charts.css).
    const posStyle = $derived(
        styleToCss({
            top: `${chart.tooltipTop}px`,
            left: `${chart.tooltipLeft}px`,
            backdropFilter: variant === "frosted-glass" ? "blur(4px)" : undefined,
        }),
    );

    function formatValue(value: number, name: string): string {
        return valueFormatter ? valueFormatter(value, name) : value.toLocaleString();
    }
</script>

{#if show && items.length}
    <div class="dk-dom dk-tooltip" style={posStyle} transition:fade={{ duration: 160 }}>
        {#if heading}
            <div class="dk-tooltip-heading">{heading}</div>
        {/if}
        <div class="dk-tooltip-rows">
            {#each items as item (item.name)}
                <div class="dk-tooltip-row" style={styleToCss({ opacity: item.dimmed ? 0.4 : 1 })}>
                    <span class="dk-swatch" style={`background-color: ${rgb(item.seed.fill)}`}></span>
                    <span class="dk-tooltip-label">{item.label}</span>
                    <span class="dk-tooltip-value">{formatValue(item.value, item.name)}</span>
                </div>
            {/each}
        </div>
    </div>
{/if}
