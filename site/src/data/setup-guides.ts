/**
 * var setupGuides
 * type SetupGuide[]
 * desc Source of truth for every FreeTheAi client setup guide rendered on
 *      `/setup` and `/setup/[slug]`. Each record stays self-contained so the
 *      data layer drives the nav dropdown, search, JSON-LD, and per-app docs.
 */

export type SetupCategory =
    | "coding"
    | "roleplay"
    | "general"
    | "cli";

export interface SetupCompatibility {
    chatCompletions?: boolean;
    messages?: boolean;
    responses?: boolean;
    streaming?: boolean;
    toolCalling?: boolean;
    images?: boolean;
}

export interface SetupStep {
    title: string;
    body: string;
    code?: {
        lang: string;
        value: string;
    };
}

export interface SetupGuide {
    slug: string;
    name: string;
    tagline: string;
    category: SetupCategory;
    categoryLabel: string;
    homepage?: string;
    repository?: string;
    docsUrl?: string;
    logoUrl?: string;
    summary: string;
    recommendedModels: string[];
    baseUrl: string;
    apiPath?: string;
    compatibility: SetupCompatibility;
    steps: SetupStep[];
    gotchas?: string[];
    notes?: string[];
    keywords: string[];
}

export const SETUP_GUIDES: SetupGuide[] = [
    {
        slug: "opencode",
        name: "OpenCode",
        tagline: "Pair-programming agent with a config-driven provider list.",
        category: "coding",
        categoryLabel: "Coding agents",
        homepage: "https://opencode.ai",
        repository: "https://github.com/sst/opencode",
        docsUrl: "https://opencode.ai/docs/",
        logoUrl: "https://opencode.ai/favicon.svg",
        summary:
            "OpenCode reads its providers from a JSON config file. Add FreeTheAi as a custom provider with the OpenAI-compatible adapter and you can pick any FreeTheAi alias as the active model.",
        recommendedModels: [
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
            "bbl/gpt-5.4-mini",
            "bbg/moonshotai/Kimi-K2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open the OpenCode config file",
                body: "Press Ctrl + O inside OpenCode and paste the path. On Windows, replace YOUR_USER with your Windows username.",
                code: {
                    lang: "text",
                    value: "C:/Users/YOUR_USER/.config/opencode/opencode.json",
                },
            },
            {
                title: "Replace the file contents",
                body: "Wipe the file and paste the FreeTheAi provider block. Drop in your FreeTheAi key from /signup and any aliases you want from the catalog.",
                code: {
                    lang: "json",
                    value: `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "freetheai": {
      "name": "FreeTheAi",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "apiKey": "PASTE_YOUR_FREETHEAI_KEY",
        "baseURL": "https://api.freetheai.xyz/v1"
      },
      "models": {
        "bbg/deepseek-ai/DeepSeek-V4-Pro": {
          "name": "DeepSeek V4 Pro",
          "limit": { "context": 50000, "output": 32000 }
        },
        "bbl/gpt-5.4-mini": {
          "name": "GPT 5.4 Mini",
          "limit": { "context": 80000, "output": 32000 }
        }
      }
    }
  }
}`,
                },
            },
            {
                title: "Save and reload",
                body: "Press Ctrl + S to save, then Ctrl + Shift + P and run Developer: Reload Window. OpenCode will pick up the new provider on reload.",
            },
            {
                title: "Pick a FreeTheAi model",
                body: "Open the model picker in OpenCode and switch to one of the aliases you added. The OpenAI-compatible adapter handles streaming and tool calling automatically.",
            },
        ],
        gotchas: [
            "OpenCode uses the npm `@ai-sdk/openai-compatible` adapter under the hood, so you can keep adding any FreeTheAi alias under `models` without restarting.",
            "If `Developer: Reload Window` does not show your provider, double check the JSON saved without trailing commas.",
            "Use exact aliases from /models (for example `bbg/deepseek-ai/DeepSeek-V4-Pro`). Strip any leading `freetheai/` if a copy-paste added one.",
        ],
        keywords: ["opencode", "sst opencode", "ai sdk", "agent"],
    },
    {
        slug: "kilo-code",
        name: "Kilo Code",
        tagline: "VSCode coding agent with one-click custom providers.",
        category: "coding",
        categoryLabel: "Coding agents",
        homepage: "https://kilocode.ai",
        repository: "https://github.com/Kilo-Org/kilocode",
        docsUrl: "https://kilocode.ai/docs",
        summary:
            "Kilo Code is a VSCode extension that lets you connect a custom OpenAI-compatible provider directly in its sidebar. FreeTheAi works without leaving the editor.",
        recommendedModels: [
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
            "bbl/gpt-5.4-mini",
            "wsf/kimi-k2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Install Kilo Code",
                body: "Open VSCode, go to the Extensions panel, search for `Kilo Code`, and install it.",
            },
            {
                title: "Open settings",
                body: "Click the Kilo Code icon in the sidebar, then the gear icon in the top right of the panel.",
            },
            {
                title: "Add a custom provider",
                body: "Open `Providers`, click `+ Connect` next to `Custom Provider`, and fill the form.",
            },
            {
                title: "Fill the connection form",
                body: "Use these exact values. The model field accepts any FreeTheAi alias from /models.",
                code: {
                    lang: "text",
                    value: `Provider Name: freetheai
API URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY
Model Name: bbl/gpt-5.4-mini
Max Completion Tokens: 80000
Max Output Tokens: 32000
Max Tokens: 80000
Supports tools: enabled`,
                },
            },
            {
                title: "Save and chat",
                body: "Click Save Provider. Kilo Code will use the new provider for the next agent run.",
            },
        ],
        gotchas: [
            "If pasting the key truncates to ~15 characters, the field is masking it as you type. Click the eye icon to confirm the full key was pasted.",
            "404 unknown API route usually means the model alias is wrong. Use one from `GET /v1/models` such as `bbg/deepseek-ai/DeepSeek-V4-Pro`.",
            "Keep `Supports tools` on so Kilo can run shell, file edits, and search tools.",
        ],
        keywords: ["kilo code", "kilocode", "vscode", "agent"],
    },
    {
        slug: "zed",
        name: "Zed IDE",
        tagline: "Native editor with first-class agent support.",
        category: "coding",
        categoryLabel: "Coding agents",
        homepage: "https://zed.dev",
        repository: "https://github.com/zed-industries/zed",
        docsUrl: "https://zed.dev/docs/ai/configuration",
        summary:
            "Zed has a built-in agent panel. Add FreeTheAi as a custom OpenAI-compatible provider and Zed handles the rest.",
        recommendedModels: [
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
            "bbg/moonshotai/Kimi-K2.6",
            "bbl/gpt-5.4-mini",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open the Zed assistant",
                body: "Open Zed and reveal the assistant panel from the right sidebar.",
            },
            {
                title: "Open agent settings",
                body: "Click the assistant cog and go to `Add Provider` in the top right.",
            },
            {
                title: "Configure the provider",
                body: "Pick the OpenAI-compatible option and use these values.",
                code: {
                    lang: "text",
                    value: `Provider ID: freetheai
Display name: free
Base URL: https://api.freetheai.xyz/v1
API key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Pick a FreeTheAi model",
                body: "Select your new `free` provider in the model picker and choose any alias from /models. Zed will stream the response right inside the editor.",
            },
        ],
        gotchas: [
            "Zed expects the provider ID to be lowercase letters, numbers, hyphens, or underscores. `freetheai` is fine, `FreeTheAi` is not.",
            "API key is optional in the form because some users authenticate via headers, but for FreeTheAi paste your real key.",
        ],
        keywords: ["zed", "zed ide", "zed industries"],
    },
    {
        slug: "sillytavern",
        name: "SillyTavern",
        tagline: "Power-user roleplay frontend with deep prompt control.",
        category: "roleplay",
        categoryLabel: "Roleplay & chat frontends",
        homepage: "https://sillytavern.app",
        repository: "https://github.com/SillyTavern/SillyTavern",
        docsUrl: "https://docs.sillytavern.app/usage/api-connections/openai",
        summary:
            "SillyTavern uses its own Connection Profile system. Switch the API to Chat Completion with `Custom (OpenAI-compatible)` and SillyTavern will handle streaming and presets.",
        recommendedModels: [
            "rev/claude-sonnet-4.5",
            "bbl/gpt-5.4-mini",
            "glm/glm-5.1",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            messages: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open the API panel",
                body: "Click the plug icon in SillyTavern, the first icon in the right toolbar.",
            },
            {
                title: "Pick the right API",
                body: "Set `API` to `Chat Completion`. Set `Chat Completion Source` to `Custom (OpenAI-compatible)`.",
            },
            {
                title: "Fill the endpoint and key",
                body: "Use the FreeTheAi base URL and the key from /signup. SillyTavern auto-appends /chat/completions, so do not add it manually.",
                code: {
                    lang: "text",
                    value: `Custom Endpoint (Base URL): https://api.freetheai.xyz/v1
Custom API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Pick a model",
                body: "Type or paste a FreeTheAi alias into `Enter a Model ID`. The dropdown will populate after the first connect.",
                code: {
                    lang: "text",
                    value: "rev/claude-sonnet-4.5",
                },
            },
            {
                title: "Save the profile",
                body: "Save the Connection Profile so SillyTavern remembers FreeTheAi between sessions.",
            },
        ],
        gotchas: [
            "If a Test Message returns 404, append `/v1` to the endpoint. Never add `/chat/completions`.",
            "Use Strict Prompt Post-Processing for Claude-style models so SillyTavern alternates user and assistant correctly.",
            "FreeTheAi is rate-limited per minute. Lower SillyTavern's parallel generation if you see frequent 429s.",
        ],
        keywords: ["sillytavern", "silly tavern", "st", "roleplay"],
    },
    {
        slug: "janitor-ai",
        name: "Janitor AI",
        tagline: "Roleplay site that connects through a reverse proxy.",
        category: "roleplay",
        categoryLabel: "Roleplay & chat frontends",
        homepage: "https://janitorai.com",
        summary:
            "Janitor AI uses a proxy slot for any OpenAI-compatible endpoint. Drop FreeTheAi in as a proxy and pick the model you want.",
        recommendedModels: [
            "bbl/gpt-5.4-mini",
            "rev/claude-sonnet-4.5",
            "glm/glm-5.1",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        apiPath: "/chat/completions",
        compatibility: {
            chatCompletions: true,
            streaming: true,
        },
        steps: [
            {
                title: "Open a chat",
                body: "Pick a character on the home page and click `chat with` to land on the chat page.",
            },
            {
                title: "Open API settings",
                body: "Tap the three lines in the top right of the chat, then `API Settings`.",
            },
            {
                title: "Switch to Proxy",
                body: "In the API Settings panel, switch to the `Proxy` tab and click `+ New` to start a fresh config.",
            },
            {
                title: "Fill the proxy form",
                body: "Use these exact values. Janitor AI requires the full URL with /chat/completions.",
                code: {
                    lang: "text",
                    value: `Name: freetheai
Model: bbl/gpt-5.4-mini
Proxy URL: https://api.freetheai.xyz/v1/chat/completions
API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Save",
                body: "Click `Save`. Janitor AI will use FreeTheAi for new responses on this character.",
            },
        ],
        gotchas: [
            "Janitor AI sometimes shows a `Failed to fetch (unk)` error. That is upstream Janitor instability, not FreeTheAi - try Chub or SillyTavern instead, or wait it out.",
            "401 means the key is wrong. Use `/resetkey` in the FreeTheAi Discord and paste only the key value, no quotes or markdown.",
            "Some models do not work for Janitor RP - try `rev/claude-sonnet-4.5` or `glm/glm-5.1` for the most reliable responses.",
        ],
        keywords: ["janitor", "janitor ai", "janitorai", "roleplay"],
    },
    {
        slug: "chub-ai",
        name: "Chub AI",
        tagline: "Open roleplay platform with Secrets-based proxy slots.",
        category: "roleplay",
        categoryLabel: "Roleplay & chat frontends",
        homepage: "https://chub.ai",
        docsUrl: "https://docs.chub.ai/docs/the-basics/api-connections",
        summary:
            "Chub AI lets you reverse-proxy any OpenAI-compatible endpoint through its `Secrets` panel. Pair it with the OpenAI / Proxy preset and pick a FreeTheAi model.",
        recommendedModels: [
            "bbl/gpt-5.4-mini",
            "bbg/moonshotai/Kimi-K2.6",
            "rev/claude-sonnet-4.5",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
        },
        steps: [
            {
                title: "Open the chat menu",
                body: "Open any character's chat, click the three lines in the top right.",
            },
            {
                title: "Open Secrets > OpenAI",
                body: "Click `Secrets`, expand the `OpenAI` section, and switch the access toggle from `My Own API Key` to `Reverse Proxy`.",
            },
            {
                title: "Fill the proxy fields",
                body: "Use these exact values. Click `Check Proxy` to confirm the connection.",
                code: {
                    lang: "text",
                    value: `OpenAI Reverse Proxy: https://api.freetheai.xyz/v1
Reverse Proxy Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Configure prompt structure",
                body: "Open `Configuration` from the same menu, expand `Prompt Structure`, set API to `OpenAI / Proxy`, and pick your FreeTheAi alias as the model.",
                code: {
                    lang: "text",
                    value: `API: OpenAI / Proxy
Model: bbl/gpt-5.4-mini`,
                },
            },
            {
                title: "Save and chat",
                body: "Save the preset (or create a new one) and start chatting. The same model alias works on every Chub character.",
            },
        ],
        gotchas: [
            "Chub's model dropdown can show models that do not actually exist on FreeTheAi. Always use exact aliases from `https://freetheai.xyz/models`.",
            "Do not put your OpenAI API key in the Reverse Proxy Key field, only your FreeTheAi key.",
            "After updating the proxy URL, refresh the chat page so Chub picks up the new endpoint.",
        ],
        keywords: ["chub", "chub ai", "venus", "characterhub", "roleplay"],
    },
    {
        slug: "risuai",
        name: "RisuAI",
        tagline: "Local-first roleplay client with deep prompt control.",
        category: "roleplay",
        categoryLabel: "Roleplay & chat frontends",
        homepage: "https://risuai.net",
        repository: "https://github.com/kwaroran/Risuai",
        summary:
            "RisuAI keeps your character data local and lets you point at any OpenAI-compatible chat completions URL. Use the full FreeTheAi /chat/completions URL and any alias.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "rev/claude-sonnet-4.5",
            "wsf/kimi-k2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        apiPath: "/chat/completions",
        compatibility: {
            chatCompletions: true,
            streaming: true,
        },
        steps: [
            {
                title: "Open Risu settings",
                body: "In Risu, open the three-dot menu and go to settings. Pick the `AI Model & API` section.",
            },
            {
                title: "Pick OpenAI Compatible",
                body: "Set the model source to `OpenAI` or `OpenAI Compatible`. Uncheck `Auto-fill request URL` so Risu does not rewrite your endpoint.",
            },
            {
                title: "Fill the request URL and key",
                body: "Risu sends the full URL verbatim, so include `/chat/completions`.",
                code: {
                    lang: "text",
                    value: `Request URL: https://api.freetheai.xyz/v1/chat/completions
API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Type a FreeTheAi alias",
                body: "Type any alias from /models in the model field. Risu forwards it as the `model` value.",
                code: {
                    lang: "text",
                    value: "bbg/zai-org/GLM-5.1",
                },
            },
        ],
        gotchas: [
            "Risu does not auto-add `/chat/completions`. Paste the full path or every request will 404.",
            "Risu's roleplay prompts are long. Pair it with `bbg/*` or `wsf/*` aliases that have a generous context window.",
            "Avoid `cat/*` and `yng/*` for roleplay - they do not handle Risu's tool/system shape well.",
        ],
        keywords: ["risu", "risuai", "roleplay", "kwaroran"],
    },
    {
        slug: "cline",
        name: "Cline",
        tagline: "VSCode autonomous coding agent.",
        category: "coding",
        categoryLabel: "Coding agents",
        homepage: "https://cline.bot",
        repository: "https://github.com/cline/cline",
        summary:
            "Cline runs a full agent loop inside VSCode. Add FreeTheAi as an OpenAI Compatible provider and it can read, edit, and run code with any FreeTheAi alias.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
            "wsf/kimi-k2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Install Cline",
                body: "Install the Cline extension from the VSCode marketplace and open the Cline panel from the activity bar.",
            },
            {
                title: "Open Cline settings",
                body: "Click the gear icon in the Cline panel to open API Configuration.",
            },
            {
                title: "Pick OpenAI Compatible",
                body: "Under `API Provider`, choose `OpenAI Compatible`.",
            },
            {
                title: "Fill the connection",
                body: "Use these values. The Model ID accepts any FreeTheAi alias.",
                code: {
                    lang: "text",
                    value: `Base URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY
Model ID: bbg/zai-org/GLM-5.1`,
                },
            },
        ],
        gotchas: [
            "Cline has a Responses-API mode for newer models. With chat completions it falls back to XML tool wrapping, which can repeat tool calls. Stick with chat-style aliases for stability.",
            "Avoid `cat/*` and `yng/*` aliases - they do not have native tool calling.",
        ],
        keywords: ["cline", "vscode", "autonomous agent"],
    },
    {
        slug: "roo-code",
        name: "Roo Code",
        tagline: "Multi-agent VSCode dev team forked from Cline.",
        category: "coding",
        categoryLabel: "Coding agents",
        homepage: "https://roocode.com",
        repository: "https://github.com/RooCodeInc/Roo-Code",
        summary:
            "Roo Code splits the agent into a planning/code/QA team. Add FreeTheAi as the OpenAI Compatible provider and Roo's roles share the same base URL.",
        recommendedModels: [
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
            "agr/glm-5.1",
            "bbg/moonshotai/Kimi-K2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Install Roo Code",
                body: "Install the Roo Code extension in VSCode and open the panel.",
            },
            {
                title: "Open API configuration",
                body: "Click the settings icon and go to `API Configuration`.",
            },
            {
                title: "Pick OpenAI Compatible",
                body: "Set `Provider` to `OpenAI Compatible`.",
            },
            {
                title: "Fill the connection",
                body: "Use these values. The model picker can also auto-populate after the first call.",
                code: {
                    lang: "text",
                    value: `Base URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY
Model: agr/glm-5.1`,
                },
            },
        ],
        gotchas: [
            "Roo's `Codebase Indexing > Embedder Provider` is a separate setting from chat. Configure the chat provider you actually want.",
            "Some Roo agent roles run more requests than expected. Watch the FreeTheAi rate limit and bump concurrency through the FreeTheAi tier system if needed.",
        ],
        keywords: ["roo code", "roo cline", "roocode", "vscode"],
    },
    {
        slug: "continue-dev",
        name: "Continue.dev",
        tagline: "Open-source assistant for VSCode and JetBrains.",
        category: "coding",
        categoryLabel: "Coding agents",
        homepage: "https://continue.dev",
        repository: "https://github.com/continuedev/continue",
        docsUrl: "https://docs.continue.dev/customize/model-providers/openai",
        summary:
            "Continue uses a yaml config you can version-control. Drop a FreeTheAi model entry and Continue hot-reloads it.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
            "wsf/kimi-k2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open the Continue config",
                body: "Edit `~/.continue/config.yaml` (macOS/Linux) or `%USERPROFILE%\\.continue\\config.yaml` (Windows). Create the file if it does not exist.",
            },
            {
                title: "Add a FreeTheAi model entry",
                body: "Use provider `openai` with `apiBase`. You can add multiple aliases as separate entries.",
                code: {
                    lang: "yaml",
                    value: `models:
  - name: FreeTheAi GLM 5.1
    provider: openai
    model: bbg/zai-org/GLM-5.1
    apiBase: https://api.freetheai.xyz/v1
    apiKey: \${{ secrets.FREETHEAI_API_KEY }}
  - name: FreeTheAi DeepSeek V4 Pro
    provider: openai
    model: bbg/deepseek-ai/DeepSeek-V4-Pro
    apiBase: https://api.freetheai.xyz/v1
    apiKey: \${{ secrets.FREETHEAI_API_KEY }}`,
                },
            },
            {
                title: "Save and reload",
                body: "Continue hot-reloads the config. Pick FreeTheAi from the model selector at the bottom of the panel.",
            },
        ],
        gotchas: [
            "Use `config.yaml`, not the legacy `config.json`.",
            "If a model rejects extra params, set `requestOptions.dropParams: ['frequency_penalty','presence_penalty']` on that model entry.",
        ],
        keywords: ["continue", "continue.dev", "jetbrains", "vscode"],
    },
    {
        slug: "aider",
        name: "Aider",
        tagline: "AI pair-programming CLI driven by LiteLLM.",
        category: "cli",
        categoryLabel: "CLI & scripting",
        homepage: "https://aider.chat",
        repository: "https://github.com/Aider-AI/aider",
        docsUrl: "https://aider.chat/docs/llms/openai-compat.html",
        summary:
            "Aider is LiteLLM-backed, so any OpenAI-compatible base URL works. Set two env vars and pass `openai/<freetheai-alias>` as the model.",
        recommendedModels: [
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
            "bbg/zai-org/GLM-5.1",
            "wsf/kimi-k2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Set environment variables",
                body: "Aider reads OPENAI_API_BASE and OPENAI_API_KEY from your shell.",
                code: {
                    lang: "bash",
                    value: `export OPENAI_API_BASE=https://api.freetheai.xyz/v1
export OPENAI_API_KEY=fta_PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Run aider with the openai/ prefix",
                body: "LiteLLM uses the `openai/` prefix to route the request through its OpenAI driver. Append your FreeTheAi alias.",
                code: {
                    lang: "bash",
                    value: "aider --model openai/bbg/zai-org/GLM-5.1",
                },
            },
            {
                title: "Optional: persist in .aider.conf.yml",
                body: "Drop a config in your project root so you do not have to repeat the flags.",
                code: {
                    lang: "yaml",
                    value: `openai-api-base: https://api.freetheai.xyz/v1
openai-api-key: fta_PASTE_YOUR_FREETHEAI_KEY
model: openai/bbg/zai-org/GLM-5.1`,
                },
            },
        ],
        gotchas: [
            "Always include `/v1` in the base URL.",
            "LiteLLM may print 'unknown model' warnings. Use `--no-show-model-warnings` or supply context-window via `--model-metadata-file` if it gets noisy.",
        ],
        keywords: ["aider", "litellm", "cli", "pair programming"],
    },
    {
        slug: "claude-code",
        name: "Claude Code",
        tagline: "Anthropic's terminal coding agent via Messages route.",
        category: "cli",
        categoryLabel: "CLI & scripting",
        homepage: "https://claude.com/claude-code",
        repository: "https://github.com/anthropics/claude-code",
        docsUrl: "https://code.claude.com/docs/en/llm-gateway",
        summary:
            "Claude Code talks to FreeTheAi through the Anthropic Messages format. Set the gateway env vars, run `claude`, and pick a Claude alias.",
        recommendedModels: [
            "rev/claude-sonnet-4.5",
            "rev/claude-haiku-4.5",
            "rev/claude-opus-4.5",
        ],
        baseUrl: "https://api.freetheai.xyz",
        apiPath: "/v1/messages",
        compatibility: {
            messages: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Export the gateway env vars",
                body: "Claude Code reads ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN. Point them at FreeTheAi.",
                code: {
                    lang: "bash",
                    value: `export ANTHROPIC_BASE_URL=https://api.freetheai.xyz
export ANTHROPIC_AUTH_TOKEN=fta_PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Optional: enable model discovery",
                body: "Claude Code can list models from the gateway when you flip on discovery.",
                code: {
                    lang: "bash",
                    value: "export CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1",
                },
            },
            {
                title: "Run claude and pick a model",
                body: "Start Claude Code, then use `/model` or `--model` to choose a FreeTheAi Claude alias.",
                code: {
                    lang: "bash",
                    value: "claude --model rev/claude-sonnet-4.5",
                },
            },
        ],
        gotchas: [
            "Claude Code's discovery only surfaces models whose ID starts with `claude` or `anthropic`. Use the `rev/claude-*` aliases on FreeTheAi.",
            "Setting `ANTHROPIC_AUTH_TOKEN` disables Remote Control, MCP connectors, and `/schedule` tied to a claude.ai login. That is expected.",
            "FreeTheAi's `/v1/messages` already supports `anthropic-beta` and `count_tokens`, so no extra config is needed on the gateway side.",
        ],
        keywords: ["claude code", "anthropic", "claude", "cli"],
    },
    {
        slug: "librechat",
        name: "LibreChat",
        tagline: "Self-hosted multi-model chat UI.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://librechat.ai",
        repository: "https://github.com/danny-avila/LibreChat",
        docsUrl:
            "https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints",
        summary:
            "LibreChat exposes any OpenAI-compatible host through `endpoints.custom`. Add a FreeTheAi block, set the env var, and the model picker auto-fills from /v1/models.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "rev/claude-sonnet-4.5",
            "bbg/deepseek-ai/DeepSeek-V3.2",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Edit librechat.yaml",
                body: "In your LibreChat install, add a custom endpoint block under `endpoints.custom`.",
                code: {
                    lang: "yaml",
                    value: `endpoints:
  custom:
    - name: 'FreeTheAi'
      apiKey: '\${FREETHEAI_API_KEY}'
      baseURL: 'https://api.freetheai.xyz/v1'
      models:
        default: ['bbg/zai-org/GLM-5.1', 'rev/claude-sonnet-4.5']
        fetch: true
      titleConvo: true
      titleModel: 'bbg/deepseek-ai/DeepSeek-V3.2'
      modelDisplayLabel: 'FreeTheAi'`,
                },
            },
            {
                title: "Add the env var",
                body: "Set FREETHEAI_API_KEY in your LibreChat .env file.",
                code: {
                    lang: "bash",
                    value: "FREETHEAI_API_KEY=fta_PASTE_YOUR_FREETHEAI_KEY",
                },
            },
            {
                title: "Restart LibreChat",
                body: "Restart the container or process. The FreeTheAi endpoint will appear in the chat dropdown.",
            },
        ],
        gotchas: [
            "Use `${FREETHEAI_API_KEY}` (single brace) for env-var values, not the secrets syntax used in some other configs.",
            "If a model rejects extra OpenAI params, add them to `dropParams` (e.g. `dropParams: ['frequency_penalty','presence_penalty']`).",
            "`fetch: true` auto-populates from FreeTheAi's catalog. Combine with `default` to surface preferred aliases first.",
        ],
        keywords: ["librechat", "self hosted", "danny avila"],
    },
    {
        slug: "open-webui",
        name: "Open WebUI",
        tagline: "Self-hosted ChatGPT-style UI with native OpenAI connections.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://openwebui.com",
        repository: "https://github.com/open-webui/open-webui",
        docsUrl:
            "https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible/",
        summary:
            "Open WebUI lets admins add multiple OpenAI-compatible connections. Add FreeTheAi and the model picker auto-fills from /v1/models.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "bbg/moonshotai/Kimi-K2.6",
            "rev/claude-sonnet-4.5",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open the admin panel",
                body: "Sign in as admin, open the Admin Panel, go to `Settings`, then `Connections`.",
            },
            {
                title: "Add a new OpenAI connection",
                body: "Under `OpenAI API`, click the `+` button to add a connection.",
            },
            {
                title: "Fill the connection",
                body: "Use these values.",
                code: {
                    lang: "text",
                    value: `OpenAI API Base URL: https://api.freetheai.xyz/v1
OpenAI API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Save and pick a model",
                body: "Save the connection. The model picker pulls the FreeTheAi catalog automatically.",
            },
        ],
        gotchas: [
            "FreeTheAi can return thousands of `fth/` aliases on broader keys. Use Open WebUI's model filter or pick a curated key if the dropdown gets noisy.",
            "Open WebUI also has a separate Ollama connection list. Make sure you add to OpenAI API, not Ollama.",
        ],
        keywords: ["open webui", "openwebui", "self hosted"],
    },
    {
        slug: "lobechat",
        name: "LobeChat",
        tagline: "Modern open-source web chat UI.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://lobehub.com",
        repository: "https://github.com/lobehub/lobe-chat",
        docsUrl: "https://lobehub.com/docs/usage/providers/openai",
        summary:
            "LobeChat supports any OpenAI-compatible host through env vars or its `Add Custom Provider` UI. Pair it with FreeTheAi for a slick local web client.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "wsf/kimi-k2.6",
            "rev/claude-sonnet-4.5",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open Settings > Language Model",
                body: "Click `Add Custom Provider` and fill in the form.",
                code: {
                    lang: "text",
                    value: `Provider Name: FreeTheAi
Provider ID: freetheai
Request Format (SDK Type): openai
Proxy URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Add models",
                body: "Save the provider, then add the FreeTheAi aliases you want as models. LobeChat will surface them in the model picker.",
            },
            {
                title: "Optional: Docker env vars",
                body: "If you self-host, you can set the OpenAI envs at container runtime.",
                code: {
                    lang: "bash",
                    value: `docker run -e OPENAI_API_KEY=fta_PASTE_YOUR_FREETHEAI_KEY \\
           -e OPENAI_PROXY_URL=https://api.freetheai.xyz/v1 \\
           lobehub/lobe-chat`,
                },
            },
        ],
        gotchas: [
            "If you want to keep first-party OpenAI alongside FreeTheAi, use `Add Custom Provider`, not the OpenAI env vars.",
            "Provider ID must be lowercase. `freetheai` works, `FreeTheAi` does not.",
        ],
        keywords: ["lobechat", "lobehub", "lobe-chat", "self hosted"],
    },
    {
        slug: "anythingllm",
        name: "AnythingLLM",
        tagline: "Self-hosted RAG and chat workspace.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://anythingllm.com",
        repository: "https://github.com/Mintplex-Labs/anything-llm",
        docsUrl:
            "https://docs.anythingllm.com/general/llms-providers/generic-openai",
        summary:
            "AnythingLLM treats FreeTheAi as a `Generic OpenAI` provider. Type the alias, set the context window, save.",
        recommendedModels: [
            "bbg/moonshotai/Kimi-K2.6",
            "bbg/zai-org/GLM-5.1",
            "wsf/kimi-k2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open LLM Preference",
                body: "Click `Settings` in the sidebar, then `LLM Preference`.",
            },
            {
                title: "Pick Generic OpenAI",
                body: "Set `LLM Provider` to `Generic OpenAI` and fill in the form.",
                code: {
                    lang: "text",
                    value: `Base URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY
Chat Model Name: bbg/moonshotai/Kimi-K2.6
Token context window: 50000`,
                },
            },
            {
                title: "Save",
                body: "Hit save. AnythingLLM will use FreeTheAi for chat workspaces.",
            },
        ],
        gotchas: [
            "AnythingLLM does not auto-fetch the catalog for Generic OpenAI - you have to type the alias and context window manually.",
            "The Embedding Preference tab is separate. Leave it on a working embedding provider unless FreeTheAi exposes embeddings on your plan.",
        ],
        keywords: ["anythingllm", "anything-llm", "rag", "self hosted"],
    },
    {
        slug: "cherry-studio",
        name: "Cherry Studio",
        tagline: "Cross-platform desktop chat client.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://cherry-ai.com",
        repository: "https://github.com/CherryHQ/cherry-studio",
        summary:
            "Cherry Studio supports many providers through one UI. Add FreeTheAi as an OpenAI provider and load the aliases you want as separate models.",
        recommendedModels: [
            "cwy/minimax/minimax-m2.5",
            "bbg/zai-org/GLM-5.1",
            "bbl/gpt-5.4-mini",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open Model Provider",
                body: "Go to `Settings`, then `Model Provider`, and click `Add Provider`.",
            },
            {
                title: "Pick OpenAI",
                body: "Set the provider type to `OpenAI` (or `New API` - both map to OpenAI-compatible). Fill in the name, host, and key.",
                code: {
                    lang: "text",
                    value: `Provider Name: FreeTheAi
Provider Type: OpenAI
API Host: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Add models",
                body: "Click `Manage` under Models, then `Add Model`. Paste FreeTheAi aliases, one per row.",
            },
        ],
        gotchas: [
            "Use the `OpenAI` provider type and include `/v1` in the host yourself - some other types try to add their own path.",
            "Cherry's `Test` button hits chat completions with a 1-token probe. Reasoning models may report `length` finish; that still confirms auth.",
        ],
        keywords: ["cherry studio", "cherryhq", "cherry-ai"],
    },
    {
        slug: "typingmind",
        name: "TypingMind",
        tagline: "Polished BYOK web frontend.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://www.typingmind.com",
        docsUrl:
            "https://docs.typingmind.com/manage-and-connect-ai-models/openai",
        summary:
            "TypingMind lets you paste any OpenAI-compatible endpoint as a custom model. Add FreeTheAi and use any alias.",
        recommendedModels: [
            "agr/deepseek-v4-pro",
            "bbg/zai-org/GLM-5.1",
            "bbg/moonshotai/Kimi-K2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open Models",
                body: "Click the gear icon, go to `Models`, then `Add Custom Models`.",
            },
            {
                title: "Pick OpenAI as the API type",
                body: "TypingMind uses the OpenAI Chat Completions schema for custom endpoints.",
            },
            {
                title: "Fill the endpoint",
                body: "Use these values.",
                code: {
                    lang: "text",
                    value: `Custom endpoint / Base URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY
Model ID: agr/deepseek-v4-pro`,
                },
            },
            {
                title: "Test and add",
                body: "Toggle Plugins/Vision only if your alias supports them. Click Test, then Add Model.",
            },
        ],
        gotchas: [
            "Plugins (function calling) only work on aliases with native tool support. Avoid `cat/*`/`yng/*` for plugin-driven flows.",
            "Vision toggle only works on aliases with `supports_images: true` in `/v1/models/full`.",
        ],
        keywords: ["typingmind", "byok", "chat"],
    },
    {
        slug: "boltai",
        name: "BoltAI",
        tagline: "Native macOS AI assistant in any app.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://boltai.com",
        docsUrl: "https://boltai.com/help/how-to-setup-custom-openai-server",
        summary:
            "BoltAI floats AI in any macOS app. Add FreeTheAi as a custom OpenAI-compatible server.",
        recommendedModels: [
            "bbl/gpt-5.4-mini",
            "bbg/zai-org/GLM-5.1",
            "wsf/kimi-k2.6",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open Models settings",
                body: "Open BoltAI settings, go to `Models`, click `+`, and choose `OpenAI-compatible Server`.",
            },
            {
                title: "Fill the server",
                body: "Use these values. Look up the alias's context window in /v1/models/full.",
                code: {
                    lang: "text",
                    value: `Name: FreeTheAi
Base URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY
Model ID: bbl/gpt-5.4-mini
Context Length: 80000`,
                },
            },
            {
                title: "Toggle streaming",
                body: "Turn `Streaming` on so BoltAI surfaces tokens as they arrive.",
            },
        ],
        gotchas: [
            "BoltAI does not auto-fetch the model list for this connector. Each FreeTheAi alias is one manual entry.",
            "Set Context Length manually. Skipping it can clip long prompts or responses.",
        ],
        keywords: ["boltai", "bolt ai", "macos"],
    },
    {
        slug: "page-assist",
        name: "Page Assist",
        tagline: "Browser extension for AI while you browse.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://pageassist.xyz",
        repository: "https://github.com/n4ze3m/page-assist",
        summary:
            "Page Assist runs in the browser side panel. Add FreeTheAi as a custom OpenAI-compatible API and pick the alias you want.",
        recommendedModels: [
            "bbl/gpt-5.4-mini",
            "bbg/zai-org/GLM-5.1",
            "rev/claude-sonnet-4.5",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
        },
        steps: [
            {
                title: "Open Page Assist settings",
                body: "Click the Page Assist toolbar icon and open the gear icon for settings.",
            },
            {
                title: "Add a Custom OpenAI provider",
                body: "Go to `OpenAI Compatible API`, click `Add Provider`, then `Custom`.",
            },
            {
                title: "Fill the provider",
                body: "Use these values.",
                code: {
                    lang: "text",
                    value: `Provider Name: FreeTheAi
Base URL: https://api.freetheai.xyz/v1
API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Add aliases as models",
                body: "Open the `Models` section in Page Assist and add the FreeTheAi aliases you want to chat with.",
            },
        ],
        gotchas: [
            "The Custom provider does not auto-discover models. Add aliases manually.",
            "Auto-discovery is reserved for built-in providers like LM Studio and Ollama.",
        ],
        keywords: ["page assist", "browser extension", "n4ze3m"],
    },
    {
        slug: "chatbox",
        name: "Chatbox",
        tagline: "Cross-platform desktop and mobile chat client.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://chatboxai.app",
        repository: "https://github.com/chatboxai/chatbox",
        summary:
            "Chatbox supports any OpenAI-compatible base. Use the OpenAI API Compatible mode and split the URL into Host and Path.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "bbl/gpt-5.4-mini",
            "rev/claude-sonnet-4.5",
        ],
        baseUrl: "https://api.freetheai.xyz",
        apiPath: "/v1/chat/completions",
        compatibility: {
            chatCompletions: true,
            streaming: true,
        },
        steps: [
            {
                title: "Open Add Custom Provider",
                body: "Click `Settings`, then `Display`, then `AI Provider`, then `Add Custom Provider`.",
            },
            {
                title: "Pick OpenAI API Compatible mode",
                body: "Do not pick the Responses API option unless you specifically want the Responses route.",
            },
            {
                title: "Split host and path",
                body: "Chatbox needs Host and Path as separate fields.",
                code: {
                    lang: "text",
                    value: `Name: FreeTheAi
API Mode: OpenAI API Compatible
API Host: https://api.freetheai.xyz
API Path: /v1/chat/completions
API Key: PASTE_YOUR_FREETHEAI_KEY`,
                },
            },
            {
                title: "Add aliases",
                body: "Add FreeTheAi aliases under the Models section.",
            },
        ],
        gotchas: [
            "Putting `/v1` in Host with empty Path does not work. Keep the full Chat Completions path in `API Path`.",
            "Use `OpenAI API Compatible`, not `OpenAI Responses API Compatible`, unless you specifically want the Responses spec.",
        ],
        keywords: ["chatbox", "chatboxai"],
    },
    {
        slug: "big-agi",
        name: "Big-AGI",
        tagline: "Open-source web AI workbench for power users.",
        category: "general",
        categoryLabel: "General chat clients",
        homepage: "https://big-agi.com",
        repository: "https://github.com/enricoros/big-AGI",
        summary:
            "Big-AGI's OpenAI vendor accepts a custom API endpoint. Drop FreeTheAi in and Big-AGI auto-fetches /v1/models.",
        recommendedModels: [
            "bbg/zai-org/GLM-5.1",
            "rev/claude-sonnet-4.5",
            "bbg/deepseek-ai/DeepSeek-V4-Pro",
        ],
        baseUrl: "https://api.freetheai.xyz/v1",
        compatibility: {
            chatCompletions: true,
            streaming: true,
            toolCalling: true,
        },
        steps: [
            {
                title: "Open Models",
                body: "Click `Models` and `Add a model source`. Pick `OpenAI`.",
            },
            {
                title: "Fill the source",
                body: "Use these values.",
                code: {
                    lang: "text",
                    value: `API Key: PASTE_YOUR_FREETHEAI_KEY
API Endpoint: https://api.freetheai.xyz/v1`,
                },
            },
            {
                title: "Refresh models",
                body: "Click the `Models` button to refresh the list. Big-AGI calls /v1/models and pulls in the FreeTheAi catalog.",
            },
        ],
        gotchas: [
            "Leave Helicone Key blank. Adding it forces the host to a different domain.",
            "Disable the `Moderation` toggle. FreeTheAi does not expose a moderation endpoint.",
        ],
        keywords: ["big-agi", "big agi", "enricoros"],
    },
];

/**
 * var setupGuidesByCategory
 * type Map<SetupCategory, SetupGuide[]>
 * desc Convenience grouping for the index page and nav dropdown.
 */
export function setupGuidesByCategory(): Record<SetupCategory, SetupGuide[]> {
    const empty: Record<SetupCategory, SetupGuide[]> = {
        coding: [],
        roleplay: [],
        general: [],
        cli: [],
    };
    for (const guide of SETUP_GUIDES) {
        empty[guide.category].push(guide);
    }
    return empty;
}

export const CATEGORY_ORDER: SetupCategory[] = [
    "coding",
    "roleplay",
    "general",
    "cli",
];

export const CATEGORY_LABELS: Record<SetupCategory, string> = {
    coding: "Coding agents",
    roleplay: "Roleplay & chat frontends",
    general: "General chat clients",
    cli: "CLI & scripting",
};

export const CATEGORY_DESCRIPTIONS: Record<SetupCategory, string> = {
    coding:
        "VSCode and JetBrains extensions, native editors, and pair-programming agents that talk to FreeTheAi over the OpenAI-compatible API.",
    roleplay:
        "Roleplay and chat frontends that point to FreeTheAi as a reverse proxy.",
    general:
        "General-purpose chat clients and self-hosted ChatGPT-style web UIs.",
    cli: "Command-line tools and scripts that use the OpenAI SDK or curl directly.",
};
