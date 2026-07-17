// Dither chart family — Svelte port of tripwire.sh dither-kit's chart engine.
// Cartesian (area/line/bar) + polar (pie/radar), children-as-config API.

export { default as AreaChart } from "./AreaChart.svelte";
export { default as LineChart } from "./LineChart.svelte";
export { default as BarChart } from "./BarChart.svelte";
export { default as PieChart } from "./PieChart.svelte";
export { default as RadarChart } from "./RadarChart.svelte";
export { default as Sparkline } from "./Sparkline.svelte";

export { default as Area } from "./Area.svelte";
export { default as Line } from "./Line.svelte";
export { default as Bar } from "./Bar.svelte";
export { default as Pie } from "./Pie.svelte";
export { default as Radar } from "./Radar.svelte";

export { default as Grid } from "./Grid.svelte";
export { default as XAxis } from "./XAxis.svelte";
export { default as YAxis } from "./YAxis.svelte";
export { default as Dot } from "./Dot.svelte";
export { default as ActiveDot } from "./ActiveDot.svelte";
export { default as Legend } from "./Legend.svelte";
export { default as Tooltip } from "./Tooltip.svelte";

export type {
    AreaVariant,
    ChartConfig,
    Margins,
    StackType,
    StrokeVariant,
} from "@/shared/lib/dither/chart-types";
export type { BloomInput, BloomLevel } from "@/shared/lib/dither/dither-paint";
export type { DitherColor } from "@/shared/lib/dither/palette";
