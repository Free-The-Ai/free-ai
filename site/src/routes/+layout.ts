// Fully static site: every route is prerendered at build time (adapter-static).
// Individual routes (e.g. setup/[slug]) may still declare their own entries().
export const prerender = true;

// Emits <route>/index.html instead of <route>.html so the static host (GitHub
// Pages) serves clean URLs without extension-based rewrites, matching
// STATIC_ROUTES / postbuild.mjs which expect the nested index.html layout.
export const trailingSlash = "always";
