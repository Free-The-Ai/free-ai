import { For, type JSXElement } from "solid-js";

interface DocsSection {
    value: string;
    label: string;
    eyebrow: string;
    children: JSXElement;
}

interface DocsAccordionProps {
    baseSnippet: string;
    baseSnippetHtml?: string;
    chatCurlSnippet: string;
    chatCurlSnippetHtml?: string;
    openAISDKSnippet: string;
    openAISDKSnippetHtml?: string;
    messagesSnippet: string;
    messagesSnippetHtml?: string;
    modelListSnippet: string;
    modelListSnippetHtml?: string;
    fullModelListSnippet: string;
    fullModelListSnippetHtml?: string;
    vhrImageSnippet: string;
    vhrImageSnippetHtml?: string;
    imageEditSnippet: string;
    imageEditSnippetHtml?: string;
    pythonImageSnippet: string;
    pythonImageSnippetHtml?: string;
    endpoints: [string, string, string][];
    imageModels: [string, string, string][];
}

function CodeBlock(props: { code: string; lang?: string; html?: string }) {
    return (
        <div class="docs-code-group">
            {props.lang ? (
                <div class="docs-code-bar">
                    <span class="docs-code-lang">{props.lang}</span>
                    <button
                        class="copy-btn"
                        type="button"
                        title="Copy"
                        aria-label="Copy to clipboard"
                    >
                        <span class="material-symbols-outlined">
                            content_copy
                        </span>
                    </button>
                </div>
            ) : (
                <button
                    class="copy-btn"
                    type="button"
                    title="Copy"
                    aria-label="Copy to clipboard"
                >
                    <span class="material-symbols-outlined">content_copy</span>
                </button>
            )}
            {props.html ? (
                <div class="shiki-wrapper" innerHTML={props.html} />
            ) : (
                <pre>
                    <code>{props.code}</code>
                </pre>
            )}
        </div>
    );
}

interface DocsRow {
    code: string;
    span: string | number | JSXElement;
}

function DocsRowTable(props: { rows: DocsRow[]; compact?: boolean }) {
    return (
        <div class={`docs-table${props.compact ? " compact" : ""}`}>
            <For each={props.rows}>
                {(row) => (
                    <div class="docs-row">
                        <code>{row.code}</code>
                        <span>{row.span}</span>
                    </div>
                )}
            </For>
        </div>
    );
}

interface DocsCodeGridItem {
    title: string;
    code: string;
    html?: string;
    lang?: string;
}

function DocsCodeGrid(props: { items: DocsCodeGridItem[] }) {
    return (
        <div class="docs-code-grid">
            <For each={props.items}>
                {(item) => (
                    <div>
                        <h3>{item.title}</h3>
                        <CodeBlock code={item.code} html={item.html} lang={item.lang} />
                    </div>
                )}
            </For>
        </div>
    );
}

export default function DocsAccordion(props: DocsAccordionProps) {
    const items: DocsSection[] = [
        {
            value: "auth",
            label: "Get a key",
            eyebrow: "Auth",
            children: (
                <section class="docs-card">
                    <p>
                        Join Discord and run <code>/signup</code>. The bot opens
                        a modal that asks for your use case, bot-disclosure
                        answer, and a randomized human challenge. Send the issued
                        key as a bearer token.
                    </p>
                    <DocsRowTable compact rows={[
                        { code: "/signup", span: "Creates a key after the modal is completed. Existing keys are rejected; use /resetkey instead." },
                        { code: "/checkin", span: "Required once per UTC day. Enter your existing API key and solve the randomized challenge before using the free API." },
                        { code: "/resetkey", span: "Rotates a lost key after a real reset reason and challenge answer. Your account history stays linked." },
                    ]} />
                    <CodeBlock
                        code={props.baseSnippet}
                        html={props.baseSnippetHtml}
                        lang="plaintext"
                    />
                </section>
            ),
        },
        {
            value: "endpoints",
            label: "Supported routes",
            eyebrow: "Endpoints",
            children: (
                <section class="docs-card">
                    <div class="docs-table">
                        <For each={props.endpoints}>
                            {([method, route, desc]) => (
                                <div class="docs-row">
                                    <code>{method}</code>
                                    <code>{route}</code>
                                    <span>{desc}</span>
                                </div>
                            )}
                        </For>
                    </div>
                </section>
            ),
        },
        {
            value: "compatibility",
            label: "Cross-compatible client formats",
            eyebrow: "Compatibility",
            children: (
                <section class="docs-card">
                    <p>
                        FreeTheAi supports multiple API formats for easier client
                        compatibility. You can use OpenAI-compatible Chat
                        Completions, Anthropic-compatible Messages, and Responses-style
                        routes with the same API key and the same model aliases.
                    </p>
                    <DocsRowTable compact rows={[
                        { code: "POST /v1/chat/completions", span: "OpenAI-compatible chat completions. Streaming, tool calling, and structured outputs." },
                        { code: "POST /v1/messages", span: "Anthropic-compatible Messages route. System prompts, tool use, and the same content blocks Claude clients expect." },
                        { code: "POST /v1/responses", span: "Responses-style route. Same key, same model alias." },
                        { code: "GET /v1/models", span: "Authenticated client catalog." },
                        { code: "GET /v1/models/full", span: "Catalog with context, output, image-support, and access metadata." },
                        { code: "POST /v1/audio/speech", span: "Text-to-speech route for supported role-gated voice aliases." },
                        { code: "POST /v1/audio/transcriptions", span: "Speech-to-text route for OpenAI-style multipart audio uploads." },
                    ]} />
                    <p>
                        Pick the route that matches your client. The model alias
                        and the key never change between formats.
                    </p>
                </section>
            ),
        },
        {
            value: "chat",
            label: "OpenAI-compatible chat",
            eyebrow: "Chat Completions",
            children: (
                <section class="docs-card">
                    <p>
                        Point OpenAI-compatible clients at{" "}
                        <code>https://api.freetheai.xyz/v1</code>. Use exact
                        model aliases from <a href="/models">/models</a>.
                    </p>
                    <DocsCodeGrid items={[
                        { title: "curl", code: props.chatCurlSnippet, html: props.chatCurlSnippetHtml, lang: "bash" },
                        { title: "JavaScript SDK", code: props.openAISDKSnippet, html: props.openAISDKSnippetHtml, lang: "javascript" },
                    ]} />
                </section>
            ),
        },
        {
            value: "messages",
            label: "Anthropic-style clients",
            eyebrow: "Messages API",
            children: (
                <section class="docs-card">
                    <p>
                        Use <code>/v1/messages</code> for clients that expect
                        Anthropic-style request bodies.
                    </p>
                    <CodeBlock
                        code={props.messagesSnippet}
                        html={props.messagesSnippetHtml}
                        lang="bash"
                    />
                </section>
            ),
        },
        {
            value: "models",
            label: "List models",
            eyebrow: "Model Catalog",
            children: (
                <section class="docs-card">
                    <p>
                        Use <code>/v1/models</code> for normal clients. Use{" "}
                        <code>/v1/models/full</code>
                        when you need tier and catalog metadata for a UI.
                    </p>
                    <DocsCodeGrid items={[
                        { title: "Client catalog", code: props.modelListSnippet, html: props.modelListSnippetHtml, lang: "bash" },
                        { title: "Full catalog", code: props.fullModelListSnippet, html: props.fullModelListSnippetHtml, lang: "bash" },
                    ]} />
                </section>
            ),
        },
        {
            value: "images",
            label: "Generate and edit images",
            eyebrow: "Images",
            children: (
                <section class="docs-card">
                    <p>
                        Use <code>/v1/images/generations</code> for
                        text-to-image. Use
                        <code>/v1/images/edits</code> only with{" "}
                        <code>img/gpt-image-2</code>. Generation responses may
                        contain either <code>b64_json</code> or <code>url</code>
                        , so robust clients should support both.
                    </p>
                    <div class="docs-table">
                        <For each={props.imageModels}>
                            {([model, support, desc]) => (
                                <div class="docs-row">
                                    <code>{model}</code>
                                    <span>{support}</span>
                                    <span>{desc}</span>
                                </div>
                            )}
                        </For>
                    </div>
                    <DocsCodeGrid items={[
                        { title: "Image generation", code: props.vhrImageSnippet, html: props.vhrImageSnippetHtml, lang: "bash" },
                        { title: "Image edit", code: props.imageEditSnippet, html: props.imageEditSnippetHtml, lang: "bash" },
                    ]} />
                    <h3>Python save helper</h3>
                    <CodeBlock
                        code={props.pythonImageSnippet}
                        html={props.pythonImageSnippetHtml}
                        lang="python"
                    />
                </section>
            ),
        },
        {
            value: "errors",
            label: "Errors and rate limits",
            eyebrow: "Errors",
            children: (
                <section class="docs-card docs-errors">
                    <div class="docs-errors-shape">
                        <h3>Error shape</h3>
                        <p>
                            Most API errors use the OpenAI-style envelope. The
                            <code>type</code> field is the machine-readable code
                            you should branch on; <code>message</code> is the
                            human-readable string.
                        </p>
                        <pre>
                            <code>{`{
  "error": {
    "message": "human readable message",
    "type": "machine_readable_type"
  }
}`}</code>
                        </pre>
                        <p>
                            Streaming requests can fail mid-stream after the SSE
                            connection has already opened. In that case the API
                            sends an error event followed by{" "}
                            <code>data: [DONE]</code>:
                        </p>
                        <pre>
                            <code>{`data: {"error":{"message":"upstream provider temporarily unavailable","type":"provider_error"}}

data: [DONE]`}</code>
                        </pre>
                        <p>
                            Some <code>bbg/*</code> errors include a short public
                            diagnostic id you can quote in Discord support, for
                            example <code>Error id: bbg-xxxxxxxxxxxx</code>.
                        </p>
                    </div>

                    <div class="docs-errors-group">
                        <h3>Auth, check-in, and role gates</h3>
                        <DocsRowTable compact rows={[
                            { code: "401 invalid_api_key", span: <>Missing, invalid, revoked, or inactive key. Send the exact key from <code>/signup</code> as <code>Authorization: Bearer YOUR_KEY</code> with no quotes, markdown, or extra spaces.</> },
                            { code: "403 daily_checkin_required", span: <>Key is valid but the Discord owner has not checked in today. Run <code>/checkin</code> in the FreeTheAi Discord server.</> },
                            { code: "403 model_access_denied", span: <>Model is limited to <strong>Verified members</strong>, earned through active server participation.</> },
                            { code: "403 discord_membership_required", span: "Key owner left the Discord. Rejoin with the same Discord account that owns the key." },
                            { code: "403 user_paused", span: "Account paused by staff. Staff action required." },
                            { code: "403 ip_blacklisted", span: "Source IP is banned. No client-side fix; staff action required." },
                            { code: "403 client_signature_banned", span: "Banned client signature. Switch to a supported client; staff action may be required." },
                        ]} />
                    </div>

                    <div class="docs-errors-group">
                        <h3>Request validation</h3>
                        <DocsRowTable compact rows={[
                            { code: "400 invalid_request_error", span: <>Bad JSON, missing field, unknown alias, or unsupported route. Common messages: <em>invalid json payload</em>, <em>missing model</em>, <em>missing prompt</em>, <em>unknown aliased model</em>, <em>unsupported responses input shape</em>, <em>upstream rejected the request payload</em>. Use a model from <code>GET /v1/models</code>.</> },
                            { code: "400 context_length_exceeded", span: "Prompt or request is too large. Reduce context, attachments, message history, or requested output tokens." },
                            { code: "400 content_policy_violation", span: "Blocked by moderation/safety filters. Change the prompt content." },
                            { code: "404 invalid_request_error", span: "Currently used for deferred video lookup when the request id is unknown." },
                        ]} />
                    </div>

                    <div class="docs-errors-group">
                        <h3>Rate limits, daily caps, and concurrency</h3>
                        <DocsRowTable compact rows={[
                            { code: "429 rate_limit_error", span: <>Per-minute, daily-success cap, image cap, image cooldown, upstream rate limit, or anti-abuse overlap block. Honor <code>Retry-After</code> when present and wait for the next UTC reset.</> },
                            { code: "429 concurrency_limit_error", span: "Already running the maximum allowed parallel requests. Wait for one to finish." },
                            { code: "429 glm_depleted", span: "GLM provider quota is depleted for the current 5-hour window. Retry later." },
                            { code: "499 client_canceled", span: "Client disconnected while the request was still running. Keep the connection open until the response completes." },
                        ]} />
                    </div>

                    <div class="docs-errors-group">
                        <h3>Provider and gateway</h3>
                        <DocsRowTable compact rows={[
                            { code: "502 provider_error", span: "Provider call/read/translation failed. Retry, or try another model. If it persists, report the model and timestamp." },
                            { code: "503 provider_unavailable", span: <>Provider account pool is cooling down, busy, or upstream returned 5xx. Retry after <code>Retry-After</code> (typically 30s).</> },
                            { code: "504 provider_timeout", span: "Provider took too long. Retry with smaller context/output or use streaming." },
                            { code: "500 server_error", span: "Internal gateway error. Not user-fixable. Retry once, then report it." },
                            { code: "503 server_error", span: "Internal dependency unavailable (DB, store, handler). Retry shortly." },
                            { code: "503 discord_membership_error", span: "Discord membership/role lookup failed temporarily. Retry shortly." },
                        ]} />
                    </div>

                    <div class="docs-errors-group">
                        <h3>Site-only catalog and stats endpoints</h3>
                        <DocsRowTable compact rows={[
                            { code: "401 invalid_request_error", span: <>Site-only endpoints (e.g. full catalog with metadata) need <code>Authorization: Bearer freetheai.xyz</code>. Common messages: <em>invalid site catalog key</em>, <em>invalid site stats key</em>.</> },
                        ]} />
                    </div>

                    <div class="docs-errors-group">
                        <h3>Headers to respect</h3>
                        <p>
                            Rate, concurrency, and cooldown errors include
                            machine-readable headers. Clients should branch on
                            these rather than parsing the human message.
                        </p>
                        <DocsRowTable compact rows={[
                            { code: "Retry-After", span: "Seconds to wait before retrying." },
                            { code: "X-RateLimit-*", span: <><code>Limit</code>, <code>Remaining</code>, <code>Reset</code> for per-minute requests.</> },
                            { code: "X-Concurrency-*", span: <><code>Limit</code>, <code>Remaining</code>, <code>Reset</code> for parallel requests.</> },
                            { code: "X-DailyLimit-*", span: <><code>Limit</code>, <code>Remaining</code>, <code>Reset</code> for the daily success cap.</> },
                            { code: "X-ImageDailyLimit-*", span: "Daily image-generation cap headers." },
                            { code: "X-ImageGenerationCooldown-*", span: "Per-user image-generation cooldown headers." },
                        ]} />
                    </div>

                    <div class="docs-errors-group">
                        <h3>One-line user copy</h3>
                        <DocsRowTable compact rows={[
                            { code: "401 invalid_api_key", span: "Your API key is missing or wrong." },
                            { code: "403 daily_checkin_required", span: <>Run <code>/checkin</code> in Discord.</> },
                            { code: "403 model_access_denied", span: "This model is for Verified members." },
                            { code: "400 invalid_request_error", span: "Your request body, model, or route is wrong." },
                            { code: "400 context_length_exceeded", span: "Your prompt or context is too large." },
                            { code: "400 content_policy_violation", span: "The request was blocked by moderation." },
                            { code: "429 rate_limit_error", span: "You hit a rate limit, daily cap, or cooldown." },
                            { code: "429 concurrency_limit_error", span: "Wait for your active request to finish." },
                            { code: "502 provider_error", span: "Provider failed unexpectedly. Retry or try another model." },
                            { code: "503 provider_unavailable", span: "Provider is temporarily unavailable." },
                            { code: "504 provider_timeout", span: "Provider took too long." },
                            { code: "500/503 server_error", span: "Gateway internal issue. Retry once." },
                        ]} />
                    </div>
                </section>
            ),
        },
    ];

    return (
        <div class="docs-sections">
            <For each={items}>
                {(item) => (
                    <article class="docs-section" id={item.value}>
                        <header class="docs-section-head">
                            <span class="docs-section-eyebrow">
                                {item.eyebrow}
                            </span>
                            <h2>{item.label}</h2>
                        </header>
                        {item.children}
                    </article>
                )}
            </For>
        </div>
    );
}
