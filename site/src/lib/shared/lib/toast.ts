/**
 * Toast store — Svelte 5 rune-based reactive singleton.
 * Replaces the previous writable() store with $state runes.
 */

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastEntry {
    id: string;
    title?: string;
    description?: string;
    type: ToastType;
    closing?: boolean;
}

export interface AddToastInput {
    title?: string;
    description?: string;
    type?: ToastType;
}

const TIMEOUT_MS = 5000;
const LIMIT = 3;

class ToastState {
    items = $state<ToastEntry[]>([]);

    add(input: AddToastInput): string {
        const id = `toast-${++counter}`;
        const entry: ToastEntry = {
            id,
            title: input.title,
            description: input.description,
            type: input.type ?? "info",
        };
        this.items = this.items.length >= LIMIT
            ? [...this.items.slice(1), entry]
            : [...this.items, entry];
        setTimeout(() => this.close(id), TIMEOUT_MS);
        return id;
    }

    close(id: string): void {
        let found = false;
        this.items = this.items.map((toast) => {
            if (toast.id !== id || toast.closing) return toast;
            found = true;
            return { ...toast, closing: true };
        });
        if (found) {
            setTimeout(() => {
                this.items = this.items.filter((t) => t.id !== id);
            }, 120);
        }
    }
}

let counter = 0;

/** Singleton — import in ToastRegion and any component that needs to show toasts. */
export const toastState = new ToastState();

export function addToast(input: AddToastInput): string {
    return toastState.add(input);
}

export function closeToast(id: string): void {
    toastState.close(id);
}

export function initToastManager(): void {
    if (typeof window === "undefined") return;
    (window as unknown as Record<string, unknown>).__toastManager = {
        add: addToast,
        close: closeToast,
    };
}
