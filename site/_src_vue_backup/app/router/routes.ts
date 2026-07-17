import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
    { path: "/", name: "redirect", component: () => import("@/pages/redirect") },
    { path: "/home", name: "home", component: () => import("@/pages/home") },
    { path: "/docs", name: "docs", component: () => import("@/pages/docs") },
    { path: "/models", name: "models", component: () => import("@/pages/models") },
    { path: "/pricing", name: "pricing", component: () => import("@/pages/pricing") },
    { path: "/status", name: "status", component: () => import("@/pages/status") },
    { path: "/quickstart", name: "quickstart", component: () => import("@/pages/quickstart") },
    { path: "/setup", name: "setup-index", component: () => import("@/pages/setup-index") },
    { path: "/setup/:slug", name: "setup-detail", component: () => import("@/pages/setup-detail") },
    { path: "/roleplay-api", name: "roleplay-api", component: () => import("@/pages/intent-landing"), meta: { intentKey: "roleplay" } },
    { path: "/coding-agent-api", name: "coding-agent-api", component: () => import("@/pages/intent-landing"), meta: { intentKey: "coding" } },
    { path: "/openai-compatible-api", name: "openai-compatible-api", component: () => import("@/pages/intent-landing"), meta: { intentKey: "compatible" } },
    { path: "/team", name: "team", component: () => import("@/pages/team") },
    { path: "/support", name: "support", component: () => import("@/pages/support") },
    { path: "/privacy", name: "privacy", component: () => import("@/pages/privacy") },
    { path: "/terms", name: "terms", component: () => import("@/pages/terms") },
    { path: "/what-is-free-the-ai", name: "what-is", component: () => import("@/pages/what-is") },
    { path: "/404", name: "not-found", component: () => import("@/pages/not-found") },
    { path: "/:pathMatch(.*)*", name: "catch-all", component: () => import("@/pages/not-found") },
];
