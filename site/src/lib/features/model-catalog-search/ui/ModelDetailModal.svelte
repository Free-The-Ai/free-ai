<script lang="ts">
    import type { Model } from "@/entities/model";
    import { modelContext, modelRoutes, modelSupportsAudio, modelSupportsImage } from "@/entities/model";
    import { Drawer } from "@/shared/ui";

    let { model, verifiedLabel, onclose }: { model: Model; verifiedLabel: string; onclose?: () => void } = $props();

    let open = $state(true);
    const ctx = $derived(modelContext(model));
    const maxInput = $derived(model.prefix === "sky" ? ctx : model.max_input_tokens);
    const routes = $derived(modelRoutes(model));
    let copyLabel = $state("Copy alias");

    function setOpen(value: boolean): void {
        open = value;
        if (!value) onclose?.();
    }

    function copyAlias(): void {
        navigator.clipboard.writeText(model.id).catch((error) => {
            console.error("Failed to copy model alias", error);
        });
        copyLabel = "Copied";
        setTimeout(() => {
            copyLabel = "Copy alias";
        }, 1500);
    }

    const formatTokensFull = (n: number): string => n.toLocaleString();
</script>

<Drawer
    bind:open={() => open, setOpen}
    label={`Details for ${model.id}`}
    popupClass={`model-detail-drawer${model.requires_seems_legit ? " is-gated" : ""}`}
>
    <article class="model-modal">
        <header class="model-modal-head">
            <span class="model-modal-prefix">{model.prefix}/*</span>
            <code class="model-modal-id">{model.id}</code>
        </header>

        <section class="model-modal-meta">
            {#if ctx > 0}
                <div>
                    <span>Context window</span>
                    <strong>{formatTokensFull(ctx)} tokens</strong>
                </div>
            {/if}
            {#if maxInput !== undefined && maxInput !== ctx}
                <div>
                    <span>Max input</span>
                    <strong>{formatTokensFull(maxInput)} tokens</strong>
                </div>
            {/if}
            {#if model.max_output_tokens !== undefined}
                <div>
                    <span>Max output</span>
                    <strong>{formatTokensFull(model.max_output_tokens)} tokens</strong>
                </div>
            {/if}
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
            {#if model.visibility}
                <div>
                    <span>Visibility</span>
                    <strong>{model.visibility === "role_gated" ? "Verified members" : "Public catalog"}</strong>
                </div>
            {/if}
            {#if model.requires_seems_legit}
                <div>
                    <span>Access</span>
                    <strong>Verified members only</strong>
                </div>
            {/if}
        </section>

        {#if model.requires_seems_legit}
            <p class="model-modal-gate">
                <span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
                <span>
                    This model is available to {verifiedLabel} on the FreeTheAi Discord server.
                    Run <code>/checkin</code> daily once you have access.
                </span>
            </p>
        {/if}

        <section class="model-modal-routes">
            <h4>Supported API routes</h4>
            <p>Use the same API key and model alias on the supported route for this model.</p>
            <ul>
                {#each routes as route, i (i)}
                    <li>
                        <code>{route.method} {route.path}</code>
                        <span>{route.description}</span>
                    </li>
                {/each}
            </ul>
        </section>

        <footer class="model-modal-foot">
            <button type="button" class="model-modal-copy" data-sound="interaction.confirm" onclick={copyAlias}>
                {copyLabel}
            </button>
            <a class="model-modal-docs" href="/docs#compatibility">View API docs</a>
        </footer>
    </article>
</Drawer>
