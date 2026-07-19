<script lang="ts">
    import { onDestroy } from "svelte";
    import { usePolarPart } from "@/shared/lib/dither/chart-context";
    import type { AreaVariant } from "@/shared/lib/dither/chart-types";
    import { watchDeps } from "@/shared/lib/watchDeps";

    let { dataKey, variant = "gradient" }: { dataKey: string; variant?: AreaVariant } = $props();

    const ctx = usePolarPart("Radar", "radar");

    // svelte-ignore state_referenced_locally
    if (import.meta.env.DEV && !ctx.config[dataKey]) {
        console.warn(
            `<Radar dataKey="${dataKey}">: "${dataKey}" is not in the chart \`config\`. Add it so the series has a colour and label.`,
        );
    }

    const syncVariant = watchDeps(() => {
        ctx.registerVariant(dataKey, variant);
    });
    onDestroy(() => ctx.unregisterVariant(dataKey));
</script>

<span hidden use:syncVariant={[dataKey, variant]}></span>
