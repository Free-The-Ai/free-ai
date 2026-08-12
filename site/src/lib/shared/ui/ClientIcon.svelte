<script lang="ts">
    let { name, size = 32 }: { name: string; size?: number } = $props();

    const ICON_MAP: Record<string, string> = {
        "OpenCode": "/client-icons/opencode.svg",
        "Kilo Code": "/client-icons/kilo.svg",
        "SillyTavern": "/client-icons/sillytavern.png",
        "Janitor AI": "/client-icons/janitor.png",
        "Chub AI": "/client-icons/chub.png",
        "RisuAI": "/client-icons/risu.png",
        "Cline": "/client-icons/cline.png",
        "Roo Code": "/client-icons/roocode.png",
        "Continue.dev": "/client-icons/continue.png",
        "Aider": "/client-icons/aider.png",
        "Claude Code": "/client-icons/claude.svg",
        "LibreChat": "/client-icons/librechat.svg",
        "Open WebUI": "/client-icons/openwebui.svg",
        "LobeChat": "/client-icons/lobechat.png",
        "AnythingLLM": "/client-icons/anythingllm.png",
        "Cherry Studio": "/client-icons/cherry.png",
        "TypingMind": "/client-icons/typingmind.ico",
        "BoltAI": "/client-icons/boltai.png",
        "Page Assist": "/client-icons/pageassist.png",
        "Chatbox": "/client-icons/chatbox.ico",
        "Big-AGI": "/client-icons/bigagi.ico",
        "Zed IDE": "/client-icons/zed.png",
    };

    const iconSrc = $derived(ICON_MAP[name] ?? "");
</script>

{#if iconSrc}
    <img
        src={iconSrc}
        alt="{name} icon"
        width={size}
        height={size}
        class="client-icon"
        aria-hidden="true"
    />
{:else}
    <span
        class="client-icon client-icon--fallback"
        style="width:{size}px;height:{size}px;font-size:{Math.round(size * 0.35)}px"
        aria-hidden="true"
    >
        {name.slice(0, 2)}
    </span>
{/if}

<style>
    .client-icon {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 0;
        object-fit: contain;
        flex-shrink: 0;
    }
    .client-icon--fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-3, #2a2a2e);
        color: var(--text-2, #999);
        font-weight: 700;
        font-family: var(--font-mono, monospace);
    }
</style>
