<script lang="ts">
    let { name, size = 32 }: { name: string; size?: number } = $props();

    const icons: Record<string, string> = {
        "OpenCode": `<path d="M8 6L4 12l4 6M16 6l4 6-4 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        "Kilo Code": `<rect x="6" y="4" width="12" height="16" rx="2" fill="currentColor" opacity="0.15"/><path d="M9 8h6M9 11h4M9 14h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
        "Zed IDE": `<path d="M6 7h12l-6 5 6 5H6l6-5z" fill="currentColor"/>`,
        "SillyTavern": `<circle cx="12" cy="10" r="5" fill="currentColor" opacity="0.15"/><path d="M9 9.5c.8-.8 2.2-.8 3 0M10 13h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 5l-2-2M16 5l2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
        "Janitor AI": `<path d="M7 8h10v2a5 5 0 01-10 0V8z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="14" cy="10" r="1" fill="currentColor"/><path d="M10 13c1.3.7 2.7.7 4 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
        "Chub AI": `<path d="M12 4C8 4 5 7 5 10c0 5 7 10 7 10s7-5 7-10c0-3-3-6-7-6z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><path d="M10 10c.8 0 1.5-.7 1.5-1.5S10.8 7 10 7" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M14 10c.8 0 1.5-.7 1.5-1.5S14.8 7 14 7" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
        "RisuAI": `<path d="M12 4l8 14H4z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="13" r="2" fill="currentColor"/>`,
        "Cline": `<path d="M8 6h8v12H8z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5" rx="2"/><path d="M11 10l2 2-2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
        "Roo Code": `<circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M9 10c1-1 3-1 4 0M11 14h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
        "Continue.dev": `<path d="M6 12h4l2-4 2 8 2-4h4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        "Aider": `<rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M9 9v6M15 9v6M9 12h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
        "Claude Code": `<path d="M12 4C8 4 5 8 5 12s3 8 7 8c1 0 2-.5 2-1.5v-1c0-.5.5-1 1-1h2c2.5 0 4.5-2 4.5-4.5C19.5 7.5 16 4 12 4z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/>`,
        "LibreChat": `<path d="M6 8a6 6 0 0112 0v4a6 6 0 01-12 0V8z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M9 16v2M15 16v2M10 18h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
        "Open WebUI": `<rect x="5" y="6" width="14" height="12" rx="2" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="16" r="3" fill="var(--surface, #fff)" stroke="currentColor" stroke-width="1.5"/><path d="M15 15.5c.5.5 1.5.5 2 0" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>`,
        "LobeChat": `<path d="M12 4C7 4 4 8 4 12c0 2 .5 3.5 1.5 5l1-1c-.7-1.2-1-2.5-1-4 0-3.2 2.8-7 7.5-7S19 8.8 19 12c0 1.5-.3 2.8-1 4l1 1c1-1.5 1.5-3 1.5-5 0-4-3-8-8-8z" fill="currentColor" opacity="0.12"/><circle cx="10" cy="11" r="1.5" fill="currentColor"/><circle cx="14" cy="11" r="1.5" fill="currentColor"/><path d="M9 15c1.5 1.5 4.5 1.5 6 0" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
        "AnythingLLM": `<path d="M8 6h8l2 12H6z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 10h4M10 13h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
        "Cherry Studio": `<circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M9 9c1.5-1 4.5-1 6 0M9 15c1.5 1 4.5 1 6 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
        "TypingMind": `<rect x="5" y="8" width="14" height="8" rx="1" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M8 11h2M12 11h2M8 14h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
        "BoltAI": `<path d="M13 4L5 14h6l-2 6 8-10h-6z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
        "Page Assist": `<rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M9 9l3 3-3 3M13 15h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
        "Chatbox": `<path d="M6 6h12v9a2 2 0 01-2 2H8l-3 3v-3a2 2 0 01-1-2V8a2 2 0 012-2z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M9 10h6M9 13h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
        "Big-AGI": `<path d="M12 4l-8 16h4l2-4h8l2 4h4L12 4zm-2 10l2-4 2 4h-4z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>`,
    };
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    aria-hidden="true"
>
    {@html icons[name] ?? `<rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">${name.slice(0,2)}</text>`}
</svg>
