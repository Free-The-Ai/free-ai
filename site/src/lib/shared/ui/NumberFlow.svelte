<script lang="ts">
    // Port of the Skiper UI number-flow effect (skiper37/69 mechanic): every
    // digit is a column of 0-9 in a 1em-high clipped box, and changing the
    // value translates each column to its new digit. Non-digit characters
    // (commas, placeholders) render statically. No dependencies.
    let { value }: { value: string } = $props();

    const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chars = $derived(value.split(""));
    const isDigit = (c: string) => c >= "0" && c <= "9";
</script>

<span class="numflow">
    {#each chars as ch, i (i)}
        {#if isDigit(ch)}
            <span class="numflow-digit" aria-hidden="true">
                <span class="numflow-col" style:transform="translateY(-{ch}em)" style:transition-delay="{i * 30}ms">
                    {#each DIGITS as d (d)}
                        <span class="numflow-cell">{d}</span>
                    {/each}
                </span>
            </span>
        {:else}
            <span class="numflow-static" aria-hidden="true">{ch}</span>
        {/if}
    {/each}
    <span class="sr-only">{value}</span>
</span>

<style>
    .numflow {
        display: inline-flex;
        overflow: hidden;
    }
    .numflow-digit {
        display: inline-block;
        height: 1em;
        overflow: hidden;
    }
    .numflow-col {
        display: flex;
        flex-direction: column;
        transition: transform 650ms var(--ease-out-smooth, cubic-bezier(0.16, 1, 0.3, 1));
        will-change: transform;
    }
    .numflow-cell {
        display: block;
        height: 1em;
        line-height: 1;
    }
    .numflow-static {
        display: inline-block;
    }
    @media (prefers-reduced-motion: reduce) {
        .numflow-col {
            transition: none;
        }
    }
</style>
