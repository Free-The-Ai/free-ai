import { createMemo, createSignal, For, Show } from "solid-js";
import { Select, TextField } from "./ui";
import { formatTokens, siteModelContextWindow } from "../utils/format";
import type { SelectOption } from "./ui";

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

interface PaidModelTableProps {
  groups: PaidModelGroup[];
  activePlan?: string;
}

interface Row extends PaidModel {
  prefix: string;
  groupLabel: string;
}

function computeCounts<T>(
  rows: Row[],
  keyFn: (r: Row) => T,
  sortFn: (a: [T, number], b: [T, number]) => number,
): [T, number][] {
  const counts = new Map<T, number>();
  for (const row of rows) counts.set(keyFn(row), (counts.get(keyFn(row)) ?? 0) + 1);
  return [...counts.entries()].sort(sortFn);
}

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
const formatCost = (cost: number) => Number.isInteger(cost) ? String(cost) : String(cost);

// ── Paid Model Row sub-component ──

function PaidModelRow({ model }: { model: PaidModel }) {
  const ctx = siteModelContextWindow(model);
  const out = model.max_output_tokens;
  const hasMeta = ctx > 0 || out !== undefined || model.supports_images || model.supports_tool_call || model.supports_response_schema;
  const copyModel = (button: HTMLButtonElement) => {
    navigator.clipboard.writeText(model.id).catch((error) => {
      console.error("Failed to copy paid model alias", error);
    });
    const icon = button.querySelector(".material-symbols-outlined");
    if (!icon) return;
    icon.textContent = "check";
    setTimeout(() => { icon.textContent = "content_copy"; }, 1500);
  };
  return (
    <div class="paid-model-row" role="row">
      <span class="paid-model-name">
        <code>{model.id}</code>
        {hasMeta && (
          <span class="paid-model-meta">
            {ctx > 0 && (
              <span class="model-chip" title="Total context window">
                <span class="model-chip-label">Ctx</span>
                <strong>{formatTokens(ctx)}</strong>
              </span>
            )}
            {out !== undefined && (
              <span class="model-chip" title="Maximum output tokens">
                <span class="model-chip-label">Out</span>
                <strong>{formatTokens(out)}</strong>
              </span>
            )}
            {model.supports_images && (
              <span class="model-chip is-images" title="Supports image inputs or generation">
                <span class="material-symbols-outlined model-chip-icon" aria-hidden="true">image</span>
                Images
              </span>
            )}
            {model.supports_tool_call && (
              <span class="model-chip" title="Supports tool calling">
                <span class="model-chip-label">Tools</span>
              </span>
            )}
            {model.supports_response_schema && (
              <span class="model-chip" title="Supports structured response schemas">
                <span class="model-chip-label">JSON</span>
              </span>
            )}
          </span>
        )}
      </span>
      <span class="pricing-route-pill">{model.prefix}/*</span>
      <span class="pricing-route-pill">{model.route}</span>
      <span class="paid-model-plans">
        {(model.plans ?? []).map((plan) => (
          <span class="pricing-route-pill">{plan}</span>
        ))}
      </span>
      <strong>{model.unit_label}</strong>
      <button class="copy-btn pricing-model-copy" type="button" title={`Copy ${model.id}`}
        onClick={(event) => copyModel(event.currentTarget)}>
        <code class="sr-only">{model.id}</code>
        <span class="material-symbols-outlined">content_copy</span>
      </button>
    </div>
  );
}

export default function PaidModelTable(props: PaidModelTableProps) {
  const [query, setQuery] = createSignal("");
  const [prefix, setPrefix] = createSignal("all");
  const [route, setRoute] = createSignal("all");
  const [cost, setCost] = createSignal("all");

  const rows = createMemo<Row[]>(() =>
    props.groups.flatMap((group) =>
      group.models
        .filter((model) => !props.activePlan || (model.plans ?? []).includes(props.activePlan))
        .map((model) => ({
          ...model,
          prefix: group.id,
          groupLabel: group.label,
        })),
    ),
  );

  const prefixCounts = createMemo(() => computeCounts(rows(), (r) => r.prefix, (a, b) => collator.compare(a[0] as string, b[0] as string)));
  const routeCounts = createMemo(() => computeCounts(rows(), (r) => r.route, (a, b) => collator.compare(a[0] as string, b[0] as string)));
  const costCounts = createMemo(() => computeCounts(rows(), (r) => r.unit_cost, (a, b) => (a[0] as number) - (b[0] as number)));

  const filteredRows = createMemo(() => {
    const q = query().trim().toLowerCase();
    return rows()
      .filter((row) => prefix() === "all" || row.prefix === prefix())
      .filter((row) => route() === "all" || row.route === route())
      .filter((row) => cost() === "all" || row.unit_cost === Number(cost()))
      .filter((row) => !q || row.id.toLowerCase().includes(q))
      .sort((a, b) => a.unit_cost - b.unit_cost || collator.compare(a.id, b.id));
  });

  const prefixOptions = createMemo<SelectOption[]>(() => [
    { value: "all", label: `All prefixes · ${rows().length}` },
    ...prefixCounts().map(([id, count]) => ({
      value: id,
      label: `${id}/* · ${count}`,
    })),
  ]);

  const routeOptions = createMemo<SelectOption[]>(() => [
    { value: "all", label: `All routes · ${rows().length}` },
    ...routeCounts().map(([name, count]) => ({
      value: name,
      label: `${name} · ${count}`,
    })),
  ]);

  const costOptions = createMemo<SelectOption[]>(() => [
    { value: "all", label: `All costs · ${rows().length}` },
    ...costCounts().map(([amount, count]) => ({
      value: String(amount),
      label: `${formatCost(amount)} unit${amount === 1 ? "" : "s"} · ${count}`,
    })),
  ]);

  const clearFilters = () => {
    setQuery("");
    setPrefix("all");
    setRoute("all");
    setCost("all");
  };

  return (
    <div class="paid-table-panel">
      <div class="paid-table-toolbar">
        <div class="catalog-search-field paid-table-search">
          <span class="material-symbols-outlined catalog-search-icon">search</span>
          <TextField
            class="catalog-search-input"
            value={query()}
            placeholder="Search paid aliases..."
            onChange={(value: string) => setQuery(value)}
          />
        </div>
        <div class="paid-table-filters" aria-label="Paid model filters">
          <Select
            class="paid-filter-select"
            options={prefixOptions()}
            value={prefix()}
            onChange={(val: string) => setPrefix(val ?? "all")}
            placeholder="All prefixes"
          />
          <Select
            class="paid-filter-select"
            options={routeOptions()}
            value={route()}
            onChange={(val: string) => setRoute(val ?? "all")}
            placeholder="All routes"
          />
          <Select
            class="paid-filter-select"
            options={costOptions()}
            value={cost()}
            onChange={(val: string) => setCost(val ?? "all")}
            placeholder="All costs"
          />
          <Show when={query().trim() || prefix() !== "all" || route() !== "all" || cost() !== "all"}>
            <button type="button" class="paid-filter-clear" onClick={clearFilters} data-sound="interaction.subtle">
              Clear
            </button>
          </Show>
        </div>
      </div>

      <div class="catalog-summary paid-table-summary" aria-live="polite">
        <span>{filteredRows().length} / {rows().length} paid aliases</span>
      </div>

      <div class="paid-model-table" role="table" aria-label="Paid model unit costs">
        <div class="paid-model-row paid-model-row-head" role="row">
          <span>Model</span>
          <span>Prefix</span>
          <span>Route</span>
          <span>Plan</span>
          <span>Unit cost</span>
          <span>Copy</span>
        </div>
        <Show
          when={filteredRows().length > 0}
          fallback={<div class="paid-model-empty">No paid aliases match your filters.</div>}
        >
          <For each={filteredRows()}>
            {(model) => <PaidModelRow model={model} />}
          </For>
        </Show>
      </div>
    </div>
  );
}
