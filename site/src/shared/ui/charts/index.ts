// Dither chart family — Vue port of tripwire.sh dither-kit's chart engine.
// Cartesian (area/line/bar) + polar (pie/radar), children-as-config API.

export { default as AreaChart } from "./AreaChart.vue";
export { default as LineChart } from "./LineChart.vue";
export { default as BarChart } from "./BarChart.vue";
export { default as PieChart } from "./PieChart.vue";
export { default as RadarChart } from "./RadarChart.vue";
export { default as Sparkline } from "./Sparkline.vue";

export { default as Area } from "./Area.vue";
export { default as Line } from "./Line.vue";
export { default as Bar } from "./Bar.vue";
export { default as Pie } from "./Pie.vue";
export { default as Radar } from "./Radar.vue";

export { default as Grid } from "./Grid.vue";
export { default as XAxis } from "./XAxis.vue";
export { default as YAxis } from "./YAxis.vue";
export { default as Dot } from "./Dot.vue";
export { default as ActiveDot } from "./ActiveDot.vue";
export { default as Legend } from "./Legend.vue";
export { default as Tooltip } from "./Tooltip.vue";

export type {
    AreaVariant,
    ChartConfig,
    Margins,
    StackType,
    StrokeVariant,
} from "@/shared/lib/dither/chart-types";
export type { BloomInput, BloomLevel } from "@/shared/lib/dither/dither-paint";
export type { DitherColor } from "@/shared/lib/dither/palette";
