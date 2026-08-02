<script lang="ts">
    import { soundEnabled, soundPlay } from "@/shared/lib/sound/singleton";

    let {
        value = $bindable(""),
        label,
        labelHidden,
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
        /** Keep the label in the a11y tree but off-screen. For compact controls
         *  (search fields) where a visible label would not fit. Never rely on
         *  `placeholder` alone: it is not a label and it disappears on input. */
        labelHidden?: boolean;
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

    const autoId = $props.id();
    const fieldId = $derived(id ?? autoId);

    // Wire description/error to the control so assistive tech announces them.
    // Rendering them as adjacent <p> is not enough — without aria-describedby
    // they are visually associated and programmatically invisible.
    const describedBy = $derived(
        [description ? `${fieldId}-desc` : null, error ? `${fieldId}-err` : null]
            .filter(Boolean)
            .join(" ") || undefined,
    );

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
        <label class={["kb-text-field__label", labelHidden && "sr-only"]} for={fieldId}>{label}</label>
    {/if}
    {#if multiline}
        <textarea
            class="kb-text-field__textarea"
            {placeholder}
            {value}
            {disabled}
            {required}
            id={fieldId}
            data-invalid={error ? "" : undefined}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
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
            id={fieldId}
            {name}
            data-invalid={error ? "" : undefined}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            oninput={onInput}
        />
    {/if}
    {#if description}
        <p id="{fieldId}-desc" class="kb-text-field__description">{description}</p>
    {/if}
    {#if error}
        <p id="{fieldId}-err" class="kb-text-field__error">{error}</p>
    {/if}
</div>
