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
        "AnythingLLM": "",
        "Cherry Studio": "/client-icons/cherry.png",
        "TypingMind": "/client-icons/typingmind.ico",
        "BoltAI": "",
        "Page Assist": "/client-icons/pageassist.png",
        "Chatbox": "/client-icons/chatbox.ico",
        "Big-AGI": "/client-icons/bigagi.ico",
        "Zed IDE": "",
    };

    const FALLBACK_SVG: Record<string, string> = {
        "Zed IDE": `<path d="M6 7h12l-6 5 6 5H6l6-5z" fill="currentColor"/>`,
        "BoltAI": `<path d="M13 4L5 14h6l-2 6 8-10h-6z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    };

    const iconSrc = $derived(ICON_MAP[name] ?? "");
    const fallbackSvg = $derived(FALLBACK_SVG[name] ?? "");
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
{:else if fallbackSvg}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        class="client-icon"
        aria-hidden="true"
    >
        {@html fallbackSvg}
    </svg>
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
        border-radius: 0;
    }
</style>
