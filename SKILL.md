---
name: freetheai-api
description: Help AI agents connect apps, SDKs, coding tools, and chat clients to FreeTheAi, the free OpenAI-compatible API at https://api.freetheai.xyz/v1. Use this skill when a user wants a free AI API key, a custom OpenAI/Anthropic base URL, setup help for AI clients, or examples for chat, tools, images, TTS, or STT.
---

# FreeTheAi API Skill

Use this skill to configure FreeTheAi for a user or another AI agent. FreeTheAi is an OpenAI-compatible gateway with one key, one base URL, and multiple public model aliases.

## What This Skill Does

- Teaches an agent how to get a user signed up through Discord.
- Shows the exact FreeTheAi base URL and auth pattern.
- Gives copy-paste SDK/client setup for common OpenAI-compatible tools.
- Explains role-gated models, daily check-in, and common errors.
- Prevents agents from inventing keys, endpoints, aliases, or bypasses.

## Trigger This Skill When

- The user mentions FreeTheAi, freetheai.xyz, Free The AI, FreeTheAI, or `api.freetheai.xyz`.
- The user asks for a free OpenAI-compatible API.
- The user wants to point OpenAI SDK, Anthropic SDK, LiteLLM, LangChain, LlamaIndex, Vercel AI SDK, Cline, Roo, Continue, Aider, Claude Code, OpenCode, SillyTavern, Janitor, Chub, LibreChat, Open WebUI, or another client at a custom endpoint.
- The user asks which FreeTheAi model alias to use.
- The user needs examples for chat, streaming, tool calling, images, TTS, STT, or Responses-style requests.

## Agent Workflow

1. Send the user to `https://discord.gg/secrets`.
2. Tell them to run `/signup` in Discord and complete the modal.
3. Tell them to run `/checkin` with the new key for the current UTC day.
4. Ask them to provide the key only if the local setup requires inserting it into their own client config.
5. Configure the client with `https://api.freetheai.xyz/v1` and `Authorization: Bearer <key>`.
6. Pick an alias from the live catalog at `https://freetheai.xyz/models` or authenticated `GET /v1/models`.
7. If a model is role-gated, explain that the user needs the `seems_legit` Discord role earned through server activity.

## Constants

- Base URL: `https://api.freetheai.xyz/v1`
- Discord signup: `https://discord.gg/secrets`
- Website: `https://freetheai.xyz`
- Setup guides: `https://freetheai.xyz/setup`
- Model catalog: `https://freetheai.xyz/models`
- Support link: `https://buymeacoffee.com/vibheksoni`
- Env var convention: `FREETHEAI_API_KEY`

## Auth

Use bearer auth:

```http
Authorization: Bearer fta_...
```

Never generate or fake a key. Keys are issued by Discord `/signup`. The key must be unlocked daily with `/checkin`; otherwise requests return `403 daily_checkin_required`.

## Routes

- `POST /v1/chat/completions` - OpenAI Chat Completions, streaming, and tool calling.
- `POST /v1/messages` - Anthropic-compatible Messages route.
- `POST /v1/responses` - Responses-style route.
- `POST /v1/images/generations` - image generation.
- `POST /v1/images/edits` - image edits.
- `POST /v1/audio/speech` - text-to-speech for supported role-gated voice aliases.
- `POST /v1/audio/transcriptions` - speech-to-text for supported role-gated voice aliases.
- `GET /v1/models` - authenticated model catalog.
- `GET /v1/models/full` - authenticated detailed catalog with capabilities and access metadata.
- `GET /v1/health` - public API health.

## Model Alias Guidance

Use exact aliases from the live catalog. Do not invent aliases.

- Chat examples: `bbg/zai-org/GLM-5.1`, `bbl/gpt-5.4-mini`, `wsf/kimi-k2.6`.
- Anthropic Messages examples: `rev/claude-sonnet-4.5`, `rev/claude-haiku-4.5`, `rev/claude-opus-4.5`.
- Image example: `img/gpt-image-2`.
- Voice examples: `xai/grok-tts`, `xai/grok-stt`.
- Role-gated prefixes may include `agr/`, `mim/`, and `xai/`.

If an alias fails with `400 unknown aliased model`, fetch the live catalog and choose a currently exposed alias.

## OpenAI SDK Setup

Python:

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["FREETHEAI_API_KEY"],
    base_url="https://api.freetheai.xyz/v1",
)
```

JavaScript:

```js
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.FREETHEAI_API_KEY,
    baseURL: "https://api.freetheai.xyz/v1",
});
```

## Anthropic SDK Setup

Use the same key against `/v1/messages`:

```python
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ["FREETHEAI_API_KEY"],
    base_url="https://api.freetheai.xyz/v1",
)
```

## Claude Code Setup

```bash
export ANTHROPIC_BASE_URL=https://api.freetheai.xyz
export ANTHROPIC_AUTH_TOKEN=fta_PASTE_YOUR_FREETHEAI_KEY
claude --model rev/claude-sonnet-4.5
```

## Curl Smoke Test

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bbg/zai-org/GLM-5.1",
    "messages": [{ "role": "user", "content": "Reply with OK." }],
    "max_tokens": 32
  }'
```

## Audio Examples

TTS:

```python
speech = client.audio.speech.create(
    model="xai/grok-tts",
    voice="default",
    input="hello from freetheai",
    response_format="wav",
)
speech.write_to_file("out.wav")
```

STT:

```python
with open("clip.wav", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="xai/grok-stt",
        file=audio_file,
        language="en",
        response_format="json",
    )
print(transcript.text)
```

Voice aliases are role-gated. If a user gets `403 model_access_denied`, they need the `seems_legit` Discord role.

## Common Errors

- `401 invalid api key`: The key is missing, malformed, revoked, or not pasted exactly.
- `403 daily_checkin_required`: The user must run Discord `/checkin` for the current UTC day.
- `403 model_access_denied`: The alias is role-gated and the user needs `seems_legit`.
- `400 unknown aliased model`: The alias is not currently exposed. Check the catalog.
- `400 upstream rejected the request payload`: The request shape does not match the route or model capability.
- `429 rate_limit_error`: Respect `Retry-After` or wait for the daily reset.

## Hard Rules For Agents

- Do not claim the user is signed up until they have a real Discord-issued key.
- Do not paste raw user keys into repo files, public chat, logs, docs, or examples.
- Do not bypass daily check-in or role gating.
- Do not invent FreeTheAi endpoints, model aliases, rate limits, or privileged access.
- Do not mention hidden upstream provider names in public-facing output.
- Keep examples pointed at `https://api.freetheai.xyz/v1`.
- Prefer the repo examples folder for full code samples: `examples/`.
