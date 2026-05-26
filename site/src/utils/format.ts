/** Format a token count for display (e.g., 128000 → "128k"). */
export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/** Format a decimal as a percentage string (e.g., 0.756 → "76%"). */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "\u2014";
  return `${Math.round(value * 100)}%`;
}

/** Extract the prefix from a model id (first segment before "/"), or "other". */
export function modelPrefix(id: string): string {
  return id.includes("/") ? id.slice(0, id.indexOf("/")) : "other";
}

/** Extract the suffix from a model id (everything after "/"), or the full id. */
export function modelSuffix(id: string): string {
  return id.includes("/") ? id.slice(id.indexOf("/") + 1) : id;
}
