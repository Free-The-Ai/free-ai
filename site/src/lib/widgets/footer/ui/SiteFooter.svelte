<script lang="ts">
    import { siteConfig } from "@/shared/config/site";
    import { DitherGradient } from "@/shared/ui";
    import OnlineCounter from "@/features/presence/ui/OnlineCounter.svelte";

    // `flush` matches the 404 page's original `body .site-footer { margin-top: 0 }`
    // override, scoped here instead of leaking a global selector.
    let { flush }: { flush?: boolean } = $props();
</script>

<footer class="site-footer" style={flush ? "margin-top: 0" : undefined} aria-label="Site footer">
    <DitherGradient class="footer-glow" from="orange" direction="up" opacity={0.14} />
    <div class="footer-links">
        <a href="/quickstart">Quickstart</a>
        <a href="/setup">Setup guides</a>
        <a href="/roleplay-api">Roleplay API</a>
        <a href="/coding-agent-api">Coding agent API</a>
        <a href="/openai-compatible-api">OpenAI-compatible API</a>
        <a href="/models">Models</a>
        <a href="/pricing">Pricing</a>
        <a href="/status">Status</a>
        <a href="/docs">Docs</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/support">Support</a>
        <a href="/team">Team</a>
        <a href="/what-is-free-the-ai">What is FreeTheAi</a>
        <a href={siteConfig.socials.github} target="_blank" rel="noreferrer">GitHub</a>
        <a href={siteConfig.socials.discord} target="_blank" rel="noreferrer">Discord</a>
        <a href={siteConfig.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a class="footer-donate-link" href={siteConfig.socials.donate} target="_blank" rel="noreferrer">
            <span aria-hidden="true">&#9829;</span>
            Donate
        </a>
    </div>
    <p class="footer-bottom">
        free tier stays free. paid slots are optional. support and issue reports are available on the support page.<span class="footer-sep" aria-hidden="true">&middot;</span><OnlineCounter />
    </p>
</footer>
