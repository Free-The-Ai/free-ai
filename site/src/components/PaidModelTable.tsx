import { useState, useMemo, useCallback } from "react";
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

function PaidModelRow({ model }: { model: PaidModel }) {
  const ctx = siteModelContextWindow(model);
  const out = model.max_output_tokens;
  const hasMeta = ctx > 0 || out !== undefined || model.supports_images;
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
    <div className="paid-model-row" role="row">
      <span className="paid-model-name" data-label="Model">
        <code>{model.id}</code>
        {hasMeta && (
          <span className="paid-model-meta">
            {ctx > 0 && (
              <span className="model-chip" title="Total context window">
                <span className="model-chip-label">Ctx</span>
                <strong>{formatTokens(ctx)}</strong>
              </span>
            )}
            {out !== undefined && (
              <span className="model-chip" title="Maximum output tokens">
                <span className="model-chip-label">Out</span>
                <strong>{formatTokens(out)}</strong>
              </span>
            )}
            {model.supports_images && (
              <span className="model-chip is-images" title="Supports image inputs or generation">
                <span className="material-symbols-outlined model-chip-icon" aria-hidden="true">image</span>
                Images
              </span>
            )}

          </span>
        )}
      </span>
      <span className="pricing-route-pill" data-label="Prefix">{model.prefix}/*</span>
      <span className="pricing-route-pill" data-label="Route">{model.route}</span>
      <span className="paid-model-plans" data-label="Plan">
        {(model.plans ?? []).map((plan) => (
          <span key={plan} className="pricing-route-pill">{plan}</span>
        ))}
      </span>
      <strong data-label="Unit cost">{model.unit_label}</strong>
      <button className="copy-btn pricing-model-copy" type="button" title={`Copy ${model.id}`} data-label="Copy"
        onClick={(event) => copyModel(event.currentTarget)}>
        <code className="sr-only">{model.id}</code>
        <span className="material-symbols-outlined">content_copy</span>
      </button>
    </div>
  );
}

export default function PaidModelTable(props: PaidModelTableProps) {
  const [query, setQuery] = useState("");
  const [prefix, setPrefix] = useState("all");
  const [route, setRoute] = useState("all");
  const [cost, setCost] = useState("all");

  const rows = useMemo<Row[]>(() =>
    props.groups.flatMap((group) =>
      group.models
        .filter((model) => !props.activePlan || (model.plans ?? []).includes(props.activePlan))
        .map((model) => ({
          ...model,
          prefix: group.id,
          groupLabel: group.label,
        })),
    ),
  [props.groups, props.activePlan]);

  const prefixCounts = useMemo(() => computeCounts(rows, (r) => r.prefix, (a, b) => collator.compare(a[0] as string, b[0] as string)), [rows]);
  const routeCounts = useMemo(() => computeCounts(rows, (r) => r.route, (a, b) => collator.compare(a[0] as string, b[0] as string)), [rows]);
  const costCounts = useMemo(() => computeCounts(rows, (r) => r.unit_cost, (a, b) => (a[0] as number) - (b[0] as number)), [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => prefix === "all" || row.prefix === prefix)
      .filter((row) => route === "all" || row.route === route)
      .filter((row) => cost === "all" || row.unit_cost === Number(cost))
      .filter((row) => !q || row.id.toLowerCase().includes(q))
      .sort((a, b) => a.unit_cost - b.unit_cost || collator.compare(a.id, b.id));
  }, [rows, query, prefix, route, cost]);

  const prefixOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: `All prefixes · ${rows.length}` },
    ...prefixCounts.map(([id, count]) => ({
      value: id,
      label: `${id}/* · ${count}`,
    })),
  ], [prefixCounts, rows.length]);

  const routeOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: `All routes · ${rows.length}` },
    ...routeCounts.map(([name, count]) => ({
      value: name,
      label: `${name} · ${count}`,
    })),
  ], [routeCounts, rows.length]);

  const costOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: `All costs · ${rows.length}` },
    ...costCounts.map(([amount, count]) => ({
      value: String(amount),
      label: `${formatCost(amount)} unit${amount === 1 ? "" : "s"} · ${count}`,
    })),
  ], [costCounts, rows.length]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setPrefix("all");
    setRoute("all");
    setCost("all");
  }, []);

  const filtersActive = query.trim() !== "" || prefix !== "all" || route !== "all" || cost !== "all";
  const resultLabel = () => {
    const count = filteredRows.length;
    const plural = count === 1 ? "paid alias" : "paid aliases";
    return `${count.toLocaleString()} ${plural} across ${props.activePlan ? props.activePlan : "all plans"}`;
  };

  return (
    <div className="paid-table-panel">
      <div className="catalog-toolbar">
        <div className="catalog-search-field">
          <span className="material-symbols-outlined catalog-search-icon">search</span>
          <TextField
            className="catalog-search-input"
            value={query}
            placeholder="Search paid aliases..."
            onChange={(value: string) => setQuery(value)}
          />
        </div>
        <div className="catalog-filter-group" aria-label="Paid model filters">
          <Select
            className="catalog-filter-trigger"
            label="Prefix"
            options={prefixOptions}
            value={prefix}
            onChange={(val: string) => setPrefix(val ?? "all")}
            placeholder="All prefixes"
          />
          <Select
            className="catalog-filter-trigger"
            label="Route"
            options={routeOptions}
            value={route}
            onChange={(val: string) => setRoute(val ?? "all")}
            placeholder="All routes"
          />
          <Select
            className="catalog-filter-trigger"
            label="Cost"
            options={costOptions}
            value={cost}
            onChange={(val: string) => setCost(val ?? "all")}
            placeholder="All costs"
          />
        </div>
      </div>

      <div className="catalog-summary" aria-live="polite">
        <span>{resultLabel()}</span>
        {filtersActive && (
          <button type="button" onClick={clearFilters} data-sound="interaction.subtle">
            Clear filters
          </button>
        )}
      </div>

      <div className="paid-model-table" role="table" aria-label="Paid model unit costs">
        <div className="paid-model-row paid-model-row-head" role="row">
          <span data-label="Model">Model</span>
          <span data-label="Prefix">Prefix</span>
          <span data-label="Route">Route</span>
          <span data-label="Plan">Plan</span>
          <span data-label="Unit cost">Unit cost</span>
          <span data-label="Copy">Copy</span>
        </div>
        {filteredRows.length > 0 ? (
          filteredRows.map((model) => <PaidModelRow key={model.id} model={model} />)
        ) : (
          <div className="paid-model-empty">No paid aliases match your filters.</div>
        )}
      </div>
    </div>
  );
}
