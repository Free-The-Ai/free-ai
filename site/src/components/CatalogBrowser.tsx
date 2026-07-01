import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Button, Skeleton, TextField, Menu, ResponsiveDrawer } from "./ui";
import { CheckmarkIcon } from "./ui/icons";
import { formatTokens, modelPrefix, modelSuffix, siteModelContextWindow } from "../utils/format";

interface AccessInfo {
  available?: boolean;
  requires_seems_legit?: boolean;
  required_discord_roles?: string[];
}

interface Model {
  id: string;
  prefix: string;
  visibility?: string;
  context_window?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
  supports_images?: boolean;
  supports_audio?: boolean;
  requires_seems_legit?: boolean;
  required_roles: string[];
}

interface Policy {
  seems_legit_required_prefixes?: string[];
  seems_legit_required_role_label?: string;
  seems_legit_required_role_public?: boolean;
}

const LIVE_ENDPOINT = "https://api.freetheai.xyz/v1/models/full";
const LIVE_KEY = "freetheai.xyz";
const DISABLED = new Set<string>();
const PAGE_SIZE = 80;

const str = (v: unknown): string | undefined => typeof v === "string" && v.trim() ? v.trim() : undefined;
const posInt = (v: unknown): number | undefined => typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined;

type RouteInfo = {
  method: "GET" | "POST";
  path: string;
  label: string;
  description: string;
};

const SUPPORTED_ROUTES: RouteInfo[] = [
  {
    method: "POST",
    path: "/v1/chat/completions",
    label: "Chat Completions",
    description: "OpenAI-compatible chat with streaming and tool calling.",
  },
  {
    method: "POST",
    path: "/v1/messages",
    label: "Messages",
    description: "Anthropic-compatible Messages route with system prompts and tool use.",
  },
  {
    method: "POST",
    path: "/v1/responses",
    label: "Responses",
    description: "Responses-style route with the same key and model alias.",
  },
];

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

const formatTokensFull = (n: number): string => n.toLocaleString();

const FILTER_OPTIONS = ["chat", "image", "audio", "gated", "long"] as const;
type FilterKey = typeof FILTER_OPTIONS[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  chat: "Chat",
  image: "Image",
  audio: "Audio",
  long: "128k+ context",
  gated: "Verified members",
};

const modelSupportsAudio = (model: Model): boolean =>
  model.supports_audio === true ||
  /(^|\/)(grok-stt|grok-tts)$/i.test(model.id) ||
  /tts|stt|speech|transcription/i.test(model.id);

const modelSupportsImage = (model: Model): boolean =>
  model.supports_images === true ||
  /(^|\/)(gpt-image|.*-image)(-|$|\/)/i.test(model.id);

const modelContext = (model: Model): number => siteModelContextWindow(model);

const TYPE_PREDICATES: Record<FilterKey, (m: Model) => boolean> = {
  chat: (m) => !modelSupportsAudio(m) && !modelSupportsImage(m),
  image: (m) => modelSupportsImage(m),
  audio: (m) => modelSupportsAudio(m),
  gated: (m) => !!m.requires_seems_legit,
  long: (m) => modelContext(m) >= 128_000,
};

const matchesAnyType = (m: Model, types: Set<FilterKey>): boolean => {
  for (const key of types) { if (TYPE_PREDICATES[key](m)) return true; }
  return false;
};

const modelRoutes = (model: Model): RouteInfo[] => {
  const suffix = modelSuffix(model.id).toLowerCase();
  if (modelSupportsImage(model)) {
    const routes: RouteInfo[] = [
      { method: "POST" as const, path: "/v1/images/generations", label: "Image generation", description: "OpenAI-compatible image generation." },
    ];
    if (model.prefix === "ever") {
      routes.push({ method: "POST" as const, path: "/v1/images/edits", label: "Image edits", description: "OpenAI-compatible multipart image editing." });
    }
    if (model.prefix === "eve") {
      routes.push({ method: "GET" as const, path: "/v1/images/generations/{request_id}", label: "Image polling", description: "Poll async image jobs submitted with background or async enabled." });
    }
    return routes;
  }
  if (suffix.includes("stt") || suffix.includes("asr") || suffix.includes("transcription")) {
    return [
      { method: "POST" as const, path: "/v1/audio/transcriptions", label: "Speech to text", description: "OpenAI-compatible multipart audio transcription." },
    ];
  }
  if (suffix.includes("tts") || suffix.includes("speech")) {
    return [
      { method: "POST" as const, path: "/v1/audio/speech", label: "Text to speech", description: "OpenAI-compatible speech generation." },
    ];
  }
  return SUPPORTED_ROUTES;
};

const parseModel = (i: any): Model | null => {
  const _id = str(i?.id);
  if (!_id) return null;
  const pfx = str(i?.prefix) ?? modelPrefix(_id);
  const access = (i?.access ?? {}) as AccessInfo;
  const requiredRoles = Array.isArray(access.required_discord_roles)
    ? access.required_discord_roles.filter((r): r is string => typeof r === "string")
    : [];
  const requiresSeemsLegit =
    i?.requires_seems_legit === true ||
    access.requires_seems_legit === true ||
    requiredRoles.includes("seems_legit");
  const out: Model = { id: _id, prefix: pfx, required_roles: requiredRoles };
  for (const f of [["visibility", str], ["context_window", posInt], ["max_input_tokens", posInt], ["max_output_tokens", posInt]] as [string, typeof str][]) {
    const v = f[1]((i as any)[f[0]]);
    if (v) (out as any)[f[0]] = v;
  }
  for (const k of ["supports_images", "supports_audio"]) {
    if (typeof (i as any)[k] === "boolean") (out as any)[k] = (i as any)[k];
  }
  if (requiresSeemsLegit) out.requires_seems_legit = true;
  return out;
};

const filterModels = (models: Model[], prefixSet: Set<string>, typeSet: Set<FilterKey>, query: string): Model[] => {
  if (prefixSet.size > 0) models = models.filter((m) => prefixSet.has(m.prefix));
  if (typeSet.size > 0) models = models.filter((m) => matchesAnyType(m, typeSet));
  const q = query.trim().toLowerCase();
  if (q) models = models.filter((m) => m.id.toLowerCase().includes(q));
  return [...models].sort((a, b) => {
    const access = Number(a.requires_seems_legit === true) - Number(b.requires_seems_legit === true);
    if (access !== 0) return access;
    const ctx = modelContext(b) - modelContext(a);
    return ctx !== 0 ? ctx : collator.compare(a.id, b.id);
  });
};

const prefixLabel = (sel: Set<string>): string => {
  if (sel.size === 0) return "all providers";
  if (sel.size === 1) { const [only] = sel; return `${only}/*`; }
  return `${sel.size} providers`;
};

const prefixButtonLabel = (sel: Set<string>): string => {
  if (sel.size === 0) return "All prefixes";
  if (sel.size === 1) { const [only] = sel; return `${only}/*`; }
  return `${sel.size} prefixes`;
};

const typeButtonLabel = (sel: Set<FilterKey>, labels: Record<FilterKey, string>): string => {
  if (sel.size === 0) return "All capabilities";
  if (sel.size === 1) { const [only] = sel; return labels[only]; }
  return `${sel.size} capabilities`;
};

const fetchModels = async (): Promise<{ payload: any; src: "live" | "snapshot" }> => {
  try {
    const res = await fetch(LIVE_ENDPOINT, {
      headers: { Accept: "application/json", Authorization: `Bearer ${LIVE_KEY}` },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return { payload: await res.json(), src: "live" };
  } catch (error) {
    const res = await fetch("/models.json", { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    console.warn("Falling back to bundled model catalog snapshot.", error);
    return { payload: await res.json(), src: "snapshot" };
  }
};

const readCatalogParams = () => {
  if (typeof window === "undefined") return { prefixes: [] as string[], types: [] as FilterKey[], query: "" };
  const params = new URLSearchParams(window.location.search);
  const rawPrefix = params.get("prefix")?.trim() || "";
  const prefixes = rawPrefix && !/^(all|\*)$/.test(rawPrefix)
    ? rawPrefix.split(",").map(p => p.trim()).filter(Boolean)
    : [];
  const legacyType = params.get("type")?.trim() ||
    (params.get("seemslegit") === "1" ? "gated" : "");
  const validKeys = new Set<string>(FILTER_OPTIONS);
  return {
    prefixes,
    types: legacyType ? legacyType.split(",").map(t => t.trim()).filter(t => validKeys.has(t)) as FilterKey[] : [],
    query: params.get("q")?.trim() || "",
  };
};

function ModelCard({ model, onSelect }: { model: Model; onSelect: (m: Model) => void }) {
    const ctx = modelContext(model);
    const out = model.max_output_tokens;
    return (
        <article
            className={`model-card${model.requires_seems_legit ? " is-gated" : ""}`}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`Open details for ${model.id}`}
            data-sound="interaction.tap"
            onClick={(e) => {
                if ((e.target as HTMLElement).closest(".model-copy")) return;
                onSelect(model);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(model);
                }
            }}
        >
            <div className="model-card-top">
                <span className="model-prefix">{model.prefix}/*</span>
            </div>
            <code className="model-id">{model.id}</code>
            <div className="model-meta">
                {ctx > 0 && (
                    <span className="model-chip" title="Total context window">
                        <strong>{formatTokens(ctx)}</strong> ctx
                    </span>
                )}
                {out !== undefined && (
                    <span className="model-chip" title="Maximum output tokens">
                        <strong>{formatTokens(out)}</strong> out
                    </span>
                )}
                {modelSupportsAudio(model) && (
                    <span className="model-chip is-audio" title="Supports an audio route">
                        <span className="material-symbols-outlined model-chip-icon" aria-hidden="true">graphic_eq</span>
                        Audio
                    </span>
                )}
                {modelSupportsImage(model) && (
                    <span className="model-chip is-images" title="Supports an image route">
                        <span className="material-symbols-outlined model-chip-icon" aria-hidden="true">image</span>
                        Image
                    </span>
                )}
            </div>
            <button
                className="model-copy"
                title="Copy model alias"
                aria-label={"Copy " + model.id}
                data-sound="interaction.confirm"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(model.id).catch((error) => {
                        console.error("Failed to copy model alias", error);
                    });
                    const btn = e.currentTarget as HTMLElement;
                    const icon = btn.querySelector(".material-symbols-outlined");
                    if (icon) {
                        icon.textContent = "check";
                        setTimeout(() => { icon.textContent = "content_copy"; }, 1500);
                    }
                }}
            >
                <span className="material-symbols-outlined">content_copy</span>
            </button>
        </article>
    );
}

function ModelDetailModal({ model, onClose, verifiedLabel }: { model: Model; onClose: () => void; verifiedLabel: string }) {
    const ctx = modelContext(model);
    const maxInput = model.prefix === "sky" ? ctx : model.max_input_tokens;

    return (
        <ResponsiveDrawer
            open={true}
            onOpenChange={(open) => { if (!open) onClose(); }}
            className={`model-detail-drawer${model.requires_seems_legit ? " is-gated" : ""}`}
        >
            <article className="model-modal">
                <header className="model-modal-head">
                    <span className="model-modal-prefix">{model.prefix}/*</span>
                    <code className="model-modal-id">{model.id}</code>
                </header>

                <section className="model-modal-meta">
                    {ctx > 0 && (
                        <div>
                            <span>Context window</span>
                            <strong>{formatTokensFull(ctx)} tokens</strong>
                        </div>
                    )}
                    {maxInput !== undefined && maxInput !== ctx && (
                        <div>
                            <span>Max input</span>
                            <strong>{formatTokensFull(maxInput)} tokens</strong>
                        </div>
                    )}
                    {model.max_output_tokens !== undefined && (
                        <div>
                            <span>Max output</span>
                            <strong>{formatTokensFull(model.max_output_tokens)} tokens</strong>
                        </div>
                    )}
                    <div>
                        <span>Provider prefix</span>
                        <strong>{model.prefix}/*</strong>
                    </div>
                    <div>
                        <span>Audio route</span>
                        <strong>{modelSupportsAudio(model) ? "Yes" : "No"}</strong>
                    </div>
                    <div>
                        <span>Image route</span>
                        <strong>{modelSupportsImage(model) ? "Yes" : "No"}</strong>
                    </div>
                    {model.visibility && (
                        <div>
                            <span>Visibility</span>
                            <strong>{model.visibility === "role_gated" ? "Verified members" : "Public catalog"}</strong>
                        </div>
                    )}
                    {model.requires_seems_legit && (
                        <div>
                            <span>Access</span>
                            <strong>Verified members only</strong>
                        </div>
                    )}
                </section>

                {model.requires_seems_legit && (
                    <p className="model-modal-gate">
                        <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
                        <span>
                            This model is available to {verifiedLabel} on the FreeTheAi Discord server.
                            Run <code>/checkin</code> daily once you have access.
                        </span>
                    </p>
                )}

                <section className="model-modal-routes">
                    <h4>Supported API routes</h4>
                    <p>Use the same API key and model alias on the supported route for this model.</p>
                    <ul>
                        {modelRoutes(model).map((route, i) => (
                            <li key={i}>
                                <code>{route.method} {route.path}</code>
                                <span>{route.description}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <footer className="model-modal-foot">
                    <button
                        type="button"
                        className="model-modal-copy"
                        data-sound="interaction.confirm"
                        onClick={(e) => {
                            navigator.clipboard.writeText(model.id).catch((error) => {
                                console.error("Failed to copy model alias", error);
                            });
                            const btn = e.currentTarget as HTMLButtonElement;
                            const original = btn.textContent;
                            btn.textContent = "Copied";
                            setTimeout(() => { btn.textContent = original; }, 1500);
                        }}
                    >
                        Copy alias
                    </button>
                    <a className="model-modal-docs" href="/docs#compatibility">View API docs</a>
                </footer>
            </article>
        </ResponsiveDrawer>
    );
}

function FilterCheckbox({ checked, onToggle, label, count }: { checked: boolean; onToggle: () => void; label: string; count?: number }) {
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

function CatalogFiltersToolbar(props: {
  query: string; setQuery: (v: string) => void; setPage: (v: number | ((p: number) => number)) => void;
  prefixes: Set<string>; togglePrefix: (p: string) => void; prefixCounts: [string, number][];
  typeFilters: Set<FilterKey>; toggleType: (k: FilterKey) => void; visibleTypeOptions: FilterKey[];
  prefixButtonLabel: string; typeButtonLabel: string;
}) {
  return (
    <div className="catalog-toolbar">
      <div className="catalog-search-field">
        <span className="material-symbols-outlined catalog-search-icon">search</span>
        <TextField
          className="catalog-search-input"
          value={props.query}
          placeholder="Search model aliases..."
          onChange={(v: string) => { props.setQuery(v); props.setPage(1); }}
        />
      </div>
      <div className="catalog-filter-group">
        <Menu.Root>
          <Menu.Trigger className={`catalog-filter-trigger${props.prefixes.size > 0 ? " is-active" : ""}`} sound="overlay.expand">
            <span className="catalog-filter-label">Prefix</span>
            <span className="catalog-filter-value">{props.prefixButtonLabel}</span>
            {props.prefixes.size > 0 && <span className="catalog-filter-count">{props.prefixes.size}</span>}
          </Menu.Trigger>
          <Menu.Content side="bottom" align="start" className="catalog-filter-content">
            <Menu.Group>
              {props.prefixCounts.map(([pfx, count]) => (
                <FilterCheckbox
                  key={pfx}
                  checked={props.prefixes.has(pfx)}
                  onToggle={() => props.togglePrefix(pfx)}
                  label={`${pfx}/*`}
                  count={count}
                />
              ))}
            </Menu.Group>
          </Menu.Content>
        </Menu.Root>
        <Menu.Root>
          <Menu.Trigger className={`catalog-filter-trigger${props.typeFilters.size > 0 ? " is-active" : ""}`} sound="overlay.expand">
            <span className="catalog-filter-label">Capability</span>
            <span className="catalog-filter-value">{props.typeButtonLabel}</span>
            {props.typeFilters.size > 0 && <span className="catalog-filter-count">{props.typeFilters.size}</span>}
          </Menu.Trigger>
          <Menu.Content side="bottom" align="start" className="catalog-filter-content">
            <Menu.Group>
              {props.visibleTypeOptions.map((key) => (
                <FilterCheckbox
                  key={key}
                  checked={props.typeFilters.has(key)}
                  onToggle={() => props.toggleType(key)}
                  label={FILTER_LABELS[key]}
                />
              ))}
            </Menu.Group>
          </Menu.Content>
        </Menu.Root>
      </div>
    </div>
  );
}

function CatalogPagination({ page, pageCount, filteredCount, totalCount, setPage }: {
  page: number; pageCount: number; filteredCount: number; totalCount: number;
  setPage: (v: number | ((p: number) => number)) => void;
}) {
  return (
    <div className="catalog-pagination">
      <span className="catalog-pagination-count">
        {totalCount === 0 ? "Loading..." : `${filteredCount.toLocaleString()} model${filteredCount !== 1 ? "s" : ""}`}
      </span>
      <Button variant="ghost" className="pagination-button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
      <span className="catalog-pagination-text">{page} / {pageCount}</span>
      <Button variant="ghost" className="pagination-button" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
    </div>
  );
}

export default function CatalogBrowser() {
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [prefixes, setPrefixes] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<FilterKey>>(new Set());
  const [source, setSource] = useState<"live" | "snapshot" | "error">("live");
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<Model | null>(null);
  const mountedRef = useRef(false);

  const togglePrefix = useCallback((pfx: string) => {
    setPrefixes((prev) => {
      const next = new Set(prev);
      if (next.has(pfx)) next.delete(pfx);
      else next.add(pfx);
      return next;
    });
    setPage(1);
  }, []);

  const toggleType = useCallback((key: FilterKey) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPage(1);
  }, []);

  const prefixCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const { prefix: pfx } of allModels) m.set(pfx, (m.get(pfx) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [allModels]);

  const hasAudioModel = useMemo(() => allModels.some(modelSupportsAudio), [allModels]);
  const hasImageModel = useMemo(() => allModels.some(modelSupportsImage), [allModels]);
  const hasGatedModel = useMemo(() => allModels.some((m) => m.requires_seems_legit), [allModels]);

  const filteredModels = useMemo(
    () => filterModels(allModels, prefixes, typeFilters, query),
    [allModels, prefixes, typeFilters, query],
  );

  const pageCount = Math.max(1, Math.ceil(filteredModels.length / PAGE_SIZE));
  const visibleModels = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredModels.slice(start, start + PAGE_SIZE);
  }, [filteredModels, page]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    if (prefixes.size === 0) return;
    if (allModels.length === 0) return;
    const valid = new Set(prefixCounts.map(([pfx]) => pfx));
    let dirty = false;
    const next = new Set<string>();
    for (const pfx of prefixes) {
      if (valid.has(pfx)) next.add(pfx);
      else dirty = true;
    }
    if (dirty) {
      setPrefixes(next);
      setPage(1);
    }
  }, [prefixes, allModels, prefixCounts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mountedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const pfxList = [...prefixes];
    const typeList = [...typeFilters];
    const search = query.trim();
    if (pfxList.length === 0) params.delete("prefix");
    else params.set("prefix", pfxList.join(","));
    params.delete("images");
    params.delete("seemslegit");
    params.delete("sort");
    if (typeList.length === 0) params.delete("type");
    else params.set("type", typeList.join(","));
    if (search) params.set("q", search);
    else params.delete("q");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }, [prefixes, typeFilters, query]);

  useEffect(() => {
    const params = readCatalogParams();
    if (params.query) setQuery(params.query);
    if (params.prefixes.length > 0) setPrefixes(new Set(params.prefixes));
    if (params.types.length > 0) setTypeFilters(new Set(params.types));
    mountedRef.current = true;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { payload, src } = await fetchModels();
        if (cancelled) return;
        const items = Array.isArray(payload?.data) ? payload.data : [];
        setAllModels(
          items
            .map(parseModel)
            .filter((m: Model | null): m is Model => m !== null)
            .filter((m: Model) => !DISABLED.has(m.prefix))
            .sort((a: Model, b: Model) => collator.compare(a.id, b.id))
        );
        if (payload?.policy && typeof payload.policy === "object") setPolicy(payload.policy as Policy);
        setSource(src);
      } catch (err) {
        if (cancelled) return;
        setSource("error");
        setLoadError(err instanceof Error ? err.message : "Failed to load model catalog.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const providerLabel = prefixLabel(prefixes);

  const resultLabel = () => {
    if (allModels.length === 0 && source !== "error") return "Loading model catalog...";
    const count = filteredModels.length;
    const plural = count === 1 ? "model" : "models";
    return `${count.toLocaleString()} ${plural} across ${providerLabel}`;
  };

  const filtersActive = query.trim() !== "" || prefixes.size > 0 || typeFilters.size > 0;

  const clearFilters = useCallback(() => {
    setQuery("");
    setPrefixes(new Set());
    setTypeFilters(new Set());
    setPage(1);
  }, []);

  const verifiedMemberLabel = () => {
    const label = policy?.seems_legit_required_role_label;
    const normalized = label?.toLowerCase().replace(/[\s-]+/g, "_");
    if (!normalized || normalized === "seems_legit") return "Verified members";
    return label ?? "Verified members";
  };

  const visibleTypeOptions = useMemo((): FilterKey[] => {
    const list: FilterKey[] = ["chat"];
    if (hasImageModel) list.push("image");
    if (hasAudioModel) list.push("audio");
    list.push("long");
    if (hasGatedModel) list.push("gated");
    return list;
  }, [hasImageModel, hasAudioModel, hasGatedModel]);

  return (
    <div className="panel catalog-panel">
      <div className="catalog-panel-head">
        <div>
          <h3>Models</h3>
        </div>
      </div>

      <CatalogFiltersToolbar
        query={query} setQuery={setQuery} setPage={setPage}
        prefixes={prefixes} togglePrefix={togglePrefix} prefixCounts={prefixCounts}
        typeFilters={typeFilters} toggleType={toggleType} visibleTypeOptions={visibleTypeOptions}
        prefixButtonLabel={prefixButtonLabel(prefixes)} typeButtonLabel={typeButtonLabel(typeFilters, FILTER_LABELS)}
      />

      {hasGatedModel && (
        <blockquote className="catalog-note">
          Orange-outlined models are available to {verifiedMemberLabel()}.
        </blockquote>
      )}

      <div className="catalog-summary" aria-live="polite">
        <span>{resultLabel()}</span>
        {filtersActive && (
          <button type="button" onClick={clearFilters} data-sound="interaction.subtle">
            Clear filters
          </button>
        )}
      </div>

      <div className="catalog-results">
        {visibleModels.length > 0 ? (
          visibleModels.map((model) => <ModelCard key={model.id} model={model} onSelect={setSelected} />)
        ) : (
          <div className="catalog-empty">
            {source === "error"
              ? loadError
              : allModels.length === 0
              ? <Skeleton width="200" height="14" />
              : "No models match your search."}
          </div>
        )}
      </div>

      <CatalogPagination
        page={page} pageCount={pageCount} filteredCount={filteredModels.length}
        totalCount={allModels.length} setPage={setPage}
      />

      {selected && (
        <ModelDetailModal model={selected} onClose={() => setSelected(null)} verifiedLabel={verifiedMemberLabel() ?? "Verified members"} />
      )}
    </div>
  );
}
