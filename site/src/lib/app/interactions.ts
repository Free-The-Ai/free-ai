/**
 * Global DOM-delegation interactions ported from Layout.astro's inline
 * <script> blocks: sound auto-decoration, code-block copy delegation, the
 * hero milestone fanfare, and the "M" mute-toggle shortcut. Router-driven
 * navigation sound lives in app/main.ts (router.beforeEach), since it needs
 * the router instance created by ViteSSG.
 */
import { swapMaterialIcon } from "@/shared/lib/dom";

const SOUND_MAP: Record<string, string> = {
    ".primary-button": "interaction.confirm",
    ".donate-button": "interaction.confirm",
    "button:not([data-sound])": "interaction.tap",
    "a[href]:not([data-sound])": "interaction.subtle",
    ".model-card": "interaction.tap",
    "select:not([data-sound])": "interaction.subtle",
    'input[type="checkbox"]:not([data-sound])': "interaction.toggle",
};

function decorateSounds(root: ParentNode): void {
    root.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((el) => {
        if (el.hostname && el.hostname !== location.hostname && !el.hasAttribute("data-sound")) {
            el.setAttribute("data-sound", "navigation.forward");
        }
    });
    for (const [selector, role] of Object.entries(SOUND_MAP)) {
        root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
            if (!el.hasAttribute("data-sound")) el.setAttribute("data-sound", role);
        });
    }
}

function closestFromEvent(event: Event, selector: string): Element | null {
    if (event.target instanceof Element) return event.target.closest(selector);
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    return (path.find((node) => node instanceof Element && node.matches(selector)) as Element | undefined) ?? null;
}

async function onCopyClick(event: Event): Promise<void> {
    const btn = closestFromEvent(event, ".copy-btn");
    if (!btn) return;
    const group = btn.closest?.(".docs-code-group") ?? btn.parentElement;
    const code = group?.querySelector("code");
    if (!code) return;
    try {
        await navigator.clipboard.writeText(code.textContent ?? "");
    } catch (error) {
        console.error("Failed to copy code sample", error);
        return;
    }
    const soundPlay = (window as unknown as { __soundPlay?: (role: string) => void }).__soundPlay;
    soundPlay?.("interaction.confirm");
    swapMaterialIcon(btn.querySelector(".material-symbols-outlined"), "check");
}

function onMuteKeydown(event: KeyboardEvent): void {
    if (event.key !== "m" && event.key !== "M") return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const toggleMute = (window as unknown as { __soundToggleMute?: () => boolean }).__soundToggleMute;
    if (typeof toggleMute !== "function") return;
    const muted = toggleMute();
    document.body.setAttribute("data-sound-muted", muted ? "true" : "false");
    window.clearTimeout((document.body as unknown as { _soundFlash?: number })._soundFlash);
    (document.body as unknown as { _soundFlash?: number })._soundFlash = window.setTimeout(() => {
        document.body.removeAttribute("data-sound-muted");
    }, 1200);
}

function initHeroMilestone(): void {
    if (sessionStorage.getItem("fta:hero")) return;
    const handler = () => {
        sessionStorage.setItem("fta:hero", "1");
        const soundPlay = (window as unknown as { __soundPlay?: (role: string) => void }).__soundPlay;
        soundPlay?.("hero.milestone");
        document.removeEventListener("click", handler, true);
    };
    document.addEventListener("click", handler, true);
}

export function initGlobalInteractions(): void {
    decorateSounds(document);
    if (typeof MutationObserver !== "undefined") {
        new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && typeof (node as Element).querySelectorAll === "function") decorateSounds(node as Element);
                });
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener("click", onCopyClick);
    document.addEventListener("keydown", onMuteKeydown);
    initHeroMilestone();
}
