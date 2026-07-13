import type { Model } from "@/entities/model";
import { modelContext, modelSupportsAudio, modelSupportsImage } from "@/entities/model";

export const FILTER_OPTIONS = ["chat", "image", "audio", "gated", "long"] as const;
export type FilterKey = (typeof FILTER_OPTIONS)[number];

export const FILTER_LABELS: Record<FilterKey, string> = {
    chat: "Chat",
    image: "Image",
    audio: "Audio",
    long: "128k+ context",
    gated: "Verified members",
};

const TYPE_PREDICATES: Record<FilterKey, (m: Model) => boolean> = {
    chat: (m) => !modelSupportsAudio(m) && !modelSupportsImage(m),
    image: (m) => modelSupportsImage(m),
    audio: (m) => modelSupportsAudio(m),
    gated: (m) => !!m.requires_seems_legit,
    long: (m) => modelContext(m) >= 128_000,
};

const matchesAnyType = (m: Model, types: Set<FilterKey>): boolean => {
    for (const key of types) {
        if (TYPE_PREDICATES[key](m)) return true;
    }
    return false;
};

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export const filterModels = (models: Model[], prefixSet: Set<string>, typeSet: Set<FilterKey>, query: string): Model[] => {
    let filtered = models;
    if (prefixSet.size > 0) filtered = filtered.filter((m) => prefixSet.has(m.prefix));
    if (typeSet.size > 0) filtered = filtered.filter((m) => matchesAnyType(m, typeSet));
    const q = query.trim().toLowerCase();
    if (q) filtered = filtered.filter((m) => m.id.toLowerCase().includes(q));
    return [...filtered].sort((a, b) => {
        const access = Number(a.requires_seems_legit === true) - Number(b.requires_seems_legit === true);
        if (access !== 0) return access;
        const ctx = modelContext(b) - modelContext(a);
        return ctx !== 0 ? ctx : collator.compare(a.id, b.id);
    });
};

export const prefixLabel = (sel: Set<string>): string => {
    if (sel.size === 0) return "all providers";
    if (sel.size === 1) {
        const [only] = sel;
        return `${only}/*`;
    }
    return `${sel.size} providers`;
};

export const prefixButtonLabel = (sel: Set<string>): string => {
    if (sel.size === 0) return "All prefixes";
    if (sel.size === 1) {
        const [only] = sel;
        return `${only}/*`;
    }
    return `${sel.size} prefixes`;
};

export const typeButtonLabel = (sel: Set<FilterKey>, labels: Record<FilterKey, string>): string => {
    if (sel.size === 0) return "All capabilities";
    if (sel.size === 1) {
        const [only] = sel;
        return labels[only];
    }
    return `${sel.size} capabilities`;
};

export const readCatalogParams = (): { prefixes: string[]; types: FilterKey[]; query: string } => {
    if (typeof window === "undefined") return { prefixes: [], types: [], query: "" };
    const params = new URLSearchParams(window.location.search);
    const parseParam = (key: string): string => params.get(key)?.trim() || "";
    const rawPrefix = parseParam("prefix");
    const prefixes = rawPrefix && !/^(all|\*)$/.test(rawPrefix) ? rawPrefix.split(",").map((p) => p.trim()).filter(Boolean) : [];
    const legacyType = parseParam("type") || (params.get("seemslegit") === "1" ? "gated" : "");
    const validKeys = new Set<string>(FILTER_OPTIONS);
    return {
        prefixes,
        types: legacyType ? (legacyType.split(",").map((t) => t.trim()).filter((t) => validKeys.has(t)) as FilterKey[]) : [],
        query: parseParam("q"),
    };
};

export const collatorCompare = (a: string, b: string): number => collator.compare(a, b);
