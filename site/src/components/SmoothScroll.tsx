import { onMount, onCleanup } from "solid-js";

// Shared scroll ratio for canvas sync
export let scrollRatio = 0;

export default function SmoothScroll() {
  onMount(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      scrollRatio = maxY > 0 ? Math.max(0, Math.min(1, window.scrollY / maxY)) : 0;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    onCleanup(() => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    });
  });

  return null;
}
