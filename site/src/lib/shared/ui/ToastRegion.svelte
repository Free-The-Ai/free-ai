<script lang="ts">
    import { onMount } from "svelte";
    import { closeToast, initToastManager, toasts } from "@/shared/lib/toast";
    import { portal } from "@/shared/lib/portal";

    const TOAST_ICONS: Record<string, string> = {
        success: "\u2713",
        error: "\u2717",
        info: "i",
        warning: "!",
    };

    onMount(initToastManager);
</script>

<div use:portal={"body"}>
    <ol class="kb-toast__list" aria-live="polite" aria-atomic="false">
        {#each $toasts as toast (toast.id)}
            <li class={`kb-toast kb-toast--${toast.type}`} data-opened={toast.closing ? undefined : ""} data-closed={toast.closing ? "" : undefined}>
                <div class="kb-toast__content">
                    <div class="kb-toast__icon">{TOAST_ICONS[toast.type] ?? "i"}</div>
                    <div class="kb-toast__body">
                        {#if toast.title}
                            <p class="kb-toast__title">{toast.title}</p>
                        {/if}
                        {#if toast.description}
                            <p class="kb-toast__description">{toast.description}</p>
                        {/if}
                    </div>
                    <button class="kb-toast__close" type="button" aria-label="Dismiss" onclick={() => closeToast(toast.id)}>
                        &#215;
                    </button>
                </div>
            </li>
        {/each}
    </ol>
</div>
