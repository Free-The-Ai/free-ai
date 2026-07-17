<script lang="ts">
    import { onDestroy } from "svelte";
    import { usePolarPart } from "@/shared/lib/dither/chart-context";
    import type { AreaVariant } from "@/shared/lib/dither/chart-types";
    import { watchDeps } from "@/shared/lib/watchDeps";

    let { variant = "gradient" }: { variant?: AreaVariant } = $props();

    const ctx = usePolarPart("Pie", "pie");
    const syncVariant = watchDeps(() => {
        ctx.registerVariant("*", variant);
    });
    onDestroy(() => ctx.unregisterVariant("*"));
</script>

<span hidden use:syncVariant={[variant]}></span>
