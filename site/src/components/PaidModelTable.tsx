import { createMemo, createSignal, For, Show } from "solid-js";
import { TextField } from "./ui";

interface PaidModel {
  id: string;
  unit_cost: number;
  unit_label: string;
  route: string;
}

interface PaidModelGroup {
  id: string;
  label: string;
  description: string;
  models: PaidModel[];
}

interface PaidModelTableProps {
  groups: PaidModelGroup[];
}

interface Row extends PaidModel {
  prefix: string;
  groupLabel: string;
}

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
const formatCost = (cost: number) => Number.isInteger(cost) ? String(cost) : String(cost);

export default function PaidModelTable(props: PaidModelTableProps) {
  const [query, setQuery] = createSignal("");
  const [prefix, setPrefix] = createSignal("all");
  const [route, setRoute] = createSignal("all");
  const [cost, setCost] = createSignal("all");

  const rows = createMemo<Row[]>(() =>
    props.groups.flatMap((group) =>
      group.models.map((model) => ({
        ...model,
        prefix: group.id,
        groupLabel: group.label,
      })),
    ),
  );

  const prefixCounts = createMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows()) counts.set(row.prefix, (counts.get(row.prefix) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => collator.compare(a[0], b[0]));
  });

  const routeCounts = createMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows()) counts.set(row.route, (counts.get(row.route) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => collator.compare(a[0], b[0]));
  });

  const costCounts = createMemo(() => {
    const counts = new Map<number, number>();
    for (const row of rows()) counts.set(row.unit_cost, (counts.get(row.unit_cost) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0] - b[0]);
  });

  const filteredRows = createMemo(() => {
    const q = query().trim().toLowerCase();
    return rows()
      .filter((row) => prefix() === "all" || row.prefix === prefix())
      .filter((row) => route() === "all" || row.route === route())
      .filter((row) => cost() === "all" || row.unit_cost === Number(cost()))
      .filter((row) => !q || row.id.toLowerCase().includes(q))
      .sort((a, b) => a.unit_cost - b.unit_cost || collator.compare(a.id, b.id));
  });

  const clearFilters = () => {
    setQuery("");
    setPrefix("all");
    setRoute("all");
    setCost("all");
  };

  const copyModel = (id: string, button: HTMLButtonElement) => {
    navigator.clipboard.writeText(id).catch((error) => {
      console.error("Failed to copy paid model alias", error);
    });
    const icon = button.querySelector(".material-symbols-outlined");
    if (!icon) return;
    icon.textContent = "check";
    setTimeout(() => {
      icon.textContent = "content_copy";
    }, 1500);
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
          <div class="catalog-prefixes">
            <button class={`catalog-chip ${prefix() === "all" ? "is-active" : ""}`} onClick={() => setPrefix("all")}>
              All prefixes
            </button>
            <For each={prefixCounts()}>
              {([id, count]) => (
                <button class={`catalog-chip ${prefix() === id ? "is-active" : ""}`} onClick={() => setPrefix(id)}>
                  {id}/* <span>{count}</span>
                </button>
              )}
            </For>
          </div>
          <div class="catalog-prefixes">
            <button class={`catalog-chip ${route() === "all" ? "is-active" : ""}`} onClick={() => setRoute("all")}>
              All routes
            </button>
            <For each={routeCounts()}>
              {([name, count]) => (
                <button class={`catalog-chip ${route() === name ? "is-active" : ""}`} onClick={() => setRoute(name)}>
                  {name} <span>{count}</span>
                </button>
              )}
            </For>
          </div>
          <div class="catalog-prefixes">
            <button class={`catalog-chip ${cost() === "all" ? "is-active" : ""}`} onClick={() => setCost("all")}>
              All costs
            </button>
            <For each={costCounts()}>
              {([amount, count]) => (
                <button class={`catalog-chip ${cost() === String(amount) ? "is-active" : ""}`} onClick={() => setCost(String(amount))}>
                  {formatCost(amount)}u <span>{count}</span>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      <div class="catalog-summary paid-table-summary" aria-live="polite">
        <span>{filteredRows().length} / {rows().length} paid aliases</span>
        <Show when={query().trim() || prefix() !== "all" || route() !== "all" || cost() !== "all"}>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </Show>
      </div>

      <div class="paid-model-table" role="table" aria-label="Paid model unit costs">
        <div class="paid-model-row paid-model-row-head" role="row">
          <span>Model</span>
          <span>Prefix</span>
          <span>Route</span>
          <span>Unit cost</span>
          <span>Copy</span>
        </div>
        <Show
          when={filteredRows().length > 0}
          fallback={<div class="paid-model-empty">No paid aliases match your filters.</div>}
        >
          <For each={filteredRows()}>
            {(model) => (
              <div class="paid-model-row" role="row">
                <span class="paid-model-name">
                  <code>{model.id}</code>
                </span>
                <span class="pricing-route-pill">{model.prefix}/*</span>
                <span class="pricing-route-pill">{model.route}</span>
                <strong>{model.unit_label}</strong>
                <button
                  class="copy-btn pricing-model-copy"
                  type="button"
                  title={`Copy ${model.id}`}
                  onClick={(event) => copyModel(model.id, event.currentTarget)}
                >
                  <code class="sr-only">{model.id}</code>
                  <span class="material-symbols-outlined">content_copy</span>
                </button>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}
