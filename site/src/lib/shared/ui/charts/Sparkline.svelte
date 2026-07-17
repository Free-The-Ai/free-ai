<script lang="ts">
    import AreaChart from "./AreaChart.svelte";
    import Area from "./Area.svelte";
    import type { AreaVariant } from "@/shared/lib/dither/chart-types";
    import type { BloomInput } from "@/shared/lib/dither/dither-paint";
    import type { DitherColor } from "@/shared/lib/dither/palette";

    let {
        data,
        color,
        variant = "gradient",
        markerIndex = null,
        hovered = false,
        bloom = "off",
        bloomOnHover = false,
        animate = false,
    }: {
        data: number[];
        color: DitherColor;
        variant?: AreaVariant;
        markerIndex?: number | null;
        hovered?: boolean;
        bloom?: BloomInput;
        bloomOnHover?: boolean;
        animate?: boolean;
    } = $props();

    const rows = $derived(data.map((v) => ({ v })));
    const config = $derived({ v: { color } });
    const zeroMargins = { top: 0, right: 0, bottom: 0, left: 0 };
</script>

<AreaChart
    data={rows}
    {config}
    interactive={false}
    {animate}
    {markerIndex}
    {hovered}
    {bloom}
    {bloomOnHover}
    margins={zeroMargins}
>
    <Area dataKey="v" {variant} />
</AreaChart>
