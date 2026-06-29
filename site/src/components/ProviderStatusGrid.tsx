import { useEffect, useMemo, useState } from "react";
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

type Summary = {
    up: number;
    degraded: number;
    down: number;
    total: number;
    modelsAffected: number;
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

// ── Helper components ──

function StatusPills({ summary, statusFilter, toggleStatusFilter }: {
  summary: Summary;
  statusFilter: Set<ProviderStatus>;
  toggleStatusFilter: (status: ProviderStatus) => void;
}) {
  return (
    <div className="status-summary" role="group" aria-label="Filter providers by health">
      <button type="button" className={`status-pill is-up${statusFilter.has("up") ? " is-active" : ""}`}
        aria-pressed={statusFilter.has("up")} disabled={summary.up === 0}
        data-sound="interaction.toggle" onClick={() => toggleStatusFilter("up")}
      >{summary.up} up</button>
      <button type="button" className={`status-pill is-degraded${statusFilter.has("degraded") ? " is-active" : ""}`}
        aria-pressed={statusFilter.has("degraded")} disabled={summary.degraded === 0}
        data-sound="interaction.toggle" onClick={() => toggleStatusFilter("degraded")}
      >{summary.degraded} degraded</button>
      <button type="button" className={`status-pill is-down${statusFilter.has("down") ? " is-active" : ""}`}
        aria-pressed={statusFilter.has("down")} disabled={summary.down === 0}
        data-sound="interaction.toggle" onClick={() => toggleStatusFilter("down")}
      >{summary.down} down</button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="status-grid">
      <article className="status-card is-unknown" aria-live="polite">
        <div className="status-card-top">
          <span className="status-dot" />
          <strong>providers/</strong>
          <span>loading</span>
        </div>
        <div className="status-card-main">
          <span>...</span>
          <small>models</small>
        </div>
        <div className="status-card-blast-slot" />
        <div className="status-card-meta">
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
      className={`status-card is-${provider.status}${isSelected ? " is-selected" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`${provider.prefix} provider status ${provider.status}`}
      data-sound="interaction.tap"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); }
      }}
    >
      <div className="status-card-top">
        <span className="status-dot" />
        <strong>{provider.prefix}/</strong>
        <span>{provider.status}</span>
      </div>
      <div className="status-card-main">
        <span>{modelCount.toLocaleString()}</span>
        <small>{modelCount === 1 ? "model" : "models"}</small>
      </div>
      <div className="status-card-blast-slot">
        {showBlast && (
          <span className="status-card-blast">
            {provider.status === "down" ? "Affected" : "At risk"}
            {" "}<strong>{modelCount.toLocaleString()}</strong>
            {" "}{modelCount === 1 ? "model" : "models"}
          </span>
        )}
      </div>
      <div className="status-card-meta">
        <span>30m errors</span>
        <strong>{formatPercent(provider.error_rate_30m)}</strong>
        <span>requests</span>
        <strong>{provider.requests_30m.toLocaleString()}</strong>
      </div>
    </article>
  );
}

export default function ProviderStatusGrid() {
    const [health, setHealth] = useState<HealthPayload | null>(null);
    const [loadedAt, setLoadedAt] = useState<Date | null>(null);
    const [failed, setFailed] = useState(false);
    const [selectedPrefix, setSelectedPrefix] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<Set<ProviderStatus>>(new Set());

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

    useEffect(() => {
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

        fetchHealth();
        const interval = window.setInterval(fetchHealth, 30000);
        return () => window.clearInterval(interval);
    }, []);

    const openPopover = (prefix: string) => {
        setSelectedPrefix(prefix);
    };

    const closePopover = () => {
        setSelectedPrefix(null);
    };

    /* ── Derived data ── */
    const providers = useMemo(() => {
        const items = [...(health?.providers ?? [])];
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
    }, [health]);

    const filteredProviders = useMemo(() => {
        if (statusFilter.size === 0) return providers;
        return providers.filter((provider) => statusFilter.has(provider.status));
    }, [providers, statusFilter]);

    const summary = useMemo<Summary>(() => {
        const degraded = providers.filter((item) => item.status === "degraded");
        const down = providers.filter((item) => item.status === "down");
        const up = providers.filter((item) => item.status === "up");
        return {
            degraded: degraded.length,
            down: down.length,
            total: providers.length,
            up: up.length,
            modelsAffected:
                degraded.reduce((sum, p) => sum + p.model_count, 0) +
                down.reduce((sum, p) => sum + p.model_count, 0),
        };
    }, [providers]);

    const selectedProvider = useMemo(() => {
        if (!selectedPrefix) return null;
        return providers.find((p) => p.prefix === selectedPrefix) ?? null;
    }, [selectedPrefix, providers]);

    return (
        <div className="status-board">
            <div className="status-board-head">
                <div>
                    <h1>Status</h1>
                </div>
                <StatusPills summary={summary} statusFilter={statusFilter} toggleStatusFilter={toggleStatusFilter} />
            </div>

            {failed && (
                <div className="status-alert">
                    Health data did not load. Retrying automatically.
                </div>
            )}

            {providers.length > 0 ? (
                <div className="status-grid">
                    {filteredProviders.length > 0 ? (
                        filteredProviders.map((provider) => (
                            <StatusCard
                                key={provider.prefix}
                                provider={provider}
                                isSelected={selectedPrefix === provider.prefix}
                                onSelect={() => openPopover(provider.prefix)}
                                closePopover={closePopover}
                            />
                        ))
                    ) : (
                        <div className="status-grid-empty">
                            No providers match the selected status.
                            <button
                                type="button"
                                className="status-grid-empty-clear"
                                data-sound="interaction.subtle"
                                onClick={() => setStatusFilter(new Set())}
                            >
                                Clear filter
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <SkeletonCard />
            )}

            {/* ═══ Popover ═══ */}
            {selectedProvider && (
                <ProviderPopover
                    provider={selectedProvider}
                    onClose={closePopover}
                />
            )}

            <div className="status-footnote">
                Updated{" "}
                {loadedAt
                    ? loadedAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "..."}
                .
            </div>
        </div>
    );
}
