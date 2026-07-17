/** Provider entity — health/status snapshot for one FreeTheAi model prefix. */

export type ProviderStatus = "up" | "degraded" | "down" | "unknown";

export interface ProviderHealth {
    error_rate_30m: number;
    error_rate_60m: number;
    errors_30m: number;
    errors_60m: number;
    last_error_at?: string | null;
    last_success_at?: string | null;
    model_count: number;
    prefix: string;
    requests_30m: number;
    requests_60m: number;
    status: ProviderStatus;
    successes_30m: number;
    successes_60m: number;
}

export interface HealthPayload {
    providers?: ProviderHealth[];
}

export const PROVIDER_ORDER: string[] = [
    "fth",
    "rev",
    "bbg",
    "glm",
    "opc",
    "cat",
    "yng",
    "bbl",
    "cwy",
    "woo",
    "img",
    "kai",
    "or",
    "vhr",
    "wsf",
];

export const STATUS_OPTIONS: ProviderStatus[] = ["up", "degraded", "down"];

export const STATUS_LABELS: Record<ProviderStatus, string> = {
    up: "Up",
    degraded: "Degraded",
    down: "Down",
    unknown: "Unknown",
};
