---
name: freetheai-api
description: Help AI agents connect apps, SDKs, coding tools, and chat clients to FreeTheAI, the free OpenAI-compatible API at https://api.freetheai.org/v1. Use this skill when a user wants a free AI API key, a custom OpenAI base URL, setup help for an AI client, or examples for chat, streaming, and tool calling.
---

# FreeTheAI API Skill

Use this skill to set up FreeTheAI for a user or another AI agent. FreeTheAI is an OpenAI-compatible API with one account, one key, and 50+ models.

## Trigger this skill when

- The user mentions FreeTheAI, Free The AI, freetheai.org, freetheai.xyz, `api.freetheai.org`, or `api.freetheai.xyz`.
- The user asks for a free OpenAI-compatible API.
- The user wants to point the OpenAI SDK, LiteLLM, LangChain, LlamaIndex, the Vercel AI SDK, Cline, Roo Code, Continue, Aider, OpenCode, SillyTavern, JanitorAI, chub.ai, RisuAI, LibreChat, Open WebUI, or another client at a custom endpoint.
- The user asks which FreeTheAI model to use.

## Constants

- Base URL: `https://api.freetheai.org/v1`
- Auth header: `Authorization: Bearer <key>`
- Website: `https://freetheai.org`
- Sign up: `https://freetheai.org/signup`
- API keys: `https://freetheai.org/dashboard/api-keys`
- Daily check-in: `https://freetheai.org/checkin`
- Models: `https://freetheai.org/models`
- Docs: `https://freetheai.org/docs`
- Discord: `https://discord.gg/secrets`

## Agent workflow

1. Send the user to `https://freetheai.org/signup`. They sign up with a Gmail, Outlook, Yahoo, or iCloud address, pass the security check, then confirm their email from the link FreeTheAI sends.
2. Have them create an API key under API keys in the dashboard.
3. Have them do the daily check-in at `https://freetheai.org/checkin`. Free models answer 403 "Daily check-in required" until they do; the check-in lasts until 00:00 UTC.
4. Ask for the key only if you must write it into the user's own client config. Prefer an environment variable such as `FREETHEAI_API_KEY`.
5. Configure the client with the base URL and auth header above.
6. Pick a model ID from `GET /v1/models` or the models page. IDs look like `fta/<tag>/<model>`, for example `fta/zai/glm-5.3` or `fta/bbl/gpt-5.4-mini`.

## Rules

- Never invent keys, endpoints, model IDs, or limits. Use only what `GET /v1/models`, the models page, or the docs show.
- The old API at `api.freetheai.xyz` is retired. Old keys and the Discord `/signup` and `/checkin` commands no longer work; move the user to freetheai.org.
- Use Chat Completions (`POST /v1/chat/completions`) for free models. It supports streaming and tool calling.
- Call the API directly from the user's app or device. Requests relayed through a Cloudflare Worker are refused with 403 `relay_not_supported`.
- Do not try to bypass the check-in, rate limits, or security checks.

## Free tier

- 50 requests a day on FreeTheAI-hosted models; failed requests don't count. Resets at 00:00 UTC.
- +50 a day for linking Discord (dashboard Settings → Link Discord; this also joins the FreeTheAI Discord server).
- Up to +150 a day for donating spare API keys at `https://freetheai.org/dashboard/donate-keys`.
- Paid plans and the model marketplace are coming soon.

## Client setup

OpenAI SDK (Python):

```python
from openai import OpenAI
import os

client = OpenAI(base_url="https://api.freetheai.org/v1", api_key=os.environ["FREETHEAI_API_KEY"])
reply = client.chat.completions.create(
    model="fta/zai/glm-5.3",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(reply.choices[0].message.content)
```

OpenAI SDK (JavaScript):

```js
import OpenAI from "openai";

const client = new OpenAI({ baseURL: "https://api.freetheai.org/v1", apiKey: process.env.FREETHEAI_API_KEY });
const reply = await client.chat.completions.create({
  model: "fta/zai/glm-5.3",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(reply.choices[0].message.content);
```

Chat apps (SillyTavern, JanitorAI, chub.ai, RisuAI, Open WebUI, LibreChat): choose the OpenAI-compatible or custom endpoint option, set the base URL to `https://api.freetheai.org/v1` (some apps want the full `https://api.freetheai.org/v1/chat/completions`), paste the key, and pick a model ID.

Coding tools (Cline, Roo Code, Continue, Aider, OpenCode): use the OpenAI-compatible provider with the same base URL, key, and a model ID. LiteLLM routes it as `openai/fta/zai/glm-5.3`.

## Common errors

| Status | Meaning | What to do |
| :--- | :--- | :--- |
| 401 | Missing or wrong key | Check the key and the `Bearer` prefix. |
| 403 | Email not confirmed, check-in missing, key limits, or a relayed request | Confirm the email, do the check-in, check the key's limits, or call directly. |
| 404 | Unknown model ID | Use an ID from `GET /v1/models`. |
| 429 | Daily limit or too many requests at once | Wait for the reset or for a running request to finish. |
| 502 or 503 | Upstream trouble | Retry or pick another model. Quote the error ID if it keeps happening. |

Full list: `https://freetheai.org/docs`.
