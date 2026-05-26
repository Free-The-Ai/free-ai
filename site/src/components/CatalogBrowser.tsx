import { createSignal, createEffect, onMount, onCleanup, For, Show } from "solid-js";
import { Button, Skeleton, TextField } from "./ui";
import { formatTokens } from "../utils/format";

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

const SUPPORTED_ROUTES: Array<{
  path: string;
  label: string;
  description: string;
}> = [
  {
    path: "/v1/chat/completions",
    label: "Chat Completions",
    description: "OpenAI-compatible chat with streaming and tool calling.",
  },
  {
    path: "/v1/messages",
    label: "Messages",
    description: "Anthropic-compatible Messages route with system prompts and tool use.",
  },
  {
    path: "/v1/responses",
    label: "Responses",
    description: "Responses-style route with the same key and model alias.",
  },
];

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
const modelPrefix = (id: string): string => id.includes("/") ? id.slice(0, id.indexOf("/")) : "other";
const modelSuffix = (id: string): string => id.includes("/") ? id.slice(id.indexOf("/") + 1) : id;

const formatTokensFull = (n: number): string => n.toLocaleString();

const FILTER_OPTIONS = ["chat", "images", "audio", "gated", "long"] as const;
type FilterKey = typeof FILTER_OPTIONS[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  chat: "Chat",
  images: "Images",
  audio: "Audio",
  long: "128k+ context",
  gated: "Verified members",
};

const modelSupportsImages = (model: Model): boolean =>
  model.supports_images === true ||
  model.prefix === "img" ||
  model.prefix === "vhr" ||
  /image|vision|gpt-image/i.test(model.id);

const modelSupportsAudio = (model: Model): boolean =>
  model.supports_audio === true ||
  /(^|\/)(grok-stt|grok-tts)$/i.test(model.id) ||
  /tts|stt|speech|transcription/i.test(model.id);

const modelContext = (model: Model): number => model.context_window ?? model.max_input_tokens ?? 0;

const modelRoutes = (model: Model) => {
  const suffix = modelSuffix(model.id).toLowerCase();
  if (suffix.includes("stt") || suffix.includes("transcription")) {
    return [
      {
        path: "/v1/audio/transcriptions",
        label: "Speech to text",
        description: "OpenAI-compatible multipart audio transcription.",
      },
    ];
  }
  if (suffix.includes("tts") || suffix.includes("speech")) {
    return [
      {
        path: "/v1/audio/speech",
        label: "Text to speech",
        description: "OpenAI-compatible speech generation.",
      },
    ];
  }
  if (model.prefix === "img" || model.prefix === "vhr" || /gpt-image|image/i.test(suffix)) {
    return [
      {
        path: "/v1/images/generations",
        label: "Image generation",
        description: "OpenAI-compatible image generation.",
      },
      {
        path: "/v1/images/edits",
        label: "Image edits",
        description: "Image editing with an input image.",
      },
    ];
  }
  return SUPPORTED_ROUTES;
};

const readCatalogParams = () => {
  if (typeof window === "undefined") {
    return {
      prefixes: [] as string[],
      types: [] as FilterKey[],
      query: "",
    };
  }
  const params = new URLSearchParams(window.location.search);
  const rawPrefix = params.get("prefix")?.trim() || "";
  const prefixes = rawPrefix && rawPrefix !== "all" && rawPrefix !== "*"
    ? rawPrefix.split(",").map((p) => p.trim()).filter(Boolean)
    : [];
  const rawType = params.get("type")?.trim() || "";
  const legacyType = rawType ||
    (params.get("images") === "1" ? "images" : "") ||
    (params.get("seemslegit") === "1" ? "gated" : "");
  const validKeys = new Set<string>(FILTER_OPTIONS);
  const types = legacyType
    ? legacyType.split(",").map((t) => t.trim()).filter((t) => validKeys.has(t))
    : [];
  return {
    prefixes,
    types: types as FilterKey[],
    query: params.get("q")?.trim() || "",
  };
};

export default function CatalogBrowser() {
  const initial = readCatalogParams();
  const [allModels, setAllModels] = createSignal<Model[]>([]);
  const [policy, setPolicy] = createSignal<Policy | null>(null);
  const [query, setQuery] = createSignal(initial.query);
  const [page, setPage] = createSignal(1);
  const [prefixes, setPrefixes] = createSignal<Set<string>>(new Set(initial.prefixes));
  const [typeFilters, setTypeFilters] = createSignal<Set<FilterKey>>(new Set(initial.types));
  const [source, setSource] = createSignal<"live" | "snapshot" | "error">("live");
  const [loadError, setLoadError] = createSignal("");
  const [selected, setSelected] = createSignal<Model | null>(null);

  const togglePrefix = (pfx: string) => {
    setPrefixes((prev) => {
      const next = new Set(prev);
      if (next.has(pfx)) next.delete(pfx);
      else next.add(pfx);
      return next;
    });
    setPage(1);
  };

  const toggleType = (key: FilterKey) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPage(1);
  };

  const prefixCounts = () => {
    const m = new Map<string, number>();
    for (const { prefix: pfx } of allModels()) m.set(pfx, (m.get(pfx) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const hasImageModel = () => allModels().some(modelSupportsImages);
  const hasAudioModel = () => allModels().some(modelSupportsAudio);
  const hasGatedModel = () => allModels().some((m) => m.requires_seems_legit);

  const filteredModels = () => {
    let models = allModels();
    const pfxSet = prefixes();
    if (pfxSet.size > 0) {
      models = models.filter((m) => pfxSet.has(m.prefix));
    }
    const typeSet = typeFilters();
    if (typeSet.size > 0) {
      models = models.filter((m) => {
        for (const key of typeSet) {
          switch (key) {
            case "chat":
              if (!modelSupportsAudio(m)) return true;
              break;
            case "images":
              if (modelSupportsImages(m)) return true;
              break;
            case "audio":
              if (modelSupportsAudio(m)) return true;
              break;
            case "gated":
              if (m.requires_seems_legit) return true;
              break;
            case "long":
              if (modelContext(m) >= 128_000) return true;
              break;
          }
        }
        return false;
      });
    }
    const q = query().trim().toLowerCase();
    if (q) models = models.filter((m) => m.id.toLowerCase().includes(q));
    const sorted = [...models];
    sorted.sort((a, b) => {
      const access = Number(a.requires_seems_legit === true) - Number(b.requires_seems_legit === true);
      if (access !== 0) return access;
      const contextDelta = modelContext(b) - modelContext(a);
      if (contextDelta !== 0) return contextDelta;
      return collator.compare(a.id, b.id);
    });
    return sorted;
  };

  const pageCount = () => Math.max(1, Math.ceil(filteredModels().length / PAGE_SIZE));
  const visibleModels = () => {
    const start = (page() - 1) * PAGE_SIZE;
    return filteredModels().slice(start, start + PAGE_SIZE);
  };

  createEffect(() => {
    if (page() > pageCount()) setPage(pageCount());
  });

  createEffect(() => {
    const sel = prefixes();
    if (sel.size === 0) return;
    if (allModels().length === 0) return;
    const valid = new Set(prefixCounts().map(([pfx]) => pfx));
    let dirty = false;
    const next = new Set<string>();
    for (const pfx of sel) {
      if (valid.has(pfx)) next.add(pfx);
      else dirty = true;
    }
    if (dirty) {
      setPrefixes(next);
      setPage(1);
    }
  });

  createEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pfxList = [...prefixes()];
    const typeList = [...typeFilters()];
    const search = query().trim();
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
  });

  onMount(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selected()) setSelected(null);
    };
    document.addEventListener("keydown", handleKey);
    onCleanup(() => document.removeEventListener("keydown", handleKey));
  });

  const parseModel = (i: any): Model | null => {
    if (typeof i?.id !== "string" || !i.id.trim()) return null;
    const id = i.id.trim();
    const pfx =
      typeof i?.prefix === "string" && i.prefix.trim()
        ? i.prefix.trim()
        : modelPrefix(id);
    const access = (i?.access ?? {}) as AccessInfo;
    const requiredRoles = Array.isArray(access.required_discord_roles)
      ? access.required_discord_roles.filter((r): r is string => typeof r === "string")
      : [];
    const requiresSeemsLegit =
      i?.requires_seems_legit === true ||
      access.requires_seems_legit === true ||
      requiredRoles.includes("seems_legit");
    const out: Model = { id, prefix: pfx, required_roles: requiredRoles };
    if (typeof i.visibility === "string" && i.visibility.trim()) {
      out.visibility = i.visibility.trim();
    }
    if (typeof i.context_window === "number" && Number.isFinite(i.context_window) && i.context_window > 0) {
      out.context_window = i.context_window;
    }
    if (typeof i.max_input_tokens === "number" && Number.isFinite(i.max_input_tokens) && i.max_input_tokens > 0) {
      out.max_input_tokens = i.max_input_tokens;
    }
    if (typeof i.max_output_tokens === "number" && Number.isFinite(i.max_output_tokens) && i.max_output_tokens > 0) {
      out.max_output_tokens = i.max_output_tokens;
    }
    if (typeof i.supports_images === "boolean") {
      out.supports_images = i.supports_images;
    }
    if (typeof i.supports_audio === "boolean") {
      out.supports_audio = i.supports_audio;
    }
    if (requiresSeemsLegit) {
      out.requires_seems_legit = true;
    }
    return out;
  };

  onMount(async () => {
    try {
      let payload: any;
      let src: "live" | "snapshot" = "live";
      try {
        const res = await fetch(LIVE_ENDPOINT, {
          headers: { Accept: "application/json", Authorization: `Bearer ${LIVE_KEY}` },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        payload = await res.json();
      } catch (error) {
        src = "snapshot";
        const res = await fetch("/models.json", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        payload = await res.json();
        console.warn("Falling back to bundled model catalog snapshot.", error);
      }
      const items = Array.isArray(payload?.data) ? payload.data : [];
      const models: Model[] = items
        .map(parseModel)
        .filter((m: Model | null): m is Model => m !== null)
        .filter((m: Model) => !DISABLED.has(m.prefix));
      setAllModels([...models].sort((a, b) => collator.compare(a.id, b.id)));
      if (payload?.policy && typeof payload.policy === "object") {
        setPolicy(payload.policy as Policy);
      }
      setSource(src);
    } catch (err) {
      setSource("error");
      setLoadError(err instanceof Error ? err.message : "Failed to load model catalog.");
    }
  });

  const providerLabel = () => {
    const list = [...prefixes()];
    if (list.length === 0) return "all providers";
    if (list.length === 1) return `${list[0]}/*`;
    return `${list.length} providers`;
  };
  const resultLabel = () => {
    if (allModels().length === 0 && source() !== "error") return "Loading model catalog...";
    const count = filteredModels().length;
    const plural = count === 1 ? "model" : "models";
    return `${count.toLocaleString()} ${plural} across ${providerLabel()}`;
  };

  const filtersActive = () =>
    query().trim() !== "" ||
    prefixes().size > 0 ||
    typeFilters().size > 0;

  const clearFilters = () => {
    setQuery("");
    setPrefixes(new Set());
    setTypeFilters(new Set());
    setPage(1);
  };

  const verifiedMemberLabel = () => {
    const label = policy()?.seems_legit_required_role_label;
    const normalized = label?.toLowerCase().replace(/[\s-]+/g, "_");
    if (!normalized || normalized === "seems_legit") return "Verified members";
    return label;
  };

  const prefixButtonLabel = () => {
    const sel = prefixes();
    if (sel.size === 0) return "All prefixes";
    if (sel.size === 1) {
      const [only] = sel;
      return `${only}/*`;
    }
    return `${sel.size} prefixes`;
  };

  const typeButtonLabel = () => {
    const sel = typeFilters();
    if (sel.size === 0) return "All capabilities";
    if (sel.size === 1) {
      const [only] = sel;
      return FILTER_LABELS[only];
    }
    return `${sel.size} capabilities`;
  };

  const visibleTypeOptions = (): FilterKey[] => {
    const list: FilterKey[] = ["chat"];
    if (hasImageModel()) list.push("images");
    if (hasAudioModel()) list.push("audio");
    list.push("long");
    if (hasGatedModel()) list.push("gated");
    return list;
  };

  return (
    <div class="panel catalog-panel">
      <div class="catalog-panel-head">
        <div>
          <h3>Models</h3>
        </div>
      </div>

      <div class="catalog-toolbar">
        <div class="catalog-search-field">
          <span class="material-symbols-outlined catalog-search-icon">search</span>
          <TextField
            class="catalog-search-input"
            value={query()}
            placeholder="Search model aliases..."
            onChange={(v: string) => { setQuery(v); setPage(1); }}
          />
        </div>
        <div class="catalog-filter-group">
          <details class="catalog-filter">
            <summary class={`catalog-filter-trigger ${prefixes().size > 0 ? "is-active" : ""}`} data-sound="overlay.expand">
              <span class="catalog-filter-label">Prefix</span>
              <span class="catalog-filter-value">{prefixButtonLabel()}</span>
              <Show when={prefixes().size > 0}>
                <span class="catalog-filter-count">{prefixes().size}</span>
              </Show>
              <span class="material-symbols-outlined catalog-filter-caret" aria-hidden="true">expand_more</span>
            </summary>
            <div class="catalog-filter-menu" role="group" aria-label="Filter by prefix">
              <For each={prefixCounts()}>
                {([pfx, count]) => (
                  <label class={`catalog-filter-option ${prefixes().has(pfx) ? "is-active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={prefixes().has(pfx)}
                      onChange={() => togglePrefix(pfx)}
                      data-sound="interaction.toggle"
                    />
                    <span class="catalog-filter-option-name">{pfx}/*</span>
                    <span class="catalog-filter-option-count">{count}</span>
                  </label>
                )}
              </For>
            </div>
          </details>
          <details class="catalog-filter">
            <summary class={`catalog-filter-trigger ${typeFilters().size > 0 ? "is-active" : ""}`} data-sound="overlay.expand">
              <span class="catalog-filter-label">Capability</span>
              <span class="catalog-filter-value">{typeButtonLabel()}</span>
              <Show when={typeFilters().size > 0}>
                <span class="catalog-filter-count">{typeFilters().size}</span>
              </Show>
              <span class="material-symbols-outlined catalog-filter-caret" aria-hidden="true">expand_more</span>
            </summary>
            <div class="catalog-filter-menu" role="group" aria-label="Filter by capability">
              <For each={visibleTypeOptions()}>
                {(key) => (
                  <label class={`catalog-filter-option ${typeFilters().has(key) ? "is-active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={typeFilters().has(key)}
                      onChange={() => toggleType(key)}
                      data-sound="interaction.toggle"
                    />
                    <span class="catalog-filter-option-name">{FILTER_LABELS[key]}</span>
                  </label>
                )}
              </For>
            </div>
          </details>
        </div>
      </div>

      <Show when={hasGatedModel()}>
        <blockquote class="catalog-note">
          Orange-outlined models are available to {verifiedMemberLabel()}.
        </blockquote>
      </Show>

      <div class="catalog-summary" aria-live="polite">
        <span>{resultLabel()}</span>
        <Show when={filtersActive()}>
          <button type="button" onClick={clearFilters} data-sound="interaction.subtle">
            Clear filters
          </button>
        </Show>
      </div>

      <div class={`catalog-results ${visibleModels().length <= 6 ? "is-short" : ""}`}>
        <Show
          when={visibleModels().length > 0}
          fallback={
            <div class="catalog-empty">
              {source() === "error"
                ? loadError()
                : allModels().length === 0
                ? <Skeleton width="200" height="14" />
                : "No models match your search."}
            </div>
          }
        >
          <For each={visibleModels()}>
            {(model) => {
              const ctx = modelContext(model);
              const out = model.max_output_tokens;
              return (
                <article
                  class={`model-card${model.requires_seems_legit ? " is-gated" : ""}`}
                  role="button"
                  tabindex="0"
                  aria-haspopup="dialog"
                  aria-label={`Open details for ${model.id}`}
                  data-sound="interaction.tap"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest(".model-copy")) return;
                    setSelected(model);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(model);
                    }
                  }}
                >
                  <div class="model-card-top">
                    <span class="model-prefix">{model.prefix}/*</span>
                  </div>
                  <code class="model-id">{model.id}</code>
                  <div class="model-meta">
                    {ctx > 0 && (
                      <span class="model-chip" title="Total context window">
                        <strong>{formatTokens(ctx)}</strong> ctx
                      </span>
                    )}
                    {out !== undefined && (
                      <span class="model-chip" title="Maximum output tokens">
                        <strong>{formatTokens(out)}</strong> out
                      </span>
                    )}
                    {modelSupportsImages(model) && (
                      <span class="model-chip is-images" title="Supports image inputs or generation">
                        <span class="material-symbols-outlined model-chip-icon" aria-hidden="true">image</span>
                        Images
                      </span>
                    )}
                    {modelSupportsAudio(model) && (
                      <span class="model-chip is-audio" title="Supports an audio route">
                        <span class="material-symbols-outlined model-chip-icon" aria-hidden="true">graphic_eq</span>
                        Audio
                      </span>
                    )}
                  </div>
                  <button
                    class="model-copy"
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
                    <span class="material-symbols-outlined">content_copy</span>
                  </button>
                </article>
              );
            }}
          </For>
        </Show>
      </div>

      <div class="catalog-pagination">
        <span class="catalog-pagination-count">
          {allModels().length === 0
            ? "Loading..."
            : `${filteredModels().length.toLocaleString()} model${filteredModels().length !== 1 ? "s" : ""}`}
        </span>
        <Button
          variant="ghost"
          class="pagination-button"
          disabled={page() <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span class="catalog-pagination-text">
          {page()} / {pageCount()}
        </span>
        <Button
          variant="ghost"
          class="pagination-button"
          disabled={page() >= pageCount()}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      <Show when={selected()}>
        {(model) => (
          <div
            class="model-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`${model().id} details`}
            data-sound="overlay.close"
            onClick={() => setSelected(null)}
          >
            <article
              class={`model-modal${model().requires_seems_legit ? " is-gated" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <header class="model-modal-head">
                <div>
                  <span class="model-modal-prefix">{model().prefix}/*</span>
                  <code class="model-modal-id">{model().id}</code>
                </div>
                <button
                  type="button"
                  class="model-modal-close"
                  aria-label="Close"
                  data-sound="overlay.close"
                  onClick={() => setSelected(null)}
                >
                  <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </header>

              <section class="model-modal-meta">
                {model().context_window !== undefined && (
                  <div>
                    <span>Context window</span>
                    <strong>{formatTokensFull(model().context_window!)} tokens</strong>
                  </div>
                )}
                {model().max_input_tokens !== undefined &&
                  model().max_input_tokens !== model().context_window && (
                    <div>
                      <span>Max input</span>
                      <strong>{formatTokensFull(model().max_input_tokens!)} tokens</strong>
                    </div>
                  )}
                {model().max_output_tokens !== undefined && (
                  <div>
                    <span>Max output</span>
                    <strong>{formatTokensFull(model().max_output_tokens!)} tokens</strong>
                  </div>
                )}
                <div>
                  <span>Provider prefix</span>
                  <strong>{model().prefix}/*</strong>
                </div>
                <div>
                  <span>Image support</span>
                  <strong>{modelSupportsImages(model()) ? "Yes" : "No"}</strong>
                </div>
                <div>
                  <span>Audio route</span>
                  <strong>{modelSupportsAudio(model()) ? "Yes" : "No"}</strong>
                </div>
                <Show when={model().visibility}>
                  <div>
                    <span>Visibility</span>
                    <strong>{model().visibility === "role_gated" ? "Verified members" : "Public catalog"}</strong>
                  </div>
                </Show>
                <Show when={model().requires_seems_legit}>
                  <div>
                    <span>Access</span>
                    <strong>Verified members only</strong>
                  </div>
                </Show>
              </section>

              <Show when={model().requires_seems_legit}>
                <p class="model-modal-gate">
                  <span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
                  <span>
                    This model is available to {verifiedMemberLabel()} on the FreeTheAi Discord server.
                    Run <code>/checkin</code> daily once you have access.
                  </span>
                </p>
              </Show>

              <section class="model-modal-routes">
                <h4>Supported API routes</h4>
                <p>
                  Use the same API key and model alias on the supported route for this model.
                </p>
                <ul>
                  <For each={modelRoutes(model())}>
                    {(route) => (
                      <li>
                        <code>POST {route.path}</code>
                        <span>{route.description}</span>
                      </li>
                    )}
                  </For>
                </ul>
              </section>

              <footer class="model-modal-foot">
                <button
                  type="button"
                  class="model-modal-copy"
                  data-sound="interaction.confirm"
                  onClick={(e) => {
                    navigator.clipboard.writeText(model().id).catch((error) => {
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
                <a class="model-modal-docs" href="/docs#compatibility">View API docs</a>
              </footer>
            </article>
          </div>
        )}
      </Show>
    </div>
  );
}
