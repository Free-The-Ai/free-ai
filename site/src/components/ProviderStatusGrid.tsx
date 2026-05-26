import {
    For,
    Show,
    createMemo,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import ProviderPopover from "./ProviderPopover";
import { siteConfig } from "../config/site";
import { formatPercent } from "../utils/format";

type ProviderStatus = "up" | "degraded" | "down" | "unknown";

export type ProviderHealth = {
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
};

type HealthPayload = {
    providers?: ProviderHealth[];
};

const providerOrder = [
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

const CSS = `
/* ── Grid ── */
.status-grid {
  align-items: start;
}

/* ── Status filter pills ── */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  box-shadow: var(--sk-inset-shadow);
  color: var(--muted);
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease, background 150ms ease, box-shadow 150ms ease;
}

.status-pill:hover:not(:disabled) {
  color: var(--text);
  border-color: rgba(255, 255, 255, 0.16);
}

.status-pill:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.status-pill:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.status-pill.is-up.is-active {
  border-color: rgba(46, 160, 67, 0.6);
  background: rgba(46, 160, 67, 0.12);
  color: #6fd585;
  box-shadow: var(--sk-inset-shadow), 0 0 0 1px rgba(46, 160, 67, 0.35);
}

.status-pill.is-degraded.is-active {
  border-color: rgba(217, 119, 6, 0.6);
  background: rgba(217, 119, 6, 0.12);
  color: var(--amber);
  box-shadow: var(--sk-inset-shadow), 0 0 0 1px rgba(217, 119, 6, 0.4);
}

.status-pill.is-down.is-active {
  border-color: rgba(255, 77, 77, 0.6);
  background: rgba(255, 77, 77, 0.12);
  color: var(--danger);
  box-shadow: var(--sk-inset-shadow), 0 0 0 1px rgba(255, 77, 77, 0.4);
}

/* ── Empty state when filter excludes all ── */
.status-grid-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 22px;
  border: 1px dashed var(--sk-border);
  border-radius: var(--radius);
  background: var(--sk-inset-bg);
  color: var(--muted);
  font-size: 0.9rem;
}

.status-grid-empty-clear {
  padding: 8px 12px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-shell-bg);
  color: var(--accent-text);
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}

.status-grid-empty-clear:hover {
  border-color: var(--accent);
  text-shadow: var(--accent-text-glow);
}

/* ── Card ── */
.status-card {
  position: relative;
  display: grid;
  gap: 18px;
  padding: 18px;
  min-height: 210px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius);
  background: var(--sk-shell-bg);
  box-shadow: var(--sk-raised-shadow);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.status-card:hover {
  box-shadow: var(--sk-raised-shadow), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.status-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -4px;
  border-radius: 4px;
}

.status-card.is-up {
  border-color: rgba(46, 160, 67, 0.3);
  box-shadow: var(--sk-raised-shadow), inset 2px 0 0 rgba(46, 160, 67, 0.7);
}
.status-card.is-degraded {
  border-color: rgba(217, 119, 6, 0.38);
  box-shadow: var(--sk-raised-shadow), inset 2px 0 0 rgba(217, 119, 6, 0.72);
}
.status-card.is-down {
  border-color: rgba(255, 77, 77, 0.38);
  box-shadow: var(--sk-raised-shadow), inset 2px 0 0 rgba(255, 77, 77, 0.72);
}

.status-card-top {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.status-card-top strong {
  font-size: 1rem;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status-card-top span:last-child {
  margin-left: auto;
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.status-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--dim);
  flex-shrink: 0;
}
.is-up .status-dot    { background: #2ea043; }
.is-degraded .status-dot { background: var(--amber); }
.is-down .status-dot  { background: var(--danger); }

.status-card-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.status-card-main span {
  font-family: var(--font-mono);
  font-size: clamp(1.55rem, 3vw, 2.15rem);
  line-height: 0.9;
  letter-spacing: -0.05em;
}
.status-card-main small {
  color: var(--muted);
  font-size: 0.82rem;
  flex-shrink: 0;
}

.status-card-blast-slot {
  min-height: 32px;
  display: flex;
  align-items: center;
}
.status-card-blast {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 500;
  max-width: 100%;
}
.status-card-blast strong {
  color: var(--text);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.is-degraded .status-card-blast {
  border-color: rgba(217, 119, 6, 0.35);
  color: var(--amber);
}
.is-down .status-card-blast {
  border-color: rgba(255, 77, 77, 0.35);
  color: var(--danger);
}

.status-card-meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  padding: 10px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  box-shadow: var(--sk-inset-shadow);
  color: var(--muted);
  font-size: 0.82rem;
}
.status-card-meta strong {
  color: var(--text);
  font-weight: 600;
}

/* Selected card */
.status-card.is-selected {
  z-index: 2;
  box-shadow: var(--sk-raised-shadow), 0 0 0 1px var(--accent), 0 0 18px rgba(238, 93, 32, 0.15);
}
.status-card.is-up.is-selected    { border-color: rgba(46, 160, 67, 0.5); }
.status-card.is-degraded.is-selected { border-color: rgba(217, 119, 6, 0.55); }
.status-card.is-down.is-selected  { border-color: rgba(255, 77, 77, 0.55); }

/* Mobile card adjustments */
@media (max-width: 640px) {
  .status-card {
    gap: 14px;
    padding: 16px;
    min-height: 190px;
  }
}
`;

// ── Helper functions ──

function StatusPills({ summary, statusFilter, toggleStatusFilter }: {
  summary: () => { up: number; degraded: number; down: number; total: number; modelsAffected: number };
  statusFilter: () => Set<ProviderStatus>;
  toggleStatusFilter: (status: ProviderStatus) => void;
}) {
  return (
    <div class="status-summary" role="group" aria-label="Filter providers by health">
      <button type="button" class={`status-pill is-up${statusFilter().has("up") ? " is-active" : ""}`}
        aria-pressed={statusFilter().has("up")} disabled={summary().up === 0}
        data-sound="interaction.toggle" onClick={() => toggleStatusFilter("up")}
      >{summary().up} up</button>
      <button type="button" class={`status-pill is-degraded${statusFilter().has("degraded") ? " is-active" : ""}`}
        aria-pressed={statusFilter().has("degraded")} disabled={summary().degraded === 0}
        data-sound="interaction.toggle" onClick={() => toggleStatusFilter("degraded")}
      >{summary().degraded} degraded</button>
      <button type="button" class={`status-pill is-down${statusFilter().has("down") ? " is-active" : ""}`}
        aria-pressed={statusFilter().has("down")} disabled={summary().down === 0}
        data-sound="interaction.toggle" onClick={() => toggleStatusFilter("down")}
      >{summary().down} down</button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div class="status-grid">
      <article class="status-card is-unknown" aria-live="polite">
        <div class="status-card-top">
          <span class="status-dot" />
          <strong>providers/</strong>
          <span>loading</span>
        </div>
        <div class="status-card-main">
          <span>...</span>
          <small>models</small>
        </div>
        <div class="status-card-blast-slot" />
        <div class="status-card-meta">
          <span>30m errors</span>
          <strong>...</strong>
          <span>requests</span>
          <strong>...</strong>
        </div>
      </article>
    </div>
  );
}

function StatusCard({ provider, isSelected, onSelect, closePopover }: {
  provider: ProviderHealth;
  isSelected: boolean;
  onSelect: () => void;
  closePopover: () => void;
}) {
  const isAffected = provider.status === "degraded" || provider.status === "down";
  const modelCount = provider.model_count;
  const showBlast = isAffected && modelCount > 0;
  const handleClick = () => (isSelected ? closePopover() : onSelect());
  return (
    <article
      class={`status-card is-${provider.status}${isSelected ? " is-selected" : ""}`}
      tabindex="0"
      role="button"
      aria-label={`${provider.prefix} provider status ${provider.status}`}
      data-sound="interaction.tap"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); }
      }}
    >
      <div class="status-card-top">
        <span class="status-dot" />
        <strong>{provider.prefix}/</strong>
        <span>{provider.status}</span>
      </div>
      <div class="status-card-main">
        <span>{modelCount.toLocaleString()}</span>
        <small>{modelCount === 1 ? "model" : "models"}</small>
      </div>
      <div class="status-card-blast-slot">
        {showBlast && (
          <span class="status-card-blast">
            {provider.status === "down" ? "Affected" : "At risk"}
            {" "}<strong>{modelCount.toLocaleString()}</strong>
            {" "}{modelCount === 1 ? "model" : "models"}
          </span>
        )}
      </div>
      <div class="status-card-meta">
        <span>30m errors</span>
        <strong>{formatPercent(provider.error_rate_30m)}</strong>
        <span>requests</span>
        <strong>{provider.requests_30m.toLocaleString()}</strong>
      </div>
    </article>
  );
}

export default function ProviderStatusGrid() {
    const [health, setHealth] = createSignal<HealthPayload | null>(null);
    const [loadedAt, setLoadedAt] = createSignal<Date | null>(null);
    const [failed, setFailed] = createSignal(false);
    const [selectedPrefix, setSelectedPrefix] = createSignal<string | null>(
        null,
    );
    const [statusFilter, setStatusFilter] = createSignal<Set<ProviderStatus>>(
        new Set(),
    );
    const toggleStatusFilter = (status: ProviderStatus) => {
        setStatusFilter((prev) => {
            const next = new Set(prev);
            if (next.has(status)) {
                next.delete(status);
            } else {
                next.add(status);
            }
            return next;
        });
    };
    let interval: number | undefined;

    const fetchHealth = async () => {
        try {
            const response = await fetch(`${siteConfig.socials.api}/v1/health`, { cache: "no-store" });
            if (!response.ok) throw new Error(`health ${response.status}`);
            setHealth(await response.json());
            setLoadedAt(new Date());
            setFailed(false);
        } catch (error) {
            console.error("Failed to load provider health", error);
            setFailed(true);
        }
    };

    onMount(() => {
        fetchHealth();
        interval = window.setInterval(fetchHealth, 30000);
    });

    onCleanup(() => {
        if (interval) window.clearInterval(interval);
    });

    const openPopover = (prefix: string) => {
        setSelectedPrefix(prefix);
    };

    const closePopover = () => {
        setSelectedPrefix(null);
    };

    /* ── Derived data ── */
    const providers = createMemo(() => {
        const items = [...(health()?.providers ?? [])];
        return items.sort((left, right) => {
            const leftIndex = providerOrder.indexOf(left.prefix);
            const rightIndex = providerOrder.indexOf(right.prefix);
            if (leftIndex !== -1 || rightIndex !== -1) {
                return (
                    (leftIndex === -1 ? 999 : leftIndex) -
                    (rightIndex === -1 ? 999 : rightIndex)
                );
            }
            return left.prefix.localeCompare(right.prefix);
        });
    });

    const filteredProviders = createMemo(() => {
        const filter = statusFilter();
        if (filter.size === 0) return providers();
        return providers().filter((provider) => filter.has(provider.status));
    });

    const summary = createMemo(() => {
        const items = providers();
        const degraded = items.filter((item) => item.status === "degraded");
        const down = items.filter((item) => item.status === "down");
        const up = items.filter((item) => item.status === "up");
        return {
            degraded: degraded.length,
            down: down.length,
            total: items.length,
            up: up.length,
            modelsAffected:
                degraded.reduce((sum, p) => sum + p.model_count, 0) +
                down.reduce((sum, p) => sum + p.model_count, 0),
        };
    });

    const selectedProvider = createMemo(() => {
        const prefix = selectedPrefix();
        if (!prefix) return null;
        return providers().find((p) => p.prefix === prefix) ?? null;
    });

    return (
        <div class="status-board">
            <style>{CSS}</style>

            <div class="status-board-head">
                <div>
                    <h1>Status</h1>
                </div>
                <StatusPills summary={summary} statusFilter={statusFilter} toggleStatusFilter={toggleStatusFilter} />
            </div>

            <Show when={failed()}>
                <div class="status-alert">
                    Health data did not load. Retrying automatically.
                </div>
            </Show>

            <Show
                when={providers().length > 0}
                fallback={<SkeletonCard />}
            >
                <div class="status-grid">
                    <Show
                        when={filteredProviders().length > 0}
                        fallback={
                            <div class="status-grid-empty">
                                No providers match the selected status.
                                <button
                                    type="button"
                                    class="status-grid-empty-clear"
                                    data-sound="interaction.subtle"
                                    onClick={() =>
                                        setStatusFilter(new Set())
                                    }
                                >
                                    Clear filter
                                </button>
                            </div>
                        }
                    >
                        <For each={filteredProviders()}>
                            {(provider) => (
                                <StatusCard
                                    provider={provider}
                                    isSelected={selectedPrefix() === provider.prefix}
                                    onSelect={() => openPopover(provider.prefix)}
                                    closePopover={closePopover}
                                />
                            )}
                        </For>
                    </Show>
                </div>
            </Show>

            {/* ═══ Popover ═══ */}
            <Show when={selectedProvider()}>
                {(provider) => (
                    <ProviderPopover
                        provider={provider()}
                        onClose={closePopover}
                    />
                )}
            </Show>

            <div class="status-footnote">
                Updated{" "}
                {loadedAt()
                    ? loadedAt()!.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "..."}
                .
            </div>
        </div>
    );
}

