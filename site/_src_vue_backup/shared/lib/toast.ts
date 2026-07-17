/**
 * Toast store — minimal module-level singleton mirroring the sound/motion/
 * theme singletons. Replaces @base-ui/react's Toast.createToastManager()
 * with plain reactive state so ToastRegion.vue can stay a native Vue list.
 *
 * Exposes window.__toastManager for parity with the previous public surface
 * (nothing in-repo calls it today, but it is kept as a stable external hook).
 */
import { reactive } from "vue";

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

export const toasts = reactive<ToastEntry[]>([]);

let counter = 0;

export function addToast(input: AddToastInput): string {
    const id = `toast-${++counter}`;
    toasts.push({ id, title: input.title, description: input.description, type: input.type ?? "info" });
    if (toasts.length > LIMIT) toasts.splice(0, toasts.length - LIMIT);
    setTimeout(() => closeToast(id), TIMEOUT_MS);
    return id;
}

export function closeToast(id: string): void {
    const index = toasts.findIndex((toast) => toast.id === id);
    if (index !== -1) toasts.splice(index, 1);
}

export function initToastManager(): void {
    if (typeof window === "undefined") return;
    (window as unknown as Record<string, unknown>).__toastManager = {
        add: addToast,
        close: closeToast,
    };
}
