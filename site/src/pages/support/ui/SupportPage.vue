<script setup lang="ts">
import { useSeo } from "@/shared/lib/seo";
import { siteConfig } from "@/shared/config/site";
import { buildBreadcrumbJsonLd, buildOrganizationJsonLd, buildSoftwareJsonLd, buildWebsiteJsonLd, buildWebApiJsonLd } from "@/shared/lib/jsonLd";

const pageTitle = "Support | FreeTheAi";
const pageDescription = "FreeTheAi support, issue reporting, and policy contact page for Discord users, developers, and app reviewers.";

useSeo({
    title: pageTitle,
    description: pageDescription,
    path: "/support",
    keywords: "FreeTheAi support, FreeTheAi report issue, Discord app support, API help",
    jsonLd: [
        buildWebsiteJsonLd(),
        buildOrganizationJsonLd(),
        buildSoftwareJsonLd(),
        buildWebApiJsonLd(),
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "FreeTheAi Support",
            url: "https://freetheai.xyz/support",
            description: pageDescription,
            isPartOf: { "@id": "https://freetheai.xyz/#website" },
        },
        buildBreadcrumbJsonLd([
            { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
            { name: "Support", url: "https://freetheai.xyz/support" },
        ]),
    ],
});

function copyEmail(event: MouseEvent): void {
    navigator.clipboard.writeText(siteConfig.socials.supportEmail).catch((error) => {
        console.error("Failed to copy support email", error);
    });
    const btn = event.currentTarget as HTMLElement;
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) {
        icon.textContent = "check";
        setTimeout(() => {
            icon.textContent = "content_copy";
        }, 2000);
    }
}
</script>

<template>
    <main class="support-main">
        <section class="support-hero shell" aria-labelledby="support-hero-heading">
            <div class="support-hero-glow" aria-hidden="true"></div>
            <div class="support-hero-orb" aria-hidden="true">
                <span class="material-symbols-outlined">support_agent</span>
            </div>
            <div class="support-hero-content">
                <span class="eyebrow">Support</span>
                <h1 id="support-hero-heading">Report issues, get help, or contact the team.</h1>
                <p class="hero-text">
                    If something is broken, unsafe, or unclear, use one of the public support paths below. This page exists so
                    Discord users and app reviewers have a clear way to contact us about the application and its use.
                </p>
            </div>
        </section>

        <section class="section shell support-grid-section" aria-labelledby="support-channels-heading">
            <h2 id="support-channels-heading" class="visually-hidden">Support channels</h2>
            <div class="support-grid">
                <article class="panel support-card">
                    <div class="support-card-icon" aria-hidden="true">
                        <span class="material-symbols-outlined">mail</span>
                    </div>
                    <span class="eyebrow">Email contact</span>
                    <h3>Private support mailbox</h3>
                    <p>Use this address for account issues, app-review contact, policy questions, or abuse reports that should not be posted publicly.</p>
                    <div class="support-email-group docs-code-group">
                        <code class="support-link">
                            <a :href="`mailto:${siteConfig.socials.supportEmail}`">{{ siteConfig.socials.supportEmail }}</a>
                        </code>
                        <button class="copy-btn" type="button" title="Copy email" aria-label="Copy email address" @click="copyEmail">
                            <span class="material-symbols-outlined">content_copy</span>
                        </button>
                    </div>
                </article>

                <article class="panel support-card">
                    <div class="support-card-icon" aria-hidden="true">
                        <span class="material-symbols-outlined">forum</span>
                    </div>
                    <span class="eyebrow">Community help</span>
                    <h3>Discord and GitHub</h3>
                    <p>For general help, use the Discord server. For public bugs or feature requests, use GitHub issues or pull requests.</p>
                    <div class="support-links">
                        <a class="primary-button" :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">
                            <span>Join Discord</span>
                            <span class="cta-arrow" aria-hidden="true">&rarr;</span>
                        </a>
                        <a class="support-secondary" :href="siteConfig.socials.github" target="_blank" rel="noreferrer">GitHub repo</a>
                    </div>
                </article>
            </div>
        </section>

        <section class="section shell support-section" aria-labelledby="support-checklist-heading">
            <header class="section-head">
                <span class="eyebrow">What to include</span>
                <h2 id="support-checklist-heading">Send enough detail to reproduce the problem.</h2>
                <p>
                    Include the affected page or route, the time the issue happened, the Discord user id or key prefix if
                    relevant, the exact error text, and any screenshots or request ids that help us trace it.
                </p>
            </header>
            <ul class="support-checklist">
                <li class="support-checklist-card">
                    <span class="material-symbols-outlined support-checklist-icon" aria-hidden="true">link</span>
                    <span class="support-checklist-label">Affected page or API route</span>
                </li>
                <li class="support-checklist-card">
                    <span class="material-symbols-outlined support-checklist-icon" aria-hidden="true">schedule</span>
                    <span class="support-checklist-label">Approximate time and timezone</span>
                </li>
                <li class="support-checklist-card">
                    <span class="material-symbols-outlined support-checklist-icon" aria-hidden="true">badge</span>
                    <span class="support-checklist-label">Discord user id or key prefix</span>
                </li>
                <li class="support-checklist-card">
                    <span class="material-symbols-outlined support-checklist-icon" aria-hidden="true">bug_report</span>
                    <span class="support-checklist-label">Exact error text or request id</span>
                </li>
            </ul>
        </section>

        <section class="section shell support-cta-section" aria-labelledby="support-cta-heading">
            <div class="support-cta-card">
                <div class="support-cta-body">
                    <span class="eyebrow support-cta-eyebrow">Still stuck?</span>
                    <h2 id="support-cta-heading">Get help in Discord.</h2>
                    <p>The community and the team are active there. Use your public support email for anything private.</p>
                    <div class="support-links">
                        <a class="primary-button" :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">
                            <span>Open Discord</span>
                            <span class="cta-arrow" aria-hidden="true">&rarr;</span>
                        </a>
                        <a class="support-secondary" :href="`mailto:${siteConfig.socials.supportEmail}`">Email support</a>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
.support-main {
    gap: 28px;
    padding: 22px 0 64px;
}
.support-hero {
    position: relative;
    overflow: hidden;
    display: grid;
    padding: clamp(32px, 5vw, 56px);
}
.support-hero-glow {
    position: absolute;
    inset: -80px auto auto 10%;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: radial-gradient(circle, oklch(0.659 0.192 40.1 / 0.18), transparent 62%), radial-gradient(circle at 70% 65%, oklch(0.827 0.113 55.9 / 0.1), transparent 48%);
    pointer-events: none;
}
.support-hero-orb {
    position: absolute;
    top: clamp(20px, 3vw, 36px);
    right: clamp(20px, 4vw, 48px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1px solid oklch(0.659 0.192 40.1 / 0.25);
    background: oklch(0.659 0.192 40.1 / 0.08);
    box-shadow: 0 0 24px oklch(0.659 0.192 40.1 / 0.12);
    pointer-events: none;
}
.support-hero-orb .material-symbols-outlined {
    font-size: 28px;
    color: var(--accent-text);
    text-shadow: var(--accent-text-glow);
}
.support-hero-content {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 14px;
    max-width: 640px;
}
.support-grid-section {
    margin-top: -18px;
    padding: clamp(22px, 3.8vw, 36px);
}
.support-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
}
.support-card {
    display: grid;
    gap: 10px;
    min-height: 100%;
    transition: border-color 160ms var(--ease-out-smooth), box-shadow 160ms var(--ease-out-smooth), transform 160ms var(--ease-out-smooth);
}
.support-card:hover {
    border-color: oklch(0.659 0.192 40.1 / 0.28);
    box-shadow: var(--sk-raised-shadow), 0 0 20px oklch(0.659 0.192 40.1 / 0.06);
    transform: translateY(-2px);
}
.support-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    border: 1px solid oklch(0.659 0.192 40.1 / 0.18);
    background: oklch(0.659 0.192 40.1 / 0.08);
    margin-bottom: 4px;
}
.support-card-icon .material-symbols-outlined {
    font-size: 22px;
    color: var(--accent-text);
    text-shadow: var(--accent-text-glow);
}
.support-card h3 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.3rem;
    line-height: 1.2;
}
.support-link {
    color: var(--accent-text);
    font-family: var(--font-mono);
    word-break: break-word;
}
.support-links {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    margin-top: 4px;
}
.support-secondary {
    color: var(--muted);
    text-decoration: none;
    border-bottom: 1px solid var(--sk-border);
    padding-bottom: 2px;
    transition: color 150ms var(--ease-out-smooth), border-color 150ms var(--ease-out-smooth);
}
.support-secondary:hover {
    color: var(--accent-text);
    border-color: oklch(0.659 0.192 40.1 / 0.42);
}
.support-email-group {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    width: fit-content;
}
.support-email-group .support-link {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    text-decoration: none;
    text-shadow: var(--accent-text-glow);
}
.support-email-group .copy-btn {
    position: static;
    opacity: 0.55;
    width: 22px;
    height: 22px;
}
.support-email-group:hover .copy-btn,
.support-email-group .copy-btn:focus-visible {
    opacity: 1;
}
.support-section {
    margin-top: -18px;
    padding: clamp(22px, 3.8vw, 36px);
}
.support-checklist {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.support-checklist-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    transition: border-color 160ms var(--ease-out-smooth);
}
.support-checklist-card:hover {
    border-color: oklch(0.659 0.192 40.1 / 0.22);
}
.support-checklist-icon {
    color: var(--accent-text);
    font-size: 22px;
    text-shadow: var(--accent-text-glow);
    flex-shrink: 0;
}
.support-checklist-label {
    color: var(--text);
    font-size: 0.9rem;
    line-height: 1.4;
}
.support-cta-section {
    margin-top: -18px;
    padding: clamp(22px, 3.8vw, 36px);
}
.support-cta-card {
    position: relative;
    display: grid;
    padding: clamp(24px, 4vw, 40px);
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    overflow: hidden;
}
.support-cta-card::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: linear-gradient(180deg, oklch(0.75 0.173 353.8), oklch(0.659 0.192 40.1));
    pointer-events: none;
}
.support-cta-body {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 12px;
}
.support-cta-eyebrow {
    color: oklch(0.803 0.128 354.3);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-shadow: 0 0 8px oklch(0.75 0.173 353.8 / 0.24);
}
.support-cta-card h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.6rem, 3.2vw, 2.2rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
}
.support-cta-card p {
    margin: 0;
    max-width: 64ch;
    color: var(--muted);
    font-size: 0.98rem;
    line-height: 1.6;
    text-wrap: pretty;
}
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
@media (prefers-reduced-motion: reduce) {
    .support-card,
    .support-checklist-card,
    .support-secondary {
        transition: none;
        transform: none;
    }
}
@media (max-width: 640px) {
    .support-hero-orb {
        display: none;
    }
}
</style>
