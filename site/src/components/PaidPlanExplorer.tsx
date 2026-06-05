import { createEffect, createMemo, createSignal, For, onMount, Show } from "solid-js";
import PaidModelTable from "./PaidModelTable";

interface PaidLimit {
  limit?: number;
  unit?: string;
}

interface PaidPrice {
  amount?: number;
  amount_milli?: number;
  currency?: string;
  period?: string;
}

interface PaidPlan {
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

interface PaidModel {
  id: string;
  name?: string;
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

interface PaidModelGroup {
  id: string;
  label: string;
  description: string;
  models: PaidModel[];
}

interface PaidPlanSnapshot {
  updated_at?: string;
  plan?: {
    price?: string;
    period?: string;
    summary?: string;
  };
  plans?: PaidPlan[];
  model_groups?: PaidModelGroup[];
}

interface CatalogState {
  plans: PaidPlan[];
  groups: PaidModelGroup[];
}

interface PaidPlanExplorerProps {
  snapshot: PaidPlanSnapshot;
  discordUrl: string;
}

const CATALOG_ENDPOINT = "https://paid.freetheai.xyz/v1/models/full";
const PLANS_ENDPOINT = "https://paid.freetheai.xyz/v1/plans";
const SITE_KEY = "freetheai.xyz";

const PLAN_COPY: Record<string, { tag: string; bestFor: string; accent: string }> = {
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

const PLAN_PRICE_FALLBACKS: Record<string, string> = {
  coding: "$8",
  roleplay: "$5",
};

const PLAN_ORDER = ["roleplay", "coding"];
const LIMIT_ORDER = ["five_hour", "hourly", "daily", "weekly", "monthly"];
const LIMIT_LABELS: Record<string, string> = {
  five_hour: "5-hour units",
  hourly: "hourly units",
  daily: "daily units",
  weekly: "weekly units",
  monthly: "monthly units",
};

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const formatNumber = (value: number): string => value.toLocaleString();

const formatUnitCost = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(value);

const formatUSD = (value: number): string =>
  `$${Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const formatPlanPrice = (plan: PaidPlan): string => {
  const milli = num(plan.price_usd_milli);
  if (milli !== undefined) return formatUSD(milli / 1000);
  const usd = num(plan.price_usd);
  if (usd !== undefined) return formatUSD(usd);
  if (typeof plan.price === "string" && plan.price.trim()) return plan.price.trim();
  if (typeof plan.price === "object" && plan.price !== null) {
    const amount = num(plan.price.amount);
    const amountMilli = num(plan.price.amount_milli);
    if (amount !== undefined) return formatUSD(amount);
    if (amountMilli !== undefined) return formatUSD(amountMilli / 1000);
  }
  return PLAN_PRICE_FALLBACKS[plan.id] ?? "Paid";
};

const planPeriod = (plan: PaidPlan, fallback?: string): string | undefined => {
  if (plan.billing_period) return plan.billing_period;
  if (typeof plan.price === "object" && plan.price !== null && plan.price.period) return plan.price.period;
  return fallback;
};

const modelPrefix = (id: string): string => id.includes("/") ? id.slice(0, id.indexOf("/")) : "other";

const routeForModel = (id: string): string => {
  const lower = id.toLowerCase();
  if (lower.includes("embedding")) return "embeddings";
  if (lower.includes("rerank")) return "rerank";
  return "chat";
};

const limitEntries = (plan: PaidPlan) =>
  LIMIT_ORDER
    .map((key) => ({ key, value: plan.limits?.[key] }))
    .filter((entry): entry is { key: string; value: PaidLimit } =>
      typeof entry.value?.limit === "number" && Number.isFinite(entry.value.limit),
    );

const normalizePlan = (raw: any): PaidPlan | null => {
  const id = str(raw?.id);
  if (!id) return null;
  if (raw?.display === false || raw?.visible === false || raw?.purchasable === false) return null;
  const rawPrice = raw?.price;
  const price = typeof rawPrice === "string" || (rawPrice && typeof rawPrice === "object") ? rawPrice : undefined;
  return {
    id,
    display_name: str(raw?.display_name) ?? id,
    description: str(raw?.description),
    highlights: Array.isArray(raw?.highlights) ? raw.highlights.filter((item: unknown): item is string => typeof item === "string") : [],
    limits: raw?.limits && typeof raw.limits === "object" ? raw.limits : {},
    model_count: num(raw?.model_count),
    concurrency_limit: num(raw?.concurrency_limit),
    providers: Array.isArray(raw?.providers) ? raw.providers.filter((item: unknown): item is string => typeof item === "string") : [],
    models: Array.isArray(raw?.models) ? raw.models.filter((item: unknown): item is string => typeof item === "string") : [],
    billing_period: str(raw?.billing_period) ?? str(raw?.period) ?? str(raw?.price?.period),
    price,
    price_usd: num(raw?.price_usd),
    price_usd_milli: num(raw?.price_usd_milli),
    purchasable: raw?.purchasable !== false,
  };
};

const normalizeModel = (raw: any): PaidModel | null => {
  const id = str(raw?.id);
  if (!id) return null;
  const unit = num(raw?.pricing_units) ?? num(raw?.pricing?.unit_cost) ?? num(raw?.unit_cost) ?? 1;
  const display = str(raw?.pricing?.display) ?? str(raw?.unit_label) ?? `${formatUnitCost(unit)} request units`;
  return {
    id,
    name: str(raw?.name),
    unit_cost: unit,
    unit_label: display,
    route: str(raw?.route) ?? routeForModel(id),
    plans: Array.isArray(raw?.plans) ? raw.plans.filter((item: unknown): item is string => typeof item === "string") : [],
    context_window: num(raw?.context_window),
    max_input_tokens: num(raw?.max_input_tokens),
    max_output_tokens: num(raw?.max_output_tokens),
    supports_images: raw?.supports_images === true,
    supports_streaming: raw?.supports_streaming === true,
    supports_tool_call: raw?.supports_tool_call === true,
    supports_response_schema: raw?.supports_response_schema === true,
  };
};

const groupModels = (models: PaidModel[]): PaidModelGroup[] => {
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

const snapshotState = (snapshot: PaidPlanSnapshot): CatalogState => ({
  plans: (snapshot.plans ?? []).map(normalizePlan).filter((plan): plan is PaidPlan => plan !== null),
  groups: snapshot.model_groups ?? [],
});

const fetchLiveCatalog = async (): Promise<CatalogState> => {
  const headers = { Accept: "application/json", Authorization: `Bearer ${SITE_KEY}` };
  const [modelsRes, plansRes] = await Promise.all([
    fetch(CATALOG_ENDPOINT, { headers }),
    fetch(PLANS_ENDPOINT, { headers }),
  ]);
  if (!modelsRes.ok) throw new Error(`Paid catalog status ${modelsRes.status}`);
  if (!plansRes.ok) throw new Error(`Paid plans status ${plansRes.status}`);
  const [modelsPayload, plansPayload] = await Promise.all([modelsRes.json(), plansRes.json()]);
  const plans = (plansPayload?.data ?? modelsPayload?.plans ?? [])
    .map(normalizePlan)
    .filter((plan: PaidPlan | null): plan is PaidPlan => plan !== null);
  const groups = groupModels(
    (modelsPayload?.data ?? [])
      .map(normalizeModel)
      .filter((model: PaidModel | null): model is PaidModel => model !== null),
  );
  return {
    plans,
    groups,
  };
};

function PlanCard(props: {
  plan: PaidPlan;
  active: boolean;
  period?: string;
  onSelect: () => void;
}) {
  const copy = PLAN_COPY[props.plan.id] ?? {
    tag: "Paid plan",
    bestFor: props.plan.description ?? "Paid API access.",
    accent: "Request-unit pricing with a dedicated paid model catalog.",
  };
  return (
    <article class={`paid-plan-option${props.active ? " is-active" : ""}`}>
      <div class="paid-plan-option-top">
        <span class="pricing-route-pill">{copy.tag}</span>
        <span class="paid-plan-option-price">
          {formatPlanPrice(props.plan)}
          <small>{planPeriod(props.plan, props.period) ? ` / ${planPeriod(props.plan, props.period)}` : ""}</small>
        </span>
      </div>
      <h3>{props.plan.display_name}</h3>
      <p>{copy.bestFor}</p>
      <div class="paid-plan-stat-grid">
        <span>
          <strong>{formatNumber(props.plan.model_count ?? props.plan.models?.length ?? 0)}</strong>
          models
        </span>
        <span>
          <strong>{props.plan.concurrency_limit ?? "-"}</strong>
          concurrent
        </span>
      </div>
      <div class="paid-plan-limit-strip">
        <For each={limitEntries(props.plan).slice(0, 3)}>
          {(entry) => (
            <span>
              <strong>{formatNumber(entry.value.limit ?? 0)}</strong>
              {LIMIT_LABELS[entry.key] ?? entry.key}
            </span>
          )}
        </For>
      </div>
      <p class="paid-plan-option-note">{copy.accent}</p>
      <button
        type="button"
        class="paid-plan-select"
        onClick={props.onSelect}
        data-sound="interaction.tap"
      >
        {props.active ? "Selected" : `Compare ${props.plan.display_name}`}
      </button>
    </article>
  );
}

export default function PaidPlanExplorer(props: PaidPlanExplorerProps) {
  const initialCatalog = snapshotState(props.snapshot);
  const [catalog, setCatalog] = createSignal<CatalogState>(initialCatalog);
  const [selectedPlan, setSelectedPlan] = createSignal(initialCatalog.plans[0]?.id ?? PLAN_ORDER[0]);

  onMount(() => {
    fetchLiveCatalog()
      .then((next) => {
        setCatalog(next);
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.warn("Paid catalog refresh failed.", error);
      });
  });

  const plans = createMemo(() =>
    [...catalog().plans].sort((a, b) => {
      const ai = PLAN_ORDER.indexOf(a.id);
      const bi = PLAN_ORDER.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.display_name.localeCompare(b.display_name);
    }),
  );

  createEffect(() => {
    const ids = new Set(plans().map((plan) => plan.id));
    if (!ids.has(selectedPlan()) && plans().length > 0) setSelectedPlan(plans()[0].id);
  });

  const selected = createMemo(() => plans().find((plan) => plan.id === selectedPlan()) ?? plans()[0]);
  const selectedModelIds = createMemo(() => new Set(selected()?.models ?? []));
  const selectedModelCount = createMemo(() =>
    catalog().groups.reduce((total, group) =>
      total + group.models.filter((model) => (model.plans ?? []).includes(selectedPlan()) || selectedModelIds().has(model.id)).length,
      0,
    ),
  );
  const selectedMinCost = createMemo(() => {
    const costs = catalog().groups.flatMap((group) =>
      group.models
        .filter((model) => (model.plans ?? []).includes(selectedPlan()) || selectedModelIds().has(model.id))
        .map((model) => model.unit_cost),
    );
    return costs.length ? Math.min(...costs) : 0;
  });

  return (
    <div class="paid-plan-explorer">
      <section class="paid-plan-chooser shell" aria-labelledby="paid-plan-title">
        <div class="paid-plan-chooser-copy">
          <span class="eyebrow">Paid plans</span>
          <h2 id="paid-plan-title">Pick the lane that matches how you use the API.</h2>
          <Show
            when={plans().length > 1}
            fallback={<p>{selected()?.description ?? "Available paid plans use request units and refresh from the live paid API catalog."}</p>}
          >
            <p>
              Available plans use request units. Pick the lane that matches your client, context size,
              and usage pattern.
            </p>
          </Show>
        </div>

        <div class={`paid-plan-options${plans().length === 1 ? " is-single" : ""}`}>
          <For each={plans()}>
            {(plan) => (
              <PlanCard
                plan={plan}
                active={selectedPlan() === plan.id}
                period={props.snapshot.plan?.period}
                onSelect={() => setSelectedPlan(plan.id)}
              />
            )}
          </For>
        </div>
      </section>

      <section class="section shell pricing-section paid-selected-section">
        <div class="paid-selected-summary">
          <div>
            <span class="eyebrow">Selected plan</span>
            <h2>{selected()?.display_name ?? "Paid plan"}</h2>
            <p>{selected()?.description}</p>
          </div>
          <div class="paid-selected-metrics">
            <span>
              <strong>{formatNumber(selectedModelCount())}</strong>
              aliases
            </span>
            <span>
              <strong>{selectedMinCost() ? formatUnitCost(selectedMinCost()) : "-"}</strong>
              starting units
            </span>
            <span>
              <strong>{selected()?.concurrency_limit ?? "-"}</strong>
              concurrent
            </span>
          </div>
          <a class="primary-button pricing-plan-cta" href={props.discordUrl} target="_blank" rel="noreferrer">
            <span>Get a paid key</span>
            <span class="cta-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <PaidModelTable groups={catalog().groups} activePlan={selectedPlan()} />
      </section>
    </div>
  );
}
