// freetheai.xyz is the old FreeTheAI home. The service now runs at
// freetheai.org; this site explains the move and forwards every old page to
// its new place. The old API (api.freetheai.xyz) is retired.
import { defineConfig } from 'astro/config';

const org = 'https://freetheai.org';
const docs = `${org}/docs`;

// The old site's setup guides (one per app) all live in the new docs.
const setupGuides = [
  'opencode', 'kilo-code', 'zed', 'sillytavern', 'janitor-ai', 'chub-ai', 'risuai', 'cline',
  'roo-code', 'continue-dev', 'aider', 'claude-code', 'librechat', 'open-webui', 'lobechat',
  'anythingllm', 'cherry-studio', 'typingmind', 'boltai', 'page-assist', 'chatbox', 'big-agi',
];

export default defineConfig({
  site: 'https://freetheai.xyz',
  output: 'static',
  redirects: {
    '/home': org,
    '/docs': docs,
    '/quickstart': docs,
    '/setup': docs,
    ...Object.fromEntries(setupGuides.map((slug) => [`/setup/${slug}`, docs])),
    '/models': `${org}/models`,
    '/pricing': `${org}/plans`,
    '/status': `${org}/status`,
    '/privacy': `${org}/privacy`,
    '/terms': `${org}/terms`,
    '/support': 'https://discord.gg/secrets',
    '/team': '/',
    '/roleplay-api': org,
    '/coding-agent-api': org,
    '/openai-compatible-api': org,
    '/what-is-free-the-ai': '/',
  },
});
