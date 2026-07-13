<script setup lang="ts">
import { computed, ref } from "vue";
import type { Model } from "@/entities/model";
import { modelContext, modelRoutes, modelSupportsAudio, modelSupportsImage } from "@/entities/model";
import { Drawer } from "@/shared/ui";

const props = defineProps<{ model: Model; verifiedLabel: string }>();
const emit = defineEmits<{ close: [] }>();

const open = ref(true);
const ctx = computed(() => modelContext(props.model));
const maxInput = computed(() => (props.model.prefix === "sky" ? ctx.value : props.model.max_input_tokens));
const routes = computed(() => modelRoutes(props.model));
const copyLabel = ref("Copy alias");

function onOpenUpdate(value: boolean): void {
    open.value = value;
    if (!value) emit("close");
}

function copyAlias(): void {
    navigator.clipboard.writeText(props.model.id).catch((error) => {
        console.error("Failed to copy model alias", error);
    });
    copyLabel.value = "Copied";
    setTimeout(() => {
        copyLabel.value = "Copy alias";
    }, 1500);
}

const formatTokensFull = (n: number): string => n.toLocaleString();
</script>

<template>
    <Drawer
        :model-value="open"
        :label="`Details for ${model.id}`"
        @update:model-value="onOpenUpdate"
        :popup-class="`model-detail-drawer${model.requires_seems_legit ? ' is-gated' : ''}`"
    >
        <article class="model-modal">
            <header class="model-modal-head">
                <span class="model-modal-prefix">{{ model.prefix }}/*</span>
                <code class="model-modal-id">{{ model.id }}</code>
            </header>

            <section class="model-modal-meta">
                <div v-if="ctx > 0">
                    <span>Context window</span>
                    <strong>{{ formatTokensFull(ctx) }} tokens</strong>
                </div>
                <div v-if="maxInput !== undefined && maxInput !== ctx">
                    <span>Max input</span>
                    <strong>{{ formatTokensFull(maxInput) }} tokens</strong>
                </div>
                <div v-if="model.max_output_tokens !== undefined">
                    <span>Max output</span>
                    <strong>{{ formatTokensFull(model.max_output_tokens) }} tokens</strong>
                </div>
                <div>
                    <span>Provider prefix</span>
                    <strong>{{ model.prefix }}/*</strong>
                </div>
                <div>
                    <span>Audio route</span>
                    <strong>{{ modelSupportsAudio(model) ? "Yes" : "No" }}</strong>
                </div>
                <div>
                    <span>Image route</span>
                    <strong>{{ modelSupportsImage(model) ? "Yes" : "No" }}</strong>
                </div>
                <div v-if="model.visibility">
                    <span>Visibility</span>
                    <strong>{{ model.visibility === "role_gated" ? "Verified members" : "Public catalog" }}</strong>
                </div>
                <div v-if="model.requires_seems_legit">
                    <span>Access</span>
                    <strong>Verified members only</strong>
                </div>
            </section>

            <p v-if="model.requires_seems_legit" class="model-modal-gate">
                <span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
                <span>
                    This model is available to {{ verifiedLabel }} on the FreeTheAi Discord server.
                    Run <code>/checkin</code> daily once you have access.
                </span>
            </p>

            <section class="model-modal-routes">
                <h4>Supported API routes</h4>
                <p>Use the same API key and model alias on the supported route for this model.</p>
                <ul>
                    <li v-for="(route, i) in routes" :key="i">
                        <code>{{ route.method }} {{ route.path }}</code>
                        <span>{{ route.description }}</span>
                    </li>
                </ul>
            </section>

            <footer class="model-modal-foot">
                <button type="button" class="model-modal-copy" data-sound="interaction.confirm" @click="copyAlias">
                    {{ copyLabel }}
                </button>
                <router-link class="model-modal-docs" to="/docs#compatibility">View API docs</router-link>
            </footer>
        </article>
    </Drawer>
</template>
