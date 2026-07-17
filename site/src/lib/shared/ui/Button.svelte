<script lang="ts">
    import type { Snippet } from "svelte";
    import { soundPlay } from "@/shared/lib/sound/singleton";
    import type { SoundRole } from "@/shared/lib/sound/types";

    let {
        variant = "ghost",
        size = "md",
        sound,
        volume,
        disabled,
        type = "button",
        onclick,
        class: className,
        children,
    }: {
        variant?: "primary" | "ghost" | "danger";
        size?: "sm" | "md" | "lg";
        sound?: SoundRole | false;
        volume?: number;
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
        onclick?: (event: MouseEvent) => void;
        class?: string;
        children?: Snippet;
    } = $props();

    function handleClick(event: MouseEvent): void {
        if (sound !== false) soundPlay(sound ?? "interaction.tap", { volume });
        onclick?.(event);
    }
</script>

<button
    class={["kb-button", className]}
    {type}
    data-variant={variant}
    data-size={size === "md" ? undefined : size}
    {disabled}
    onclick={handleClick}
>
    {@render children?.()}
</button>
