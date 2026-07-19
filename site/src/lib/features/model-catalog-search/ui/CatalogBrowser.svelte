<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { CatalogPolicy, Model } from "@/entities/model";
    import { modelSupportsAudio, modelSupportsImage, parseModel } from "@/entities/model";
    import { modelPrefix } from "@/shared/lib/format";
    import { watchDeps } from "@/shared/lib/watchDeps";
    import { Button, DropdownMenu, Skeleton, TextField } from "@/shared/ui";
    import type { DropdownMenuOption } from "@/shared/ui";
    import { fetchModels } from "../lib/fetchModels";
    import modelSnapshot from "@/entities/model/models.json";
    import {
        FILTER_LABELS,
        filterModels,
        prefixButtonLabel,
        prefixLabel,
        readCatalogParams,
        typeButtonLabel,
        collatorCompare,
        type FilterKey,
    } from "../lib/filters";
    import ModelCard from "./ModelCard.svelte";
    import ModelDetailModal from "./ModelDetailModal.svelte";
    import CatalogOverview from "./CatalogOverview.svelte";

    const PAGE_SIZE = 80;
    const DISABLED = new Set<string>();

    function parsePayload(payload: unknown): { models: Model[]; policy: CatalogPolicy | null } {
        const rec = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
        const items = Array.isArray(rec?.data) ? (rec.data as unknown[]) : [];
        const models = items
            .map(parseModel)
            .filter((m): m is Model => m !== null)
            .filter((m) => !DISABLED.has(m.prefix))
            .sort((a, b) => collatorCompare(a.id, b.id));
        const policyValue = rec?.policy && typeof rec.policy === "object" ? (rec.policy as CatalogPolicy) : null;
        return { models, policy: policyValue };
    }

    // Seed synchronously from the bundled snapshot so the prerendered HTML already
    // contains the full catalog at the correct height. onMount then swaps in live
    // data. Without this the catalog rendered empty at first paint and filled on
    // hydration, producing a ~0.48 cumulative layout shift.
    const snapshotSeed = parsePayload(modelSnapshot);

    let allModels = $state<Model[]>(snapshotSeed.models);
    let policy = $state<CatalogPolicy | null>(snapshotSeed.policy);
    let query = $state("");
    let page = $state(1);
    let prefixes = $state<Set<string>>(new Set());
    let typeFilters = $state<Set<FilterKey>>(new Set());
    let source = $state<"live" | "snapshot" | "error">("snapshot");
    let loadError = $state("");
    let selected = $state<Model | null>(null);
    let mounted = false;

    function togglePrefix(pfx: string): void {
        const next = new Set(prefixes);
        if (next.has(pfx)) next.delete(pfx);
        else next.add(pfx);
        prefixes = next;
        page = 1;
    }

    function toggleType(key: string): void {
        const filterKey = key as FilterKey;
        const next = new Set(typeFilters);
        if (next.has(filterKey)) next.delete(filterKey);
        else next.add(filterKey);
        typeFilters = next;
        page = 1;
    }

    const prefixCounts = $derived.by((): [string, number][] => {
        const m = new Map<string, number>();
        for (const { prefix } of allModels) m.set(prefix, (m.get(prefix) ?? 0) + 1);
        return [...m.entries()].sort((a, b) => b[1] - a[1]);
    });

    const hasAudioModel = $derived(allModels.some((m) => modelSupportsAudio(m)));
    const hasImageModel = $derived(allModels.some((m) => modelSupportsImage(m)));
    const hasGatedModel = $derived(allModels.some((m) => m.requires_seems_legit));

    const filteredModels = $derived(filterModels(allModels, prefixes, typeFilters, query));
    const pageCount = $derived(Math.max(1, Math.ceil(filteredModels.length / PAGE_SIZE)));
    const visibleModels = $derived.by(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredModels.slice(start, start + PAGE_SIZE);
    });

    const clampPage = watchDeps(() => {
        if (page > pageCount) page = pageCount;
    });

    const pruneStalePrefixes = watchDeps(() => {
        if (prefixes.size === 0 || allModels.length === 0) return;
        const valid = new Set(prefixCounts.map(([pfx]) => pfx));
        let dirty = false;
        const next = new Set<string>();
        for (const pfx of prefixes) {
            if (valid.has(pfx)) next.add(pfx);
            else dirty = true;
        }
        if (dirty) {
            prefixes = next;
            page = 1;
        }
    });

    const syncUrl = watchDeps(() => {
        if (typeof window === "undefined" || !mounted) return;
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
    });

    function onEscape(event: KeyboardEvent): void {
        if (event.key === "Escape") selected = null;
    }

    onMount(async () => {
        const params = readCatalogParams();
        if (params.query) query = params.query;
        if (params.prefixes.length > 0) prefixes = new Set(params.prefixes);
        if (params.types.length > 0) typeFilters = new Set(params.types);
        mounted = true;

        document.addEventListener("keydown", onEscape);

        try {
            const { payload, src } = await fetchModels();
            const parsed = parsePayload(payload);
            allModels = parsed.models;
            if (parsed.policy) policy = parsed.policy;
            source = src;

            const livePrefixes = new Set(parsed.models.map((m) => m.prefix));
            const heroChips = document.querySelectorAll(".models-hero-chip");
            heroChips.forEach((chip, i) => {
                const value = i === 0 ? parsed.models.length : livePrefixes.size;
                const label = i === 0 ? "model" : "provider";
                const labelPlural = value === 1 ? label : `${label}s`;
                chip.innerHTML = `<strong>${value}</strong> ${labelPlural}`;
            });
            const lede = document.querySelector(".models-lede");
            if (lede) {
                lede.textContent = `${parsed.models.length} OpenAI-compatible chat, image, and audio model aliases across ${livePrefixes.size} provider prefixes. Search, filter, and copy any alias into your client.`;
            }
        } catch (err) {
            source = "error";
            loadError = err instanceof Error ? err.message : "Failed to load model catalog.";
        }
    });

    onDestroy(() => {
        if (typeof document !== "undefined") document.removeEventListener("keydown", onEscape);
    });

    const providerLabel = $derived(prefixLabel(prefixes));

    const resultLabel = $derived.by(() => {
        if (allModels.length === 0 && source !== "error") return "Loading model catalog...";
        const count = filteredModels.length;
        const plural = count === 1 ? "model" : "models";
        return `${count.toLocaleString()} ${plural} across ${providerLabel}`;
    });

    const filtersActive = $derived(query.trim() !== "" || prefixes.size > 0 || typeFilters.size > 0);

    function clearFilters(): void {
        query = "";
        prefixes = new Set();
        typeFilters = new Set();
        page = 1;
    }

    const verifiedMemberLabel = $derived.by(() => {
        const label = policy?.seems_legit_required_role_label;
        const normalized = label?.toLowerCase().replace(/[\s-]+/g, "_");
        if (!normalized || normalized === "seems_legit") return "Verified members";
        return label ?? "Verified members";
    });

    const visibleTypeOptions = $derived.by((): FilterKey[] => {
        const list: FilterKey[] = ["chat"];
        if (hasImageModel) list.push("image");
        if (hasAudioModel) list.push("audio");
        list.push("long");
        if (hasGatedModel) list.push("gated");
        return list;
    });

    const prefixMenuOptions = $derived<DropdownMenuOption[]>(
        prefixCounts.map(([pfx, count]) => ({ value: pfx, label: `${pfx}/*`, count, checked: prefixes.has(pfx) })),
    );

    const typeMenuOptions = $derived<DropdownMenuOption[]>(
        visibleTypeOptions.map((key) => ({ value: key, label: FILTER_LABELS[key], checked: typeFilters.has(key) })),
    );

    function onQueryChange(value: string): void {
        query = value;
        page = 1;
    }
</script>

<div class="panel catalog-panel" use:clampPage={[page, pageCount]} use:pruneStalePrefixes={[prefixes, allModels]} use:syncUrl={[prefixes, typeFilters, query]}>
    <CatalogOverview models={allModels} />
    <div class="catalog-toolbar">
        <div class="catalog-search-field">
            <TextField class="catalog-search-input" value={query} placeholder="Search model aliases..." oninput={(e) => onQueryChange((e.target as HTMLInputElement).value)} />
        </div>
        <div class="catalog-filter-group">
            <DropdownMenu
                triggerLabel="Prefix"
                valueLabel={prefixButtonLabel(prefixes)}
                activeCount={prefixes.size}
                options={prefixMenuOptions}
                ontoggle={togglePrefix}
            />
            <DropdownMenu
                triggerLabel="Capability"
                valueLabel={typeButtonLabel(typeFilters, FILTER_LABELS)}
                activeCount={typeFilters.size}
                options={typeMenuOptions}
                ontoggle={toggleType}
            />
        </div>
    </div>

    {#if hasGatedModel}
        <blockquote class="catalog-note">
            Orange-outlined models are available to {verifiedMemberLabel}.
        </blockquote>
    {/if}

    <div class="catalog-summary" aria-live="polite">
        <span>{resultLabel}</span>
        {#if filtersActive}
            <button type="button" data-sound="interaction.subtle" onclick={clearFilters}>Clear filters</button>
        {/if}
    </div>

    <div class="catalog-results">
        {#if visibleModels.length > 0}
            {#each visibleModels as model (model.id)}
                <ModelCard {model} onselect={(m) => (selected = m)} />
            {/each}
        {:else}
            <div class="catalog-empty">
                {#if source === "error"}
                    {loadError}
                {:else if allModels.length === 0}
                    <Skeleton width="200" height="14" />
                {:else}
                    No models match your search.
                {/if}
            </div>
        {/if}
    </div>

    <div class="catalog-pagination">
        <span class="catalog-pagination-count">
            {allModels.length === 0 ? "Loading..." : `${filteredModels.length.toLocaleString()} model${filteredModels.length !== 1 ? "s" : ""}`}
        </span>
        <Button variant="ghost" class="pagination-button" disabled={page <= 1} onclick={() => (page -= 1)}>Previous</Button>
        <span class="catalog-pagination-text">{page} / {pageCount}</span>
        <Button variant="ghost" class="pagination-button" disabled={page >= pageCount} onclick={() => (page += 1)}>Next</Button>
    </div>

    {#if selected}
        <ModelDetailModal model={selected} verifiedLabel={verifiedMemberLabel} onclose={() => (selected = null)} />
    {/if}
</div>
