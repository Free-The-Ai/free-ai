<div align="center">

# FreeTheAi

### Free AI API access with Discord signup, OpenAI-compatible routes, streaming, and tool calling

[![API](https://img.shields.io/badge/API-OpenAI%20Compatible-111827?style=for-the-badge)](https://api.freetheai.xyz)
[![Base URL](https://img.shields.io/badge/Base%20URL-api.freetheai.xyz-0ea5e9?style=for-the-badge)](https://api.freetheai.xyz)
[![Limits](https://img.shields.io/badge/Limit-30%20RPM-f59e0b?style=for-the-badge)](https://discord.gg/secrets)
[![Privacy](https://img.shields.io/badge/Logging-No%20Prompt%20Storage-16a34a?style=for-the-badge)](https://api.freetheai.xyz/v1/health)
[![Discord](https://img.shields.io/badge/Discord-discord.gg%2Fsecrets-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/secrets)

</div>

## What This Is

`FreeTheAi` is a public API for builders who want real model access without paying to get started.

- Discord slash-command signup
- OpenAI-compatible `chat/completions`
- Streaming support
- Tool calling support
- No daily cap
- No prompt storage

If your client works with the OpenAI SDK, it works here.

## Community

- Discord: `https://discord.gg/secrets`
- Backup invite: `https://discord.gg/rG3SYpeqYF`
- API: `https://api.freetheai.xyz`

## Get A Key

1. Open the Discord server.
2. Run `/signup`.
3. Copy the key immediately.

If you lose it:

1. Run `/resetkey`.
2. Get a fresh key.
3. Keep the same account stats and usage totals.

Useful Discord commands:

- `/signup`
- `/resetkey`
- `/models`
- `/stats`
- `/leaderboard`

## Limits

- `30 requests per minute`
- `No daily limit`

The minute cap is there so the pool stays usable for everyone.

## Privacy

Prompt text and completion text are **not** stored.

The service only keeps request metadata:

- alias model id
- token counts
- request timestamp
- request status
- client IP metadata

## Base URL

```text
https://api.freetheai.xyz
```

## Routes

| Route | Method | Description |
| --- | --- | --- |
| `/v1/health` | `GET` | Health check |
| `/v1/models` | `GET` | Live model catalog |
| `/v1/chat/completions` | `POST` | OpenAI-compatible chat completions |

Auth:

```http
Authorization: Bearer YOUR_API_KEY
```

## Quick Start

### List Models

```bash
curl https://api.freetheai.xyz/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Basic Chat

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wsf/kimi-k2.6",
    "messages": [
      {
        "role": "user",
        "content": "Write a Python hello world."
      }
    ]
  }'
```

## Tool Calling

Tool calling is live on the public API.

### Non-streaming tool call example

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wsf/swe-1.6",
    "tool_choice": "required",
    "messages": [
      {
        "role": "user",
        "content": "Use the get_weather tool for Boston and do not answer directly."
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the weather for a city.",
          "parameters": {
            "type": "object",
            "properties": {
              "city": { "type": "string" }
            },
            "required": ["city"],
            "additionalProperties": false
          }
        }
      }
    ]
  }'
```

Expected result shape:

- `choices[0].finish_reason == "tool_calls"`
- `choices[0].message.tool_calls` present

### Python SDK example

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.freetheai.xyz/v1",
)

completion = client.chat.completions.create(
    model="wsf/swe-1.6",
    tool_choice="required",
    messages=[
        {
            "role": "user",
            "content": "Use the get_weather tool for Boston and do not answer directly."
        }
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the weather for a city.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string"}
                    },
                    "required": ["city"],
                    "additionalProperties": False,
                },
            },
        }
    ],
)

print(completion.choices[0].message.tool_calls)
```

## JavaScript SDK Example

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.freetheai.xyz/v1"
});

const completion = await client.chat.completions.create({
  model: "wsf/kimi-k2.6",
  messages: [
    { role: "user", content: "Say hello in one sentence." }
  ]
});

console.log(completion.choices[0].message.content);
```

## Model Families

Use the exact ids returned by `GET /v1/models`.

- `glm/*`
- `kai/*`
- `opc/*`
- `or/*`
- `wsf/*`

## Current Live Snapshot

The live source of truth is always:

```text
GET /v1/models
```

Current notable families from the deployed API:

### `wsf/*`

- `wsf/kimi-k2.5`
- `wsf/kimi-k2.6`
- `wsf/swe-1.5`
- `wsf/swe-1.6`

### `glm/*`

- `glm/glm-4.5`
- `glm/glm-4.5-air`
- `glm/glm-4.6`
- `glm/glm-4.7`
- `glm/glm-5`
- `glm/glm-5.1`

### `opc/*`

- `opc/big-pickle`
- `opc/gpt-5-nano`
- `opc/ling-2.6-flash-free`
- `opc/minimax-m2.5-free`
- `opc/nemotron-3-super-free`
- `opc/trinity-large-preview-free`

### `or/*` and `kai/*`

The broader free catalog is live under both `or/*` and `kai/*`, including free OSS, Gemma, Nemotron, GLM Air, Ling, and other rotating entries.

## Notes

- The public API is OpenAI-compatible.
- Tool calling now works on the public `wsf/*` path.
- Prompt text is not stored.
- The backend implementation is private.
- Model availability can change as the live upstream catalog changes.
- If you lose your key, use `/resetkey`.

## Repo

- Docs / landing page repo: `https://github.com/vibheksoni/free-ai`
- Live site: `https://freetheai.xyz`
- Live API: `https://api.freetheai.xyz`
