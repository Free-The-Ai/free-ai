import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

type ClientUsage = {
  client_name: string;
  rank: number;
  total_requests: number;
  unique_users: number;
};

export default function LiveStats() {
  const [health, setHealth] = createSignal<{
    catalog: { model_count: number };
    clients?: ClientUsage[];
    total_tokens_served: { total: number; successful_requests: number };
  } | null>(null);

  let interval: number;

  const fetchHealth = async () => {
    try {
      const r = await fetch("https://api.freetheai.xyz/v1/health");
      if (r.ok) setHealth(await r.json());
    } catch (error) {
      console.error("Failed to load live stats", error);
    }
  };

  onMount(() => {
    fetchHealth();
    interval = setInterval(fetchHealth, 30000);
  });

  onCleanup(() => clearInterval(interval));

  const fmt = (n: number): string => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const stats = createMemo(() => {
    const h = health();
    if (!h) return null;

    return {
      clients: (h.clients ?? []).slice(0, 4),
      models: h.catalog?.model_count ?? 0,
      requests: h.total_tokens_served?.successful_requests ?? 0,
      tokens: h.total_tokens_served?.total ?? 0,
    };
  });

  return (
    <div class="home-live-stats">
      <div class="home-live-metrics">
        <div class="shell stat-card">
          <div class="stat-value">
            {stats() ? stats()!.models.toLocaleString() : "..."}
          </div>
          <div class="stat-label">active models</div>
        </div>
        <div class="shell stat-card">
          <div class="stat-value">
            {stats() ? fmt(stats()!.tokens) : "..."}
          </div>
          <div class="stat-label">tokens served</div>
        </div>
        <div class="shell stat-card">
          <div class="stat-value">
            {stats() ? stats()!.requests.toLocaleString() : "..."}
          </div>
          <div class="stat-label">requests</div>
        </div>
      </div>
      {stats() && (
        <div class="home-client-strip" aria-label="Top API clients">
          {stats()!.clients.length > 0 ? (
            stats()!.clients.map((client) => (
              <div class="home-client-chip">
                <span>{client.client_name}</span>
                <strong>{fmt(client.total_requests)}</strong>
              </div>
            ))
          ) : (
            <div class="home-client-chip">
              <span>client mix</span>
              <strong>live soon</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
