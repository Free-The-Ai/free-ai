import { useEffect, useMemo, useState } from "react";
import ProviderPopover from "./ProviderPopover";
import { TextField, Menu } from "./ui";
import { CheckmarkIcon } from "./ui/icons";
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

const STATUS_OPTIONS: ProviderStatus[] = ["up", "degraded", "down"];
const STATUS_LABELS: Record<ProviderStatus, string> = {
    up: "Up",
    degraded: "Degraded",
    down: "Down",
    unknown: "Unknown",
};

function FilterCheckbox({ checked, onToggle, label, count }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
    count?: number;
}) {
    return (
        <Menu.CheckboxItem
            className={`catalog-filter-menu-item${checked ? " is-active" : ""}`}
            checked={checked}
            onCheckedChange={() => onToggle()}
            data-sound="interaction.toggle"
        >
            <Menu.CheckboxItemIndicator className="catalog-filter-checkbox">
                <CheckmarkIcon />
            </Menu.CheckboxItemIndicator>
            <span className="catalog-filter-option-name">{label}</span>
            {count !== undefined && <span className="catalog-filter-option-count">{count}</span>}
        </Menu.CheckboxItem>
    );
}

function StatusFiltersToolbar(props: {
    query: string;
    setQuery: (v: string) => void;
    prefixFilters: Set<string>;
    togglePrefix: (p: string) => void;
    prefixCounts: [string, number][];
    statusFilter: Set<ProviderStatus>;
    toggleStatus: (s: ProviderStatus) => void;
    statusCounts: Record<ProviderStatus, number>;
    prefixButtonLabel: string;
    statusButtonLabel: string;
}) {
    return (
        <div className="catalog-toolbar">
            <div className="catalog-search-field">
                <span className="material-symbols-outlined catalog-search-icon">search</span>
                <TextField
                    className="catalog-search-input"
                    value={props.query}
                    placeholder="Search providers..."
                    onChange={(v: string) => props.setQuery(v)}
                />
            </div>
            <div className="catalog-filter-group" aria-label="Provider filters">
                <Menu.Root>
                    <Menu.Trigger className={`catalog-filter-trigger${props.prefixFilters.size > 0 ? " is-active" : ""}`} sound="overlay.expand">
                        <span className="catalog-filter-label">Prefix</span>
                        <span className="catalog-filter-value">{props.prefixButtonLabel}</span>
                        {props.prefixFilters.size > 0 && <span className="catalog-filter-count">{props.prefixFilters.size}</span>}
                    </Menu.Trigger>
                    <Menu.Content side="bottom" align="start" className="catalog-filter-content">
                        <Menu.Group>
                            {props.prefixCounts.map(([pfx, count]) => (
                                <FilterCheckbox
                                    key={pfx}
                                    checked={props.prefixFilters.has(pfx)}
                                    onToggle={() => props.togglePrefix(pfx)}
                                    label={`${pfx}/*`}
                                    count={count}
                                />
                            ))}
                        </Menu.Group>
                    </Menu.Content>
                </Menu.Root>
                <Menu.Root>
                    <Menu.Trigger className={`catalog-filter-trigger${props.statusFilter.size > 0 ? " is-active" : ""}`} sound="overlay.expand">
                        <span className="catalog-filter-label">Status</span>
                        <span className="catalog-filter-value">{props.statusButtonLabel}</span>
                        {props.statusFilter.size > 0 && <span className="catalog-filter-count">{props.statusFilter.size}</span>}
                    </Menu.Trigger>
                    <Menu.Content side="bottom" align="start" className="catalog-filter-content">
                        <Menu.Group>
                            {STATUS_OPTIONS.map((status) => (
                                <FilterCheckbox
                                    key={status}
                                    checked={props.statusFilter.has(status)}
                                    onToggle={() => props.toggleStatus(status)}
                                    label={STATUS_LABELS[status]}
                                    count={props.statusCounts[status]}
                                />
                            ))}
                        </Menu.Group>
                    </Menu.Content>
                </Menu.Root>
            </div>
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
    const [query, setQuery] = useState("");
    const [prefixFilters, setPrefixFilters] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<Set<ProviderStatus>>(new Set());

    const togglePrefix = (prefix: string) => {
        setPrefixFilters((prev) => {
            const next = new Set(prev);
            if (next.has(prefix)) next.delete(prefix);
            else next.add(prefix);
            return next;
        });
    };

    const toggleStatus = (status: ProviderStatus) => {
        setStatusFilter((prev) => {
            const next = new Set(prev);
            if (next.has(status)) next.delete(status);
            else next.add(status);
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

    const prefixCounts = useMemo(() => {
        const m = new Map<string, number>();
        for (const { prefix } of providers) m.set(prefix, (m.get(prefix) ?? 0) + 1);
        return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [providers]);

    const statusCounts = useMemo(() => {
        const counts: Record<ProviderStatus, number> = { up: 0, degraded: 0, down: 0, unknown: 0 };
        for (const p of providers) counts[p.status]++;
        return counts;
    }, [providers]);

    const filteredProviders = useMemo(() => {
        let items = providers;
        const q = query.trim().toLowerCase();
        if (q) items = items.filter((p) => p.prefix.toLowerCase().includes(q));
        if (prefixFilters.size > 0) items = items.filter((p) => prefixFilters.has(p.prefix));
        if (statusFilter.size > 0) items = items.filter((p) => statusFilter.has(p.status));
        return items;
    }, [providers, query, prefixFilters, statusFilter]);

    const selectedProvider = useMemo(() => {
        if (!selectedPrefix) return null;
        return providers.find((p) => p.prefix === selectedPrefix) ?? null;
    }, [selectedPrefix, providers]);

    const prefixButtonLabel = () => {
        if (prefixFilters.size === 0) return "All prefixes";
        if (prefixFilters.size === 1) return `${[...prefixFilters][0]}/*`;
        return `${prefixFilters.size} prefixes`;
    };

    const statusButtonLabel = () => {
        if (statusFilter.size === 0) return "All statuses";
        if (statusFilter.size === 1) return STATUS_LABELS[[...statusFilter][0]];
        return `${statusFilter.size} statuses`;
    };

    const filtersActive = query.trim() !== "" || prefixFilters.size > 0 || statusFilter.size > 0;

    const resultLabel = () => {
        const count = filteredProviders.length;
        const plural = count === 1 ? "provider" : "providers";
        const prefixLabel = prefixFilters.size === 0
            ? "all prefixes"
            : prefixFilters.size === 1
            ? `${[...prefixFilters][0]}/*`
            : `${prefixFilters.size} prefixes`;
        return `${count.toLocaleString()} ${plural} across ${prefixLabel}`;
    };

    const clearFilters = () => {
        setQuery("");
        setPrefixFilters(new Set());
        setStatusFilter(new Set());
    };

    return (
        <div className="status-board">
            <div className="status-board-head">
                <div>
                    <h1>Status</h1>
                </div>
            </div>

            {failed && (
                <div className="status-alert">
                    Health data did not load. Retrying automatically.
                </div>
            )}

            {providers.length > 0 ? (
                <>
                    <StatusFiltersToolbar
                        query={query}
                        setQuery={setQuery}
                        prefixFilters={prefixFilters}
                        togglePrefix={togglePrefix}
                        prefixCounts={prefixCounts}
                        statusFilter={statusFilter}
                        toggleStatus={toggleStatus}
                        statusCounts={statusCounts}
                        prefixButtonLabel={prefixButtonLabel()}
                        statusButtonLabel={statusButtonLabel()}
                    />

                    <div className="catalog-summary" aria-live="polite">
                        <span>{resultLabel()}</span>
                        {filtersActive && (
                            <button type="button" onClick={clearFilters} data-sound="interaction.subtle">
                                Clear filters
                            </button>
                        )}
                    </div>

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
                                No providers match your filters.
                                <button
                                    type="button"
                                    className="status-grid-empty-clear"
                                    data-sound="interaction.subtle"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <SkeletonCard />
            )}

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
