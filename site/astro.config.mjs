// freetheai.xyz is the old FreeTheAI home. The service now runs at
// freetheai.org; this site explains the move and forwards every old page to
// its new place. The old API (api.freetheai.xyz) is retired.
import { defineConfig } from 'astro/config';

const org = 'https://freetheai.org';
const docs = `${org}/docs`;

// The old site's setup guides (one per app) moved to freetheai.org/setup
// under the same slugs. Guides that were dropped (Roo Code is archived;
// BoltAI and big-AGI were not carried over) go to the guide list.
const setup = `${org}/setup`;
const setupGuides = [
  'opencode', 'kilo-code', 'zed', 'sillytavern', 'janitor-ai', 'chub-ai', 'risuai', 'cline',
  'continue-dev', 'aider', 'claude-code', 'librechat', 'open-webui', 'lobechat',
  'anythingllm', 'cherry-studio', 'typingmind', 'page-assist', 'chatbox',
];
const droppedGuides = ['roo-code', 'boltai', 'big-agi'];

export default defineConfig({
  site: 'https://freetheai.xyz',
  output: 'static',
  redirects: {
    '/home': org,
    '/docs': docs,
    '/quickstart': docs,
    '/setup': setup,
    ...Object.fromEntries(setupGuides.map((slug) => [`/setup/${slug}`, `${setup}/${slug}`])),
    ...Object.fromEntries(droppedGuides.map((slug) => [`/setup/${slug}`, setup])),
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
