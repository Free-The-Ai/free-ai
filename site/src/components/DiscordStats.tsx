import { useEffect, useMemo, useState } from "react";

type ClientUsage = {
  client_name: string;
  rank: number;
  total_requests: number;
  unique_users: number;
};

type HealthData = {
  catalog: { model_count: number };
  clients?: ClientUsage[];
  total_tokens_served: { total: number; successful_requests: number };
};

export default function LiveStats() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const r = await fetch("https://api.freetheai.xyz/v1/health");
        if (r.ok) setHealth(await r.json());
      } catch (error) {
        console.error("Failed to load live stats", error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n: number): string => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const stats = useMemo(() => {
    if (!health) return null;

    return {
      clients: (health.clients ?? []).slice(0, 4),
      models: health.catalog?.model_count ?? 0,
      requests: health.total_tokens_served?.successful_requests ?? 0,
      tokens: health.total_tokens_served?.total ?? 0,
    };
  }, [health]);

  return (
    <div className="home-live-stats">
      <div className="home-live-metrics">
        <div className="shell stat-card">
          <div className="stat-value">
            {stats ? stats.models.toLocaleString() : "..."}
          </div>
          <div className="stat-label">active models</div>
        </div>
        <div className="shell stat-card">
          <div className="stat-value">
            {stats ? fmt(stats.tokens) : "..."}
          </div>
          <div className="stat-label">tokens served</div>
        </div>
        <div className="shell stat-card">
          <div className="stat-value">
            {stats ? stats.requests.toLocaleString() : "..."}
          </div>
          <div className="stat-label">requests</div>
        </div>
      </div>
      {stats && (
        <div className="home-client-strip" aria-label="Top API clients">
          {stats.clients.length > 0 ? (
            stats.clients.map((client) => (
              <div key={client.client_name} className="home-client-chip">
                <span>{client.client_name}</span>
                <strong>{fmt(client.total_requests)}</strong>
              </div>
            ))
          ) : (
            <div className="home-client-chip">
              <span>client mix</span>
              <strong>live soon</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
