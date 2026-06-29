import type { ProviderHealth } from "./ProviderStatusGrid";
import { formatPercent } from "../utils/format";
import { ResponsiveDrawer } from "./ui";

function formatTimestamp(iso: string | null | undefined): string {
    if (!iso) return "never";
    try {
        const date = new Date(iso);
        return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return "unknown";
    }
}

function ProviderPopoverBody({ provider }: { provider: ProviderHealth }) {
  return (
    <>
      <dl className="detail-section">
        <h4 className="detail-section-title">Reliability</h4>
        <dt>60m error rate</dt>
        <dd className={provider.error_rate_60m === 0 ? "zero" : ""}>{formatPercent(provider.error_rate_60m)}</dd>
        <dt>30m errors</dt>
        <dd>{provider.errors_30m.toLocaleString()}</dd>
        <dt>60m errors</dt>
        <dd>{provider.errors_60m.toLocaleString()}</dd>
      </dl>
      <dl className="detail-section">
        <h4 className="detail-section-title">Throughput</h4>
        <dt>60m requests</dt>
        <dd>{provider.requests_60m.toLocaleString()}</dd>
        <dt>30m successes</dt>
        <dd>{provider.successes_30m.toLocaleString()}</dd>
        <dt>60m successes</dt>
        <dd>{provider.successes_60m.toLocaleString()}</dd>
      </dl>
      <dl className="detail-section">
        <h4 className="detail-section-title">Activity</h4>
        <dt>Last success</dt>
        <dd>{formatTimestamp(provider.last_success_at)}</dd>
        <dt>Last error</dt>
        <dd className={!provider.last_error_at ? "zero" : ""}>{formatTimestamp(provider.last_error_at)}</dd>
      </dl>
      {provider.model_count > 0 && (
        <a className="catalog-link" href={`/models?prefix=${provider.prefix}`}>
          View all in model catalog <span className="catalog-link-arrow">&rarr;</span>
        </a>
      )}
    </>
  );
}

export default function ProviderPopover(props: {
    provider: ProviderHealth;
    onClose: () => void;
}) {
    const provider = props.provider;
    const isAffected = provider.status === "degraded" || provider.status === "down";

    return (
        <ResponsiveDrawer
            open={true}
            onOpenChange={(open) => { if (!open) props.onClose(); }}
            className={`provider-popover is-${provider.status}`}
        >
            <div className="popover-status-strip" />

            <div className="popover-header">
                <h3 className="popover-heading">
                    {provider.prefix}/
                </h3>
                <p className="popover-sub">
                    Status:{" "}
                    <strong>{provider.status}</strong>{" "}
                    &middot;{" "}
                    {provider.model_count.toLocaleString()}{" "}
                    {provider.model_count === 1 ? "model" : "models"}
                    {isAffected &&
                        (provider.status === "down" ? " — affected" : " — at risk")}
                </p>
            </div>

            <div className="popover-body">
                <ProviderPopoverBody provider={provider} />
            </div>
        </ResponsiveDrawer>
    );
}
