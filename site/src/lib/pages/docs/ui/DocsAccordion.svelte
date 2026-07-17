<script lang="ts">
    interface DocsRow {
        code: string;
        span: string;
        html?: boolean;
    }

    let {
        baseSnippet,
        baseSnippetHtml,
        chatCurlSnippet,
        chatCurlSnippetHtml,
        openaiSdkSnippet,
        openaiSdkSnippetHtml,
        messagesSnippet,
        messagesSnippetHtml,
        modelListSnippet,
        modelListSnippetHtml,
        fullModelListSnippet,
        fullModelListSnippetHtml,
        endpoints,
    }: {
        baseSnippet: string;
        baseSnippetHtml?: string;
        chatCurlSnippet: string;
        chatCurlSnippetHtml?: string;
        openaiSdkSnippet: string;
        openaiSdkSnippetHtml?: string;
        messagesSnippet: string;
        messagesSnippetHtml?: string;
        modelListSnippet: string;
        modelListSnippetHtml?: string;
        fullModelListSnippet: string;
        fullModelListSnippetHtml?: string;
        endpoints: [string, string, string][];
    } = $props();

    const authRows: DocsRow[] = [
        { code: "/signup", span: "Creates a key after the modal is completed. Existing keys are rejected; use /resetkey instead." },
        { code: "/checkin", span: "Required once per UTC day. Enter your existing API key and solve the randomized challenge before using the free API." },
        { code: "/resetkey", span: "Rotates a lost key after a real reset reason and challenge answer. Your account history stays linked." },
    ];

    const authGateRows: DocsRow[] = [
        { code: "401 invalid_api_key", span: 'Missing, invalid, revoked, or inactive key. Send the exact key from <code>/signup</code> as <code>Authorization: Bearer YOUR_KEY</code> with no quotes, markdown, or extra spaces.', html: true },
        { code: "403 daily_checkin_required", span: 'Key is valid but the Discord owner has not checked in today. Run <code>/checkin</code> in the FreeTheAi Discord server.', html: true },
        { code: "403 model_access_denied", span: 'Model is limited to <strong>Verified members</strong>, earned through active server participation.', html: true },
        { code: "403 discord_membership_required", span: "Key owner left the Discord. Rejoin with the same Discord account that owns the key." },
        { code: "403 user_paused", span: "Account paused by staff. Staff action required." },
        { code: "403 ip_blacklisted", span: "Source IP is banned. No client-side fix; staff action required." },
        { code: "403 client_signature_banned", span: "Banned client signature. Switch to a supported client; staff action may be required." },
    ];

    const validationRows: DocsRow[] = [
        { code: "400 invalid_request_error", span: 'Bad JSON, missing field, unknown alias, or unsupported route. Common messages: <em>invalid json payload</em>, <em>missing model</em>, <em>missing prompt</em>, <em>unknown aliased model</em>, <em>unsupported responses input shape</em>, <em>provider rejected the request payload</em>. Use a model from <code>GET /v1/models</code>.', html: true },
        { code: "400 context_length_exceeded", span: "Prompt or request is too large. Reduce context, attachments, message history, or requested output tokens." },
        { code: "400 content_policy_violation", span: "Blocked by moderation/safety filters. Change the prompt content." },
        { code: "404 invalid_request_error", span: "Currently used for deferred video lookup when the request id is unknown." },
    ];

    const rateLimitRows: DocsRow[] = [
        { code: "429 rate_limit_error", span: 'Per-minute, daily-success cap, provider rate limit, or anti-abuse overlap block. Honor <code>Retry-After</code> when present and wait for the next UTC reset.', html: true },
        { code: "429 concurrency_limit_error", span: "Already running the maximum allowed parallel requests. Wait for one to finish." },
        { code: "429 glm_depleted", span: "GLM provider quota is depleted for the current 5-hour window. Retry later." },
        { code: "499 client_canceled", span: "Client disconnected while the request was still running. Keep the connection open until the response completes." },
    ];

    const providerRows: DocsRow[] = [
        { code: "502 provider_error", span: "Provider call/read/translation failed. Retry, or try another model. If it persists, report the model and timestamp." },
        { code: "503 provider_unavailable", span: 'Provider capacity is cooling down, busy, or temporarily unhealthy. Retry after <code>Retry-After</code> (typically 30s).', html: true },
        { code: "504 provider_timeout", span: "Provider took too long. Retry with smaller context/output or use streaming." },
        { code: "500 server_error", span: "Internal gateway error. Not user-fixable. Retry once, then report it." },
        { code: "503 server_error", span: "Internal dependency unavailable (DB, store, handler). Retry shortly." },
        { code: "503 discord_membership_error", span: "Discord membership/role lookup failed temporarily. Retry shortly." },
    ];

    const siteOnlyRows: DocsRow[] = [
        { code: "401 invalid_request_error", span: 'Site-only endpoints (e.g. full catalog with metadata) need <code>Authorization: Bearer freetheai.xyz</code>. Common messages: <em>invalid site catalog key</em>, <em>invalid site stats key</em>.', html: true },
    ];

    const headerRows: DocsRow[] = [
        { code: "Retry-After", span: "Seconds to wait before retrying." },
        { code: "X-RateLimit-*", span: "<code>Limit</code>, <code>Remaining</code>, <code>Reset</code> for per-minute requests.", html: true },
        { code: "X-Concurrency-*", span: "<code>Limit</code>, <code>Remaining</code>, <code>Reset</code> for parallel requests.", html: true },
        { code: "X-DailyLimit-*", span: "<code>Limit</code>, <code>Remaining</code>, <code>Reset</code> for the daily success cap.", html: true },
    ];

    const oneLineRows: DocsRow[] = [
        { code: "401 invalid_api_key", span: "Your API key is missing or wrong." },
        { code: "403 daily_checkin_required", span: 'Run <code>/checkin</code> in Discord.', html: true },
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
    ];
</script>

<div class="docs-sections">
    <article class="docs-section" id="auth">
        <header class="docs-section-head">
            <span class="docs-section-eyebrow">Auth</span>
            <h2>Get a key</h2>
        </header>
        <section class="docs-card">
            <p>
                Join Discord and run <code>/signup</code>. The bot opens a modal that asks for your use case, bot-disclosure
                answer, and a randomized human challenge. Send the issued key as a bearer token.
            </p>
            <div class="docs-table compact">
                {#each authRows as row, i (i)}
                    <div class="docs-row">
                        <code>{row.code}</code>
                        <span>{row.span}</span>
                    </div>
                {/each}
            </div>
            <div class="docs-code-group">
                <button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button>
                {#if baseSnippetHtml}
                    <div class="shiki-wrapper">{@html baseSnippetHtml}</div>
                {:else}
                    <pre><code>{baseSnippet}</code></pre>
                {/if}
            </div>
        </section>
    </article>

    <article class="docs-section" id="endpoints">
        <header class="docs-section-head">
            <span class="docs-section-eyebrow">Endpoints</span>
            <h2>Supported routes</h2>
        </header>
        <section class="docs-card">
            <div class="docs-table">
                {#each endpoints as [method, routePath, desc], i (i)}
                    <div class="docs-row">
                        <span class={`docs-method ${method.toLowerCase()}`}>{method}</span>
                        <code>{routePath}</code>
                        <span>{desc}</span>
                    </div>
                {/each}
            </div>
        </section>
    </article>

    <article class="docs-section" id="compatibility">
        <header class="docs-section-head">
            <span class="docs-section-eyebrow">Compatibility</span>
            <h2>Cross-compatible client formats</h2>
        </header>
        <section class="docs-card">
            <p>
                FreeTheAi supports multiple API formats for easier client compatibility. You can use OpenAI-compatible Chat
                Completions, Anthropic-compatible Messages, and Responses-style routes with the same API key and the same
                model aliases.
            </p>
            <div class="docs-table compact">
                <div class="docs-row"><code>POST /v1/chat/completions</code><span>OpenAI-compatible chat completions. Streaming, tool calling, and structured outputs.</span></div>
                <div class="docs-row"><code>POST /v1/messages</code><span>Anthropic-compatible Messages route. System prompts, tool use, and the same content blocks Claude clients expect.</span></div>
                <div class="docs-row"><code>POST /v1/responses</code><span>Responses-style route. Same key, same model alias.</span></div>
                <div class="docs-row"><code>POST /v1/images/generations</code><span>OpenAI-compatible image generation for supported image aliases.</span></div>
                <div class="docs-row"><code>POST /v1/images/edits</code><span>OpenAI-compatible multipart image edits for supported image aliases.</span></div>
                <div class="docs-row"><code>GET /v1/images/generations/{"{request_id}"}</code><span>Poll async EVE image jobs submitted with background or async enabled.</span></div>
                <div class="docs-row"><code>GET /v1/models</code><span>Authenticated client catalog.</span></div>
                <div class="docs-row"><code>GET /v1/models/full</code><span>Catalog with context, output, capability, and access metadata.</span></div>
                <div class="docs-row"><code>POST /v1/audio/speech</code><span>Text-to-speech route for supported voice aliases.</span></div>
                <div class="docs-row"><code>POST /v1/audio/transcriptions</code><span>Speech-to-text route for OpenAI-style multipart audio uploads.</span></div>
            </div>
            <p>Pick the route that matches your client. The model alias and the key never change between formats.</p>
        </section>
    </article>

    <article class="docs-section" id="chat">
        <header class="docs-section-head">
            <span class="docs-section-eyebrow">Chat Completions</span>
            <h2>OpenAI-compatible chat</h2>
        </header>
        <section class="docs-card">
            <p>
                Point OpenAI-compatible clients at <code>https://api.freetheai.xyz/v1</code>. Use exact model aliases from
                <a href="/models">/models</a>.
            </p>
            <div class="docs-code-grid">
                <div>
                    <h3>curl</h3>
                    <div class="docs-code-group">
                        <div class="docs-code-bar"><span class="docs-code-lang">bash</span><button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button></div>
                        {#if chatCurlSnippetHtml}
                            <div class="shiki-wrapper">{@html chatCurlSnippetHtml}</div>
                        {:else}
                            <pre><code>{chatCurlSnippet}</code></pre>
                        {/if}
                    </div>
                </div>
                <div>
                    <h3>JavaScript SDK</h3>
                    <div class="docs-code-group">
                        <div class="docs-code-bar"><span class="docs-code-lang">javascript</span><button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button></div>
                        {#if openaiSdkSnippetHtml}
                            <div class="shiki-wrapper">{@html openaiSdkSnippetHtml}</div>
                        {:else}
                            <pre><code>{openaiSdkSnippet}</code></pre>
                        {/if}
                    </div>
                </div>
            </div>
        </section>
    </article>

    <article class="docs-section" id="messages">
        <header class="docs-section-head">
            <span class="docs-section-eyebrow">Messages API</span>
            <h2>Anthropic-style clients</h2>
        </header>
        <section class="docs-card">
            <p>Use <code>/v1/messages</code> for clients that expect Anthropic-style request bodies.</p>
            <div class="docs-code-group">
                <div class="docs-code-bar"><span class="docs-code-lang">bash</span><button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button></div>
                {#if messagesSnippetHtml}
                    <div class="shiki-wrapper">{@html messagesSnippetHtml}</div>
                {:else}
                    <pre><code>{messagesSnippet}</code></pre>
                {/if}
            </div>
        </section>
    </article>

    <article class="docs-section" id="models">
        <header class="docs-section-head">
            <span class="docs-section-eyebrow">Model Catalog</span>
            <h2>List models</h2>
        </header>
        <section class="docs-card">
            <p>
                Use <code>/v1/models</code> for normal clients. Use <code>/v1/models/full</code> when you need tier and
                catalog metadata for a UI. The full catalog is a site-key endpoint, so public catalog clients use
                <code>Bearer freetheai.xyz</code>.
            </p>
            <div class="docs-code-grid">
                <div>
                    <h3>Client catalog</h3>
                    <div class="docs-code-group">
                        <div class="docs-code-bar"><span class="docs-code-lang">bash</span><button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button></div>
                        {#if modelListSnippetHtml}
                            <div class="shiki-wrapper">{@html modelListSnippetHtml}</div>
                        {:else}
                            <pre><code>{modelListSnippet}</code></pre>
                        {/if}
                    </div>
                </div>
                <div>
                    <h3>Full catalog</h3>
                    <div class="docs-code-group">
                        <div class="docs-code-bar"><span class="docs-code-lang">bash</span><button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button></div>
                        {#if fullModelListSnippetHtml}
                            <div class="shiki-wrapper">{@html fullModelListSnippetHtml}</div>
                        {:else}
                            <pre><code>{fullModelListSnippet}</code></pre>
                        {/if}
                    </div>
                </div>
            </div>
        </section>
    </article>

    <article class="docs-section" id="errors">
        <header class="docs-section-head">
            <span class="docs-section-eyebrow">Errors</span>
            <h2>Errors and rate limits</h2>
        </header>
        <section class="docs-card docs-errors">
            <div class="docs-errors-shape">
                <h3>Error shape</h3>
                <p>
                    Most API errors use the OpenAI-style envelope. The <code>type</code> field is the machine-readable code
                    you should branch on; <code>message</code> is the human-readable string.
                </p>
                <div class="docs-code-group">
                    <button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button>
                    <pre><code>{"{"}
  "error": {"{"}
    "message": "human readable message",
    "type": "machine_readable_type"
  {"}"}
{"}"}</code></pre>
                </div>
                <p>
                    Streaming requests can fail mid-stream after the SSE connection has already opened. In that case the
                    API sends an error event followed by <code>data: [DONE]</code>:
                </p>
                <div class="docs-code-group">
                    <button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></button>
                    <pre><code>data: {"{"}"error":{"{"}"message":"provider temporarily unavailable","type":"provider_error"{"}"}{"}"}

data: [DONE]</code></pre>
                </div>
                <p>
                    Some provider errors include a short public diagnostic id you can quote in Discord support, for
                    example <code>Error id: opc-xxxxxxxxxxxx</code>.
                </p>
            </div>
            <div class="docs-errors-group">
                <h3>Auth, check-in, and role gates</h3>
                <div class="docs-table compact">
                    {#each authGateRows as row, i (i)}
                        <div class="docs-row">
                            <code>{row.code}</code>
                            {#if row.html}<span>{@html row.span}</span>{:else}<span>{row.span}</span>{/if}
                        </div>
                    {/each}
                </div>
            </div>
            <div class="docs-errors-group">
                <h3>Request validation</h3>
                <div class="docs-table compact">
                    {#each validationRows as row, i (i)}
                        <div class="docs-row">
                            <code>{row.code}</code>
                            {#if row.html}<span>{@html row.span}</span>{:else}<span>{row.span}</span>{/if}
                        </div>
                    {/each}
                </div>
            </div>
            <div class="docs-errors-group">
                <h3>Rate limits, daily caps, and concurrency</h3>
                <div class="docs-table compact">
                    {#each rateLimitRows as row, i (i)}
                        <div class="docs-row">
                            <code>{row.code}</code>
                            {#if row.html}<span>{@html row.span}</span>{:else}<span>{row.span}</span>{/if}
                        </div>
                    {/each}
                </div>
            </div>
            <div class="docs-errors-group">
                <h3>Provider and gateway</h3>
                <div class="docs-table compact">
                    {#each providerRows as row, i (i)}
                        <div class="docs-row">
                            <code>{row.code}</code>
                            {#if row.html}<span>{@html row.span}</span>{:else}<span>{row.span}</span>{/if}
                        </div>
                    {/each}
                </div>
            </div>
            <div class="docs-errors-group">
                <h3>Site-only catalog and stats endpoints</h3>
                <div class="docs-table compact">
                    {#each siteOnlyRows as row, i (i)}
                        <div class="docs-row">
                            <code>{row.code}</code>
                            {#if row.html}<span>{@html row.span}</span>{:else}<span>{row.span}</span>{/if}
                        </div>
                    {/each}
                </div>
            </div>
            <div class="docs-errors-group">
                <h3>Headers to respect</h3>
                <p>Rate, concurrency, and cooldown errors include machine-readable headers. Clients should branch on these rather than parsing the human message.</p>
                <div class="docs-table compact">
                    {#each headerRows as row, i (i)}
                        <div class="docs-row">
                            <code>{row.code}</code>
                            {#if row.html}<span>{@html row.span}</span>{:else}<span>{row.span}</span>{/if}
                        </div>
                    {/each}
                </div>
            </div>
            <div class="docs-errors-group">
                <h3>One-line user copy</h3>
                <div class="docs-table compact">
                    {#each oneLineRows as row, i (i)}
                        <div class="docs-row">
                            <code>{row.code}</code>
                            {#if row.html}<span>{@html row.span}</span>{:else}<span>{row.span}</span>{/if}
                        </div>
                    {/each}
                </div>
            </div>
        </section>
    </article>
</div>
