<script lang="ts">
    // Port of Skiper UI's ProgressiveBlur (skiper41): a fixed top strip with a
    // background gradient plus a masked backdrop blur, so content scrolling
    // under the sticky nav fades out softly instead of hitting a hard edge.
    // The blur itself is progressive via mask-image. Decorative; the nav pill
    // stacks above it.
    let { height = 110, blur = 6 }: { height?: number; blur?: number } = $props();
</script>

<div
    class="progressive-blur"
    aria-hidden="true"
    style:height="{height}px"
    style:--progressive-blur-amount="blur({blur}px)">
</div>

<style>
    .progressive-blur {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 20;
        pointer-events: none;
        background: linear-gradient(to bottom, var(--bg), transparent);
        backdrop-filter: var(--progressive-blur-amount, blur(6px));
        -webkit-backdrop-filter: var(--progressive-blur-amount, blur(6px));
        mask-image: linear-gradient(to bottom, black 30%, transparent);
        -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent);
    }
    @media (max-width: 820px) {
        .progressive-blur {
            display: none;
        }
    }
</style>
