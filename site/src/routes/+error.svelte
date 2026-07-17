<script lang="ts">
    import { page } from "$app/state";
    import NotFoundPage from "@/pages/not-found/ui/NotFoundPage.svelte";
</script>

{#if page.status === 404}
    <NotFoundPage />
{:else}
    <main class="not-found-main">
        <section class="not-found-card shell">
            <span class="eyebrow">Error {page.status}</span>
            <h1>Something went wrong.</h1>
            <p class="not-found-lede">{page.error?.message ?? "An unexpected error occurred."}</p>
            <a class="explainer-secondary" href="/home">Back to home</a>
        </section>
    </main>
{/if}
