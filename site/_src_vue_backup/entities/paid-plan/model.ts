/** Paid-plan entity — plan/model normalization shared by the paid-plan-explorer feature. */
import { modelPrefix, siteModelContextWindow } from "@/shared/lib/format";

export interface PaidLimit {
    limit?: number;
    unit?: string;
}

export interface PaidPrice {
    amount?: number;
    amount_milli?: number;
    currency?: string;
    period?: string;
}

export interface PaidPlan {
    id: string;
    display_name: string;
    description?: string;
    highlights?: string[];
    limits?: Record<string, PaidLimit>;
    model_count?: number;
    concurrency_limit?: number;
    providers?: string[];
    models?: string[];
    billing_period?: string;
    price?: string | PaidPrice;
    price_usd?: number;
    price_usd_milli?: number;
    purchasable?: boolean;
}

export interface PaidModel {
    id: string;
    name?: string;
    prefix?: string;
    unit_cost: number;
    unit_label: string;
    route: string;
    plans?: string[];
    context_window?: number;
    max_input_tokens?: number;
    max_output_tokens?: number;
    supports_images?: boolean;
    supports_streaming?: boolean;
    supports_tool_call?: boolean;
    supports_response_schema?: boolean;
}

export interface PaidModelGroup {
    id: string;
    label: string;
    description: string;
    models: PaidModel[];
}

export interface PaidPlanSnapshot {
    updated_at?: string;
    plan?: {
        price?: string;
        period?: string;
        summary?: string;
    };
    plans?: PaidPlan[];
    model_groups?: PaidModelGroup[];
}

export interface CatalogState {
    plans: PaidPlan[];
    groups: PaidModelGroup[];
}

export const PLAN_COPY: Record<string, { tag: string; bestFor: string; accent: string }> = {
    coding: {
        tag: "Full catalog",
        bestFor: "IDE agents, CLI tools, long coding runs, and general assistant work.",
        accent: "Full model spread, more concurrency, higher request-unit limits.",
    },
    roleplay: {
        tag: "Curated chat",
        bestFor: "Roleplay clients, story chats, companion bots, and lighter chat usage.",
        accent: "Smaller model set, simpler routing, built around chat-first usage.",
    },
};

export const PLAN_PRICE_FALLBACKS: Record<string, string> = {
    coding: "$8",
    roleplay: "$5",
};

export const PLAN_ORDER = ["roleplay", "coding"];
export const LIMIT_ORDER = ["five_hour", "hourly", "daily", "weekly", "monthly"];
export const LIMIT_LABELS: Record<string, string> = {
    five_hour: "5-hour units",
    hourly: "hourly units",
    daily: "daily units",
    weekly: "weekly units",
    monthly: "monthly units",
};

const str = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value.trim() : undefined);
const num = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((item: unknown): item is string => typeof item === "string") : []);
const strOrObj = (v: unknown): string | PaidPrice | undefined => (typeof v === "string" || (v && typeof v === "object") ? (v as string | PaidPrice) : undefined);
const objOr = <T extends Record<string, unknown>>(v: unknown, fallback: T): T => (v !== null && typeof v === "object" ? (v as T) : fallback);

const firstStr = (...vals: unknown[]): string | undefined => {
    for (const v of vals) {
        if (typeof v === "string" && v.trim()) return v.trim();
    }
    return undefined;
};

export const formatNumber = (value: number): string => value.toLocaleString();

export const formatUnitCost = (value: number): string => (Number.isInteger(value) ? String(value) : String(value));

export const formatUSD = (value: number): string =>
    `$${Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const priceFromObject = (price: PaidPrice): string | undefined => {
    const amount = num(price.amount);
    if (amount !== undefined) return formatUSD(amount);
    const milli = num(price.amount_milli);
    if (milli !== undefined) return formatUSD(milli / 1000);
    return undefined;
};

export const formatPlanPrice = (plan: PaidPlan): string => {
    const milli = num(plan.price_usd_milli);
    if (milli !== undefined) return formatUSD(milli / 1000);
    const usd = num(plan.price_usd);
    if (usd !== undefined) return formatUSD(usd);
    if (typeof plan.price === "string" && plan.price.trim()) return plan.price.trim();
    if (plan.price && typeof plan.price === "object") {
        const objPrice = priceFromObject(plan.price);
        if (objPrice) return objPrice;
    }
    return PLAN_PRICE_FALLBACKS[plan.id] ?? "Paid";
};

export const planPeriod = (plan: PaidPlan, fallback?: string): string | undefined => {
    if (plan.billing_period) return plan.billing_period;
    if (typeof plan.price === "object" && plan.price !== null && plan.price.period) return plan.price.period;
    return fallback;
};

export const routeForModel = (id: string): string => {
    const lower = id.toLowerCase();
    if (lower.includes("embedding")) return "embeddings";
    if (lower.includes("rerank")) return "rerank";
    return "chat";
};

export const limitEntries = (plan: PaidPlan) =>
    LIMIT_ORDER.map((key) => ({ key, value: plan.limits?.[key] })).filter(
        (entry): entry is { key: string; value: PaidLimit } => typeof entry.value?.limit === "number" && Number.isFinite(entry.value.limit),
    );

export const normalizePlan = (raw: unknown): PaidPlan | null => {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const id = str(r.id);
    if (!id) return null;
    if (r.display === false || r.visible === false || r.purchasable === false) return null;
    const price = strOrObj(r.price);
    const periodFromPrice = typeof r.price === "object" && r.price ? (r.price as Record<string, unknown>).period : undefined;
    return {
        id,
        display_name: str(r.display_name) ?? id,
        description: str(r.description),
        highlights: strArray(r.highlights),
        limits: objOr(r.limits, {}),
        model_count: num(r.model_count),
        concurrency_limit: num(r.concurrency_limit),
        providers: strArray(r.providers),
        models: strArray(r.models),
        billing_period: firstStr(r.billing_period, r.period, periodFromPrice),
        price,
        price_usd: num(r.price_usd),
        price_usd_milli: num(r.price_usd_milli),
        purchasable: r.purchasable !== false,
    };
};

export const normalizeModel = (raw: unknown): PaidModel | null => {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const id = str(r.id);
    if (!id) return null;
    const pricingObj = typeof r.pricing === "object" && r.pricing ? (r.pricing as Record<string, unknown>) : {};
    const unit = num(r.pricing_units) ?? num(pricingObj.unit_cost) ?? num(r.unit_cost) ?? 1;
    const display = str(pricingObj.display) ?? str(r.unit_label) ?? `${formatUnitCost(unit)} request units`;
    const model: PaidModel = {
        id,
        name: str(r.name),
        unit_cost: unit,
        unit_label: display,
        route: str(r.route) ?? routeForModel(id),
        plans: strArray(r.plans),
        context_window: num(r.context_window),
        max_input_tokens: num(r.max_input_tokens),
        max_output_tokens: num(r.max_output_tokens),
        supports_images: r.supports_images === true,
        supports_streaming: r.supports_streaming === true,
        supports_tool_call: r.supports_tool_call === true,
        supports_response_schema: r.supports_response_schema === true,
    };
    const ctx = siteModelContextWindow(model);
    if (ctx > 0) {
        model.context_window = ctx;
        model.max_input_tokens = ctx;
    }
    return model;
};

export const groupModels = (models: PaidModel[]): PaidModelGroup[] => {
    const byPrefix = new Map<string, PaidModel[]>();
    for (const model of models) {
        const prefix = modelPrefix(model.id);
        const list = byPrefix.get(prefix) ?? [];
        list.push(model);
        byPrefix.set(prefix, list);
    }
    return [...byPrefix.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, list]) => ({
            id,
            label: `${id.toUpperCase()} models`,
            description: "paid model pool",
            models: list.sort((a, b) => a.unit_cost - b.unit_cost || a.id.localeCompare(b.id)),
        }));
};

export const snapshotState = (snapshot: PaidPlanSnapshot): CatalogState => ({
    plans: (snapshot.plans ?? []).map(normalizePlan).filter((plan): plan is PaidPlan => plan !== null),
    groups: snapshot.model_groups ?? [],
});

const CATALOG_ENDPOINT = "https://paid.freetheai.xyz/v1/models/full";
const PLANS_ENDPOINT = "https://paid.freetheai.xyz/v1/plans";
const SITE_KEY = "freetheai.xyz";

export const fetchLiveCatalog = async (): Promise<CatalogState> => {
    const headers = { Accept: "application/json", Authorization: `Bearer ${SITE_KEY}` };
    const [modelsRes, plansRes] = await Promise.all([fetch(CATALOG_ENDPOINT, { headers }), fetch(PLANS_ENDPOINT, { headers })]);
    if (!modelsRes.ok) throw new Error(`Paid catalog status ${modelsRes.status}`);
    if (!plansRes.ok) throw new Error(`Paid plans status ${plansRes.status}`);
    const [modelsPayload, plansPayload] = await Promise.all([modelsRes.json(), plansRes.json()]);
    const plans = ((plansPayload?.data ?? modelsPayload?.plans ?? []) as unknown[])
        .map(normalizePlan)
        .filter((plan): plan is PaidPlan => plan !== null);
    const groups = groupModels(
        ((modelsPayload?.data ?? []) as unknown[]).map(normalizeModel).filter((model): model is PaidModel => model !== null),
    );
    return { plans, groups };
};
