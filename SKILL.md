---
name: freetheai-api
description: Help AI agents connect apps, SDKs, coding tools, and chat clients to FreeTheAI, an AI model marketplace with one OpenAI-compatible API at https://api.freetheai.org/v1, paid per token. Use this skill when a user wants a FreeTheAI API key, a custom OpenAI base URL, setup help for an AI client, or examples for chat, streaming, and tool calling.
---

# FreeTheAI API Skill

Use this skill to set up FreeTheAI for a user or another AI agent. FreeTheAI is an AI model marketplace with one OpenAI-compatible API: one account and one key reach models from many providers, paid per token from one wallet at each provider's listed price.

## Trigger this skill when

- The user mentions FreeTheAI, Free The AI, freetheai.org, freetheai.xyz, `api.freetheai.org`, or `api.freetheai.xyz`.
- The user asks for one OpenAI-compatible API for models from several providers.
- The user wants to point the OpenAI SDK, LiteLLM, LangChain, LlamaIndex, the Vercel AI SDK, Cline, Roo Code, Continue, Aider, OpenCode, SillyTavern, JanitorAI, chub.ai, RisuAI, LibreChat, Open WebUI, or another client at a custom endpoint.
- The user asks which FreeTheAI model to use.

## Constants

- Base URL: `https://api.freetheai.org/v1`
- Auth header: `Authorization: Bearer <key>`
- Website: `https://freetheai.org`
- Sign up: `https://freetheai.org/signup`
- API keys: `https://freetheai.org/dashboard/api-keys`
- Providers: `https://freetheai.org/providers`
- Models: `https://freetheai.org/models`
- Docs: `https://freetheai.org/docs`
- Discord: `https://discord.gg/secrets`

## Agent workflow

1. Send the user to `https://freetheai.org/signup`. They sign up with a Gmail, Outlook, Yahoo, or iCloud address, pass the security check, then confirm their email from the link FreeTheAI sends.
2. Have them create an API key under API keys in the dashboard.
3. Have them add funds to their wallet (from $5, crypto or card) and follow at least one provider at `https://freetheai.org/providers`. A key only uses the providers its account follows; a paid request with no money answers 402.
4. Ask for the key only if you must write it into the user's own client config. Prefer an environment variable such as `FREETHEAI_API_KEY`.
5. Configure the client with the base URL and auth header above.
6. Pick a model ID from `GET /v1/models` or the models page. A model ID is the model name, for example `glm-5.3`; `<provider>/<model>` picks one provider.

## Rules

- Never invent keys, endpoints, model IDs, or limits. Use only what `GET /v1/models`, the models page, or the docs show.
- The old API at `api.freetheai.xyz` is retired. Old keys and the Discord `/signup` and `/checkin` commands no longer work; move the user to freetheai.org.
- Chat Completions (`POST /v1/chat/completions`), Responses, and Anthropic Messages are supported, with streaming and tool calls. Claude Code and the Anthropic SDK use the base URL `https://api.freetheai.org`.
- Call the API directly from the user's app or device. Requests relayed through a Cloudflare Worker are refused with 403 `relay_not_supported`.
- Do not try to bypass rate limits or security checks.

## Pricing

- Requests are paid from the FreeTheAI wallet: each one bills the tokens it used at the listed price. Wallets take $5 or more, by crypto or card. No subscription.
- The free tier closed for most accounts on November 10, 2026 (`https://freetheai.org/blog/free-tier-closing`). Do not promise free access.

## Client setup

OpenAI SDK (Python):

```python
from openai import OpenAI
import os

client = OpenAI(base_url="https://api.freetheai.org/v1", api_key=os.environ["FREETHEAI_API_KEY"])
reply = client.chat.completions.create(
    model="glm-5.3",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(reply.choices[0].message.content)
```

OpenAI SDK (JavaScript):

```js
import OpenAI from "openai";

const client = new OpenAI({ baseURL: "https://api.freetheai.org/v1", apiKey: process.env.FREETHEAI_API_KEY });
const reply = await client.chat.completions.create({
  model: "glm-5.3",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(reply.choices[0].message.content);
```

Chat apps (SillyTavern, JanitorAI, chub.ai, RisuAI, Open WebUI, LibreChat): choose the OpenAI-compatible or custom endpoint option, set the base URL to `https://api.freetheai.org/v1` (some apps want the full `https://api.freetheai.org/v1/chat/completions`), paste the key, and pick a model ID.

Coding tools (Cline, Roo Code, Continue, Aider, OpenCode): use the OpenAI-compatible provider with the same base URL, key, and a model ID. LiteLLM routes it as `openai/glm-5.3`.

## Common errors

| Status | Meaning | What to do |
| :--- | :--- | :--- |
| 401 | Missing or wrong key | Check the key and the `Bearer` prefix. |
| 402 | Not enough money in the wallet | Add funds on the dashboard. |
| 403 | Email not confirmed, provider not followed, key limits, or a relayed request | Confirm the email, follow a provider that serves the model, check the key's limits, or call directly. |
| 404 | Unknown model ID | Use an ID from `GET /v1/models`. |
| 429 | Too many requests at once | Wait for a running request to finish. |
| 502 or 503 | Upstream trouble | Retry or pick another model. Quote the error ID if it keeps happening. |

Full list: `https://freetheai.org/docs`.
