/**
 * Model entity — public catalog model type, parsing, and route metadata
 * shared by the model-catalog-search feature and the models page.
 */
import { modelPrefix, modelSuffix, siteModelContextWindow } from "@/shared/lib/format";

export interface AccessInfo {
    available?: boolean;
    requires_seems_legit?: boolean;
    required_discord_roles?: string[];
}

export interface Model {
    id: string;
    prefix: string;
    visibility?: string;
    context_window?: number;
    max_input_tokens?: number;
    max_output_tokens?: number;
    supports_images?: boolean;
    supports_audio?: boolean;
    requires_seems_legit?: boolean;
    required_roles: string[];
}

export interface CatalogPolicy {
    seems_legit_required_prefixes?: string[];
    seems_legit_required_role_label?: string;
    seems_legit_required_role_public?: boolean;
}

export type RouteMethod = "GET" | "POST";

export interface RouteInfo {
    method: RouteMethod;
    path: string;
    label: string;
    description: string;
}

export const SUPPORTED_ROUTES: RouteInfo[] = [
    {
        method: "POST",
        path: "/v1/chat/completions",
        label: "Chat Completions",
        description: "OpenAI-compatible chat with streaming and tool calling.",
    },
    {
        method: "POST",
        path: "/v1/messages",
        label: "Messages",
        description: "Anthropic-compatible Messages route with system prompts and tool use.",
    },
    {
        method: "POST",
        path: "/v1/responses",
        label: "Responses",
        description: "Responses-style route with the same key and model alias.",
    },
];

const AUDIO_ROUTE_PATTERNS: Record<string, RouteInfo> = {
    stt: { method: "POST", path: "/v1/audio/transcriptions", label: "Speech to text", description: "OpenAI-compatible multipart audio transcription." },
    asr: { method: "POST", path: "/v1/audio/transcriptions", label: "Speech to text", description: "OpenAI-compatible multipart audio transcription." },
    transcription: { method: "POST", path: "/v1/audio/transcriptions", label: "Speech to text", description: "OpenAI-compatible multipart audio transcription." },
    tts: { method: "POST", path: "/v1/audio/speech", label: "Text to speech", description: "OpenAI-compatible speech generation." },
    speech: { method: "POST", path: "/v1/audio/speech", label: "Text to speech", description: "OpenAI-compatible speech generation." },
};

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((item: unknown): item is string => typeof item === "string") : []);
const posInt = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined);

export const modelSupportsAudio = (model: Model): boolean =>
    model.supports_audio === true ||
    /(^|\/)(grok-stt|grok-tts)$/i.test(model.id) ||
    /tts|stt|speech|transcription/i.test(model.id);

export const modelSupportsImage = (model: Model): boolean =>
    model.supports_images === true || /(^|\/)(gpt-image|.*-image)(-|$|\/)/i.test(model.id);

export const modelContext = (model: Model): number => siteModelContextWindow(model);

export const modelRoutes = (model: Model): RouteInfo[] => {
    if (modelSupportsImage(model)) {
        const routes: RouteInfo[] = [
            { method: "POST", path: "/v1/images/generations", label: "Image generation", description: "OpenAI-compatible image generation." },
        ];
        if (model.prefix === "ever") routes.push({ method: "POST", path: "/v1/images/edits", label: "Image edits", description: "OpenAI-compatible multipart image editing." });
        if (model.prefix === "eve") routes.push({ method: "GET", path: "/v1/images/generations/{request_id}", label: "Image polling", description: "Poll async image jobs submitted with background or async enabled." });
        return routes;
    }
    const suffix = modelSuffix(model.id).toLowerCase();
    for (const [pattern, route] of Object.entries(AUDIO_ROUTE_PATTERNS)) {
        if (suffix.includes(pattern)) return [route];
    }
    return SUPPORTED_ROUTES;
};

export const parseModel = (i: unknown): Model | null => {
    if (!i || typeof i !== "object") return null;
    const raw = i as Record<string, unknown>;
    const _id = str(raw.id);
    if (!_id) return null;
    const pfx = str(raw.prefix) ?? modelPrefix(_id);
    const access = (raw.access ?? {}) as AccessInfo;
    const requiredRoles = strArray(access.required_discord_roles);
    const requiresSeemsLegit =
        raw.requires_seems_legit === true || access.requires_seems_legit === true || requiredRoles.includes("seems_legit");
    const out: Model = { id: _id, prefix: pfx, required_roles: requiredRoles };
    const fields: [keyof Model, (v: unknown) => unknown][] = [
        ["visibility", str],
        ["context_window", posInt],
        ["max_input_tokens", posInt],
        ["max_output_tokens", posInt],
    ];
    for (const [key, fn] of fields) {
        const v = fn(raw[key]);
        if (v !== undefined) (out as unknown as Record<string, unknown>)[key] = v;
    }
    if (typeof raw.supports_images === "boolean") out.supports_images = raw.supports_images;
    if (typeof raw.supports_audio === "boolean") out.supports_audio = raw.supports_audio;
    if (requiresSeemsLegit) out.requires_seems_legit = true;
    return out;
};
