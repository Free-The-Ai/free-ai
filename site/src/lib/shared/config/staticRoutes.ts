/** Single source of truth for every prerendered route: drives the dynamic
 * /setup/[slug] entries() and the postbuild sitemap generator. Uses relative
 * imports (not the "@" alias) so it loads unmodified under plain Node too. */
import { SETUP_GUIDES } from "../../entities/setup-guide/model.ts";

export const STATIC_ROUTES: string[] = [
    "/",
    "/home",
    "/docs",
    "/models",
    "/pricing",
    "/status",
    "/quickstart",
    "/setup",
    ...SETUP_GUIDES.map((guide) => `/setup/${guide.slug}`),
    "/roleplay-api",
    "/coding-agent-api",
    "/openai-compatible-api",
    "/team",
    "/support",
    "/privacy",
    "/terms",
    "/what-is-free-the-ai",
    "/404",
];
