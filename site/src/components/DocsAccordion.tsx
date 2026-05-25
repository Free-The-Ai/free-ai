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
                    <div class="docs-table compact">
                        <div class="docs-row">
                            <code>/signup</code>
                            <span>
                                Creates a key after the modal is completed. Existing
                                keys are rejected; use <code>/resetkey</code> instead.
                            </span>
                        </div>
                        <div class="docs-row">
                            <code>/checkin</code>
                            <span>
                                Required once per UTC day. Enter your existing API
                                key and solve the randomized challenge before using
                                the free API.
                            </span>
                        </div>
                        <div class="docs-row">
                            <code>/resetkey</code>
                            <span>
                                Rotates a lost key after a real reset reason and
                                challenge answer. Your account history stays linked.
                            </span>
                        </div>
                    </div>
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
                    <div class="docs-table compact">
                        <div class="docs-row">
                            <code>POST /v1/chat/completions</code>
                            <span>
                                OpenAI-compatible chat completions. Streaming, tool
                                calling, and structured outputs.
                            </span>
                        </div>
                        <div class="docs-row">
                            <code>POST /v1/messages</code>
                            <span>
                                Anthropic-compatible Messages route. System prompts,
                                tool use, and the same content blocks Claude clients
                                expect.
                            </span>
                        </div>
                        <div class="docs-row">
                            <code>POST /v1/responses</code>
                            <span>
                                Responses-style route. Same key, same model alias.
                            </span>
                        </div>
                        <div class="docs-row">
                            <code>GET /v1/models</code>
                            <span>Authenticated client catalog.</span>
                        </div>
                        <div class="docs-row">
                            <code>GET /v1/models/full</code>
                            <span>
                                Catalog with context, output, image-support, and
                                access metadata.
                            </span>
                        </div>
                        <div class="docs-row">
                            <code>POST /v1/audio/speech</code>
                            <span>
                                Text-to-speech route for supported role-gated voice aliases.
                            </span>
                        </div>
                        <div class="docs-row">
                            <code>POST /v1/audio/transcriptions</code>
                            <span>
                                Speech-to-text route for OpenAI-style multipart audio uploads.
                            </span>
                        </div>
                    </div>
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
                    <div class="docs-code-grid">
                        <div>
                            <h3>curl</h3>
                            <CodeBlock
                                code={props.chatCurlSnippet}
                                html={props.chatCurlSnippetHtml}
                                lang="bash"
                            />
                        </div>
                        <div>
                            <h3>JavaScript SDK</h3>
                            <CodeBlock
                                code={props.openAISDKSnippet}
                                html={props.openAISDKSnippetHtml}
                                lang="javascript"
                            />
                        </div>
                    </div>
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
                    <div class="docs-code-grid">
                        <div>
                            <h3>Client catalog</h3>
                            <CodeBlock
                                code={props.modelListSnippet}
                                html={props.modelListSnippetHtml}
                                lang="bash"
                            />
                        </div>
                        <div>
                            <h3>Full catalog</h3>
                            <CodeBlock
                                code={props.fullModelListSnippet}
                                html={props.fullModelListSnippetHtml}
                                lang="bash"
                            />
                        </div>
                    </div>
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
                    <div class="docs-code-grid">
                        <div>
                            <h3>Image generation</h3>
                            <CodeBlock
                                code={props.vhrImageSnippet}
                                html={props.vhrImageSnippetHtml}
                                lang="bash"
                            />
                        </div>
                        <div>
                            <h3>Image edit</h3>
                            <CodeBlock
                                code={props.imageEditSnippet}
                                html={props.imageEditSnippetHtml}
                                lang="bash"
                            />
                        </div>
                    </div>
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
                        <div class="docs-table compact">
                            <div class="docs-row">
                                <code>401 invalid_api_key</code>
                                <span>
                                    Missing, invalid, revoked, or inactive key.
                                    Send the exact key from <code>/signup</code>{" "}
                                    as <code>Authorization: Bearer YOUR_KEY</code>{" "}
                                    with no quotes, markdown, or extra spaces.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>403 daily_checkin_required</code>
                                <span>
                                    Key is valid but the Discord owner has not
                                    checked in today. Run <code>/checkin</code> in
                                    the FreeTheAi Discord server.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>403 model_access_denied</code>
                                <span>
                                    Model is limited to{" "}
                                    <strong>Verified members</strong>,
                                    earned through active server participation.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>403 discord_membership_required</code>
                                <span>
                                    Key owner left the Discord. Rejoin with the
                                    same Discord account that owns the key.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>403 user_paused</code>
                                <span>
                                    Account paused by staff. Staff action required.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>403 ip_blacklisted</code>
                                <span>
                                    Source IP is banned. No client-side fix; staff
                                    action required.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>403 client_signature_banned</code>
                                <span>
                                    Banned client signature. Switch to a supported
                                    client; staff action may be required.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="docs-errors-group">
                        <h3>Request validation</h3>
                        <div class="docs-table compact">
                            <div class="docs-row">
                                <code>400 invalid_request_error</code>
                                <span>
                                    Bad JSON, missing field, unknown alias, or
                                    unsupported route. Common messages:{" "}
                                    <em>invalid json payload</em>,{" "}
                                    <em>missing model</em>, <em>missing prompt</em>,{" "}
                                    <em>unknown aliased model</em>,{" "}
                                    <em>unsupported responses input shape</em>,{" "}
                                    <em>upstream rejected the request payload</em>.
                                    Use a model from <code>GET /v1/models</code>.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>400 context_length_exceeded</code>
                                <span>
                                    Prompt or request is too large. Reduce context,
                                    attachments, message history, or requested
                                    output tokens.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>400 content_policy_violation</code>
                                <span>
                                    Blocked by moderation/safety filters. Change
                                    the prompt content.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>404 invalid_request_error</code>
                                <span>
                                    Currently used for deferred video lookup when
                                    the request id is unknown.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="docs-errors-group">
                        <h3>Rate limits, daily caps, and concurrency</h3>
                        <div class="docs-table compact">
                            <div class="docs-row">
                                <code>429 rate_limit_error</code>
                                <span>
                                    Per-minute, daily-success cap, image cap, image
                                    cooldown, upstream rate limit, or anti-abuse
                                    overlap block. Honor <code>Retry-After</code>{" "}
                                    when present and wait for the next UTC reset.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>429 concurrency_limit_error</code>
                                <span>
                                    Already running the maximum allowed parallel
                                    requests. Wait for one to finish.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>429 glm_depleted</code>
                                <span>
                                    GLM provider quota is depleted for the current
                                    5-hour window. Retry later.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>499 client_canceled</code>
                                <span>
                                    Client disconnected while the request was still
                                    running. Keep the connection open until the
                                    response completes.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="docs-errors-group">
                        <h3>Provider and gateway</h3>
                        <div class="docs-table compact">
                            <div class="docs-row">
                                <code>502 provider_error</code>
                                <span>
                                    Provider call/read/translation failed. Retry,
                                    or try another model. If it persists, report
                                    the model and timestamp.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>503 provider_unavailable</code>
                                <span>
                                    Provider account pool is cooling down, busy, or
                                    upstream returned 5xx. Retry after{" "}
                                    <code>Retry-After</code> (typically 30s).
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>504 provider_timeout</code>
                                <span>
                                    Provider took too long. Retry with smaller
                                    context/output or use streaming.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>500 server_error</code>
                                <span>
                                    Internal gateway error. Not user-fixable. Retry
                                    once, then report it.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>503 server_error</code>
                                <span>
                                    Internal dependency unavailable (DB, store,
                                    handler). Retry shortly.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>503 discord_membership_error</code>
                                <span>
                                    Discord membership/role lookup failed
                                    temporarily. Retry shortly.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="docs-errors-group">
                        <h3>Site-only catalog and stats endpoints</h3>
                        <div class="docs-table compact">
                            <div class="docs-row">
                                <code>401 invalid_request_error</code>
                                <span>
                                    Site-only endpoints (e.g. full catalog with
                                    metadata) need{" "}
                                    <code>Authorization: Bearer freetheai.xyz</code>.
                                    Common messages:{" "}
                                    <em>invalid site catalog key</em>,{" "}
                                    <em>invalid site stats key</em>.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="docs-errors-group">
                        <h3>Headers to respect</h3>
                        <p>
                            Rate, concurrency, and cooldown errors include
                            machine-readable headers. Clients should branch on
                            these rather than parsing the human message.
                        </p>
                        <div class="docs-table compact">
                            <div class="docs-row">
                                <code>Retry-After</code>
                                <span>Seconds to wait before retrying.</span>
                            </div>
                            <div class="docs-row">
                                <code>X-RateLimit-*</code>
                                <span>
                                    <code>Limit</code>, <code>Remaining</code>,{" "}
                                    <code>Reset</code> for per-minute requests.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>X-Concurrency-*</code>
                                <span>
                                    <code>Limit</code>, <code>Remaining</code>,{" "}
                                    <code>Reset</code> for parallel requests.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>X-DailyLimit-*</code>
                                <span>
                                    <code>Limit</code>, <code>Remaining</code>,{" "}
                                    <code>Reset</code> for the daily success cap.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>X-ImageDailyLimit-*</code>
                                <span>
                                    Daily image-generation cap headers.
                                </span>
                            </div>
                            <div class="docs-row">
                                <code>X-ImageGenerationCooldown-*</code>
                                <span>
                                    Per-user image-generation cooldown headers.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="docs-errors-group">
                        <h3>One-line user copy</h3>
                        <div class="docs-table compact">
                            <div class="docs-row">
                                <code>401 invalid_api_key</code>
                                <span>Your API key is missing or wrong.</span>
                            </div>
                            <div class="docs-row">
                                <code>403 daily_checkin_required</code>
                                <span>Run <code>/checkin</code> in Discord.</span>
                            </div>
                            <div class="docs-row">
                                <code>403 model_access_denied</code>
                                <span>This model is for Verified members.</span>
                            </div>
                            <div class="docs-row">
                                <code>400 invalid_request_error</code>
                                <span>Your request body, model, or route is wrong.</span>
                            </div>
                            <div class="docs-row">
                                <code>400 context_length_exceeded</code>
                                <span>Your prompt or context is too large.</span>
                            </div>
                            <div class="docs-row">
                                <code>400 content_policy_violation</code>
                                <span>The request was blocked by moderation.</span>
                            </div>
                            <div class="docs-row">
                                <code>429 rate_limit_error</code>
                                <span>You hit a rate limit, daily cap, or cooldown.</span>
                            </div>
                            <div class="docs-row">
                                <code>429 concurrency_limit_error</code>
                                <span>Wait for your active request to finish.</span>
                            </div>
                            <div class="docs-row">
                                <code>502 provider_error</code>
                                <span>Provider failed unexpectedly. Retry or try another model.</span>
                            </div>
                            <div class="docs-row">
                                <code>503 provider_unavailable</code>
                                <span>Provider is temporarily unavailable.</span>
                            </div>
                            <div class="docs-row">
                                <code>504 provider_timeout</code>
                                <span>Provider took too long.</span>
                            </div>
                            <div class="docs-row">
                                <code>500/503 server_error</code>
                                <span>Gateway internal issue. Retry once.</span>
                            </div>
                        </div>
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
