<script lang="ts">
    import { soundPlay } from "@/shared/lib/sound/singleton";
    import type { SoundRole } from "@/shared/lib/sound/types";
    import ChevronDownIcon from "./icons/ChevronDownIcon.svelte";

    export interface SelectOption {
        value: string;
        label: string;
        disabled?: boolean;
    }

    let {
        label,
        placeholder = "Select...",
        options,
        value = $bindable(""),
        className,
        disabled,
        name,
        sound,
        volume,
    }: {
        label?: string;
        placeholder?: string;
        options: SelectOption[];
        value?: string;
        className?: string;
        disabled?: boolean;
        name?: string;
        sound?: SoundRole | false;
        volume?: number;
    } = $props();

    function onChange(event: Event): void {
        const next = (event.target as HTMLSelectElement).value;
        if (sound !== false) soundPlay(sound ?? "interaction.subtle", { volume });
        value = next;
    }

    const currentLabel = $derived(options.find((o) => o.value === value)?.label ?? placeholder);
</script>

<label class={["kb-select__trigger", "kb-native-select", className]}>
    <span class="kb-select__trigger-label">
        {#if label}
            <span class="kb-select__label-text">{label}</span>
        {/if}
        <span class="kb-select__value-text">
            {currentLabel}
        </span>
    </span>
    <ChevronDownIcon class="kb-select__icon" />
    <select class="kb-native-select__control" {value} {disabled} {name} onchange={onChange}>
        {#each options as option (option.value)}
            <option value={option.value} disabled={option.disabled}>
                {option.label}
            </option>
        {/each}
    </select>
</label>

<style>
    /* Native <select> laid over the existing kb-select__trigger visual shell:
       real OS picker for accessibility, zero extra popup/positioning JS. */
    .kb-native-select {
        position: relative;
        cursor: pointer;
    }

    .kb-native-select__control {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        appearance: none;
        border: none;
        background: transparent;
    }

    .kb-native-select:focus-within {
        outline: 2px solid var(--amber);
        outline-offset: 2px;
    }
</style>
