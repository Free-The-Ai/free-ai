/**
 * Toast store — minimal module-level singleton mirroring the sound/motion/
 * theme singletons. A plain Svelte store so ToastRegion.svelte stays a
 * native Svelte list (replaces the previous Vue `reactive` array).
 *
 * Exposes window.__toastManager for parity with the previous public surface
 * (nothing in-repo calls it today, but it is kept as a stable external hook).
 */
import { writable } from "svelte/store";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastEntry {
    id: string;
    title?: string;
    description?: string;
    type: ToastType;
}

export interface AddToastInput {
    title?: string;
    description?: string;
    type?: ToastType;
}

const TIMEOUT_MS = 5000;
const LIMIT = 3;

export const toasts = writable<ToastEntry[]>([]);

let counter = 0;

export function addToast(input: AddToastInput): string {
    const id = `toast-${++counter}`;
    toasts.update((list) => {
        const next = [...list, { id, title: input.title, description: input.description, type: input.type ?? "info" }];
        return next.length > LIMIT ? next.slice(next.length - LIMIT) : next;
    });
    setTimeout(() => closeToast(id), TIMEOUT_MS);
    return id;
}

export function closeToast(id: string): void {
    toasts.update((list) => list.filter((toast) => toast.id !== id));
}

export function initToastManager(): void {
    if (typeof window === "undefined") return;
    (window as unknown as Record<string, unknown>).__toastManager = {
        add: addToast,
        close: closeToast,
    };
}
