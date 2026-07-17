<script lang="ts">
    import { soundEnabled, soundPlay } from "@/shared/lib/sound/singleton";

    let {
        value = $bindable(""),
        label,
        description,
        error,
        multiline,
        sound = true,
        placeholder,
        name,
        disabled,
        required,
        id,
        class: className,
        oninput,
    }: {
        value?: string;
        label?: string;
        description?: string;
        error?: string;
        multiline?: boolean;
        sound?: boolean;
        placeholder?: string;
        name?: string;
        disabled?: boolean;
        required?: boolean;
        id?: string;
        class?: string;
        oninput?: (event: Event) => void;
    } = $props();

    const TYPING_THROTTLE_MS = 120;
    let lastTypingSound = 0;

    function onInput(event: Event): void {
        value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
        if (sound && soundEnabled()) {
            const now = Date.now();
            if (now - lastTypingSound >= TYPING_THROTTLE_MS) {
                lastTypingSound = now;
                soundPlay("interaction.typing");
            }
        }
        oninput?.(event);
    }
</script>

<div class={["kb-text-field", className]} data-invalid={error ? "" : undefined}>
    {#if label}
        <label class="kb-text-field__label">{label}</label>
    {/if}
    {#if multiline}
        <textarea
            class="kb-text-field__textarea"
            {placeholder}
            {value}
            {disabled}
            {required}
            {id}
            data-invalid={error ? "" : undefined}
            oninput={onInput}
        ></textarea>
    {:else}
        <input
            class="kb-text-field__input"
            type="text"
            {placeholder}
            {value}
            {disabled}
            {required}
            {id}
            {name}
            data-invalid={error ? "" : undefined}
            oninput={onInput}
        />
    {/if}
    {#if description}
        <p class="kb-text-field__description">{description}</p>
    {/if}
    {#if error}
        <p class="kb-text-field__error">{error}</p>
    {/if}
</div>
