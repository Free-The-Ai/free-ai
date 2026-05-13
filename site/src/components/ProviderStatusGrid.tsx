import {
    For,
    Show,
    createMemo,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import { siteConfig } from "../config/site";

type ProviderStatus = "up" | "degraded" | "down" | "unknown";

type ProviderHealth = {
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
/* ── Prevent grid row siblings from stretching when one card expands ── */
.status-grid {
  align-items: start;
}

/* ── Affordance: card is clickable ── */
.status-card.is-expandable {
  cursor: pointer;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.status-card.is-expandable:hover {
  box-shadow: var(--sk-raised-shadow), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.status-card.is-expandable:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ── Von Restorff Effect: expanded card stands out ── */
.status-card.is-expanded {
  box-shadow:
    var(--sk-raised-shadow),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 24px rgba(238, 93, 32, 0.1);
  z-index: 1;
}

/* ── Chevron expand indicator ── */
.status-card-expand-icon {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 20px;
  height: 20px;
  color: var(--muted);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.status-card.is-expanded .status-card-expand-icon {
  transform: rotate(180deg);
}

/* ── Prevent status label from overlapping the chevron ── */
.status-card-top {
  padding-right: 30px;
}

/* ── Affordance hint text ── */
.status-card-hint {
  position: absolute;
  top: 15px;
  right: 40px;
  z-index: 2;
  color: var(--dim);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  pointer-events: none;
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.status-card.is-expandable:hover .status-card-hint,
.status-card.is-expandable:focus-visible .status-card-hint {
  opacity: 1;
  transform: translateX(0);
}

.status-card.is-expanded .status-card-hint {
  opacity: 0;
  transform: translateX(6px);
}

/*
 * Peak-End Rule: smooth expand using grid-template-rows.
 * Avoids the max-height hack: animation timing stays consistent
 * regardless of content height, and nothing gets clipped.
 */
.status-card-detail-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  border-top: 1px solid transparent;
  margin-top: 0;
}

.status-card.is-expanded .status-card-detail-wrapper {
  grid-template-rows: 1fr;
  border-top-color: var(--border);
  margin-top: 6px;
}

.status-card-detail {
  min-height: 0;
  overflow: hidden;
  display: grid;
  gap: 14px;
  padding-top: 0;
}

.status-card.is-expanded .status-card-detail {
  padding-top: 14px;
}

/* ── Chunking: detail sections (Miller's Law compliance) ── */
.status-card-detail-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 16px;
  align-items: baseline;
}

.status-card-detail-section-title {
  grid-column: 1 / -1;
  color: var(--dim);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding-bottom: 4px;
  margin: 0;
}

/* ── Law of Proximity: tight dt/dd pairing ── */
.status-card-detail-section dt {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-card-detail-section dd {
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.status-card-detail-section dd.zero {
  color: var(--muted);
}

@media (max-width: 560px) {
  .status-card-detail {
    gap: 12px;
  }

  .status-card-detail-section {
    grid-template-columns: 1fr 1fr;
    gap: 2px 12px;
  }

  .status-card-detail-section dt {
    font-size: 0.68rem;
  }

  .status-card-detail-section dd {
    font-size: 0.8rem;
  }

  .status-card.is-expanded .status-card-detail {
    padding-top: 10px;
  }

  .status-card-expand-icon {
    top: 10px;
    right: 10px;
  }

  .status-card-hint {
    top: 11px;
    right: 34px;
  }

  .status-card-top {
    padding-right: 26px;
  }
}
`;

export default function ProviderStatusGrid() {
    const [health, setHealth] = createSignal<HealthPayload | null>(null);
    const [loadedAt, setLoadedAt] = createSignal<Date | null>(null);
    const [failed, setFailed] = createSignal(false);
    const [expandedPrefix, setExpandedPrefix] = createSignal<string | null>(
        null,
    );
    let interval: number | undefined;

    const fetchHealth = async () => {
        try {
            const response = await fetch(
                `${siteConfig.socials.api}/v1/health`,
                { cache: "no-store" },
            );
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

    const summary = createMemo(() => {
        const items = providers();
        return {
            degraded: items.filter((item) => item.status === "degraded").length,
            down: items.filter((item) => item.status === "down").length,
            total: items.length,
            up: items.filter((item) => item.status === "up").length,
        };
    });

    const toggleExpand = (prefix: string) => {
        setExpandedPrefix((prev) => (prev === prefix ? null : prefix));
    };

    const formatTimestamp = (iso: string | null | undefined): string => {
        if (!iso) return "never";
        try {
            const date = new Date(iso);
            return date.toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "unknown";
        }
    };

    return (
        <div class="status-board">
            <style>{CSS}</style>

            <div class="status-board-head">
                <div>
                    <h1>Status</h1>
                </div>
                <div
                    class="status-summary"
                    aria-label="Provider health summary"
                >
                    <span>{summary().up} up</span>
                    <span>{summary().degraded} degraded</span>
                    <span>{summary().down} down</span>
                </div>
            </div>

            <Show when={failed()}>
                <div class="status-alert">
                    Health data did not load. Retrying automatically.
                </div>
            </Show>

            <Show
                when={providers().length > 0}
                fallback={
                    <div class="status-grid">
                        <article
                            class="status-card is-unknown"
                            aria-live="polite"
                        >
                            <div class="status-card-top">
                                <span class="status-dot" />
                                <strong>providers/</strong>
                                <span>loading</span>
                            </div>
                            <div class="status-card-main">
                                <span>...</span>
                                <small>models</small>
                            </div>
                            <div class="status-card-meta">
                                <span>30m errors</span>
                                <strong>...</strong>
                                <span>requests</span>
                                <strong>...</strong>
                            </div>
                        </article>
                    </div>
                }
            >
                <div class="status-grid">
                    <For each={providers()}>
                        {(provider) => {
                            const isExpanded = () =>
                                expandedPrefix() === provider.prefix;
                            return (
                                <article
                                    class={`status-card is-${provider.status} is-expandable${
                                        isExpanded() ? " is-expanded" : ""
                                    }`}
                                    onClick={() =>
                                        toggleExpand(provider.prefix)
                                    }
                                    aria-expanded={isExpanded()}
                                    role="button"
                                    tabindex="0"
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            e.preventDefault();
                                            toggleExpand(provider.prefix);
                                        }
                                    }}
                                >
                                    <svg
                                        class="status-card-expand-icon"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M6 8L10 12L14 8" />
                                    </svg>

                                    <span
                                        class="status-card-hint"
                                        aria-hidden="true"
                                    >
                                        details
                                    </span>

                                    <div class="status-card-top">
                                        <span class="status-dot" />
                                        <strong>{provider.prefix}/</strong>
                                        <span>{provider.status}</span>
                                    </div>
                                    <div class="status-card-main">
                                        <span>
                                            {provider.model_count.toLocaleString()}
                                        </span>
                                        <small>models</small>
                                    </div>
                                    <div class="status-card-meta">
                                        <span>30m errors</span>
                                        <strong>
                                            {formatPercent(
                                                provider.error_rate_30m,
                                            )}
                                        </strong>
                                        <span>requests</span>
                                        <strong>
                                            {provider.requests_30m.toLocaleString()}
                                        </strong>
                                    </div>

                                    <div class="status-card-detail-wrapper">
                                        <dl class="status-card-detail">
                                            <div class="status-card-detail-section">
                                                <h4 class="status-card-detail-section-title">
                                                    Reliability
                                                </h4>
                                                <dt>60m error rate</dt>
                                                <dd
                                                    class={
                                                        provider.error_rate_60m <=
                                                        0
                                                            ? "zero"
                                                            : ""
                                                    }
                                                >
                                                    {formatPercent(
                                                        provider.error_rate_60m,
                                                    )}
                                                </dd>
                                                <dt>30m errors</dt>
                                                <dd>
                                                    {provider.errors_30m.toLocaleString()}
                                                </dd>
                                                <dt>60m errors</dt>
                                                <dd>
                                                    {provider.errors_60m.toLocaleString()}
                                                </dd>
                                            </div>

                                            <div class="status-card-detail-section">
                                                <h4 class="status-card-detail-section-title">
                                                    Throughput
                                                </h4>
                                                <dt>60m requests</dt>
                                                <dd>
                                                    {provider.requests_60m.toLocaleString()}
                                                </dd>
                                                <dt>30m successes</dt>
                                                <dd>
                                                    {provider.successes_30m.toLocaleString()}
                                                </dd>
                                                <dt>60m successes</dt>
                                                <dd>
                                                    {provider.successes_60m.toLocaleString()}
                                                </dd>
                                            </div>

                                            <div class="status-card-detail-section">
                                                <h4 class="status-card-detail-section-title">
                                                    Activity
                                                </h4>
                                                <dt>Last success</dt>
                                                <dd>
                                                    {formatTimestamp(
                                                        provider.last_success_at,
                                                    )}
                                                </dd>
                                                <dt>Last error</dt>
                                                <dd
                                                    class={
                                                        !provider.last_error_at
                                                            ? "zero"
                                                            : ""
                                                    }
                                                >
                                                    {formatTimestamp(
                                                        provider.last_error_at,
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </article>
                            );
                        }}
                    </For>
                </div>
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

function formatPercent(value: number): string {
    if (!Number.isFinite(value) || value <= 0) return "0%";
    return `${Math.round(value * 100)}%`;
}
