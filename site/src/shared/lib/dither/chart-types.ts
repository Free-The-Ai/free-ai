// Shared chart type surface for the dither chart engine. Extracted so the pure
// paint/scale modules don't depend on the reactive controllers (which would be
// a cycle). Ported from tripwire.sh dither-kit's chart-context types.

import type { DitherColor, Seed } from "./palette";

export type AreaVariant = "gradient" | "dotted" | "hatched" | "solid";
export type StrokeVariant = "solid" | "dashed";
export type SeriesKind = "area" | "line" | "bar";
export type StackType = "default" | "stacked" | "percent";
export type ChartType = "area" | "bar" | "line" | "pie" | "radar";

export type ChartConfig = Record<string, { label?: string; color: DitherColor }>;

export type Margins = { top: number; right: number; bottom: number; left: number };

export type Dimensions = { width: number; height: number };

/** What each series part (<Area>, <Line>, <Bar>) registers so the canvas knows
 * which series to paint and how. */
export type SeriesSpec = {
    dataKey: string;
    kind: SeriesKind;
    variant: AreaVariant;
    strokeVariant: StrokeVariant;
};

/** A single tooltip row - one series (cartesian/radar) or one slice (pie). */
export type TooltipItem = {
    name: string;
    label: string;
    value: number;
    seed: Seed;
    dimmed: boolean;
};
