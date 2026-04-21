<div align="center">

# Free AI

### Free OpenAI-compatible AI API for anyone to use

Get a key through Discord, point your client at the base URL, and start building.

[![API](https://img.shields.io/badge/API-OpenAI%20Compatible-111827?style=for-the-badge)](https://api.freetheai.xyz)
[![Base URL](https://img.shields.io/badge/Base%20URL-api.freetheai.xyz-0ea5e9?style=for-the-badge)](https://api.freetheai.xyz)
[![Limits](https://img.shields.io/badge/Limit-30%20RPM-f59e0b?style=for-the-badge)](https://discord.gg/secrets)
[![Privacy](https://img.shields.io/badge/Logging-No%20Prompt%20Storage-16a34a?style=for-the-badge)](https://api.freetheai.xyz/v1/health)
[![Discord](https://img.shields.io/badge/Discord-discord.gg%2Fsecrets-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/secrets)

</div>

## What This Is

`Free AI` is a public OpenAI-compatible API for builders who want working model access without the usual friction.

- No credit card
- No daily limit
- No prompt storage
- One Discord slash command to get started

If you can use the OpenAI SDK, you can use this API.

## Community

- Discord invite: `https://discord.gg/rG3SYpeqYF`
- Vanity invite: `https://discord.gg/secrets`

## Get A Key

1. Join the Discord server.
2. Run `/signup`.
3. Copy your key immediately.

If you lose it later:

- run `/resetkey`
- get a brand new key
- keep the same usage totals and account stats

## Limits

- `30 requests per minute`
- `No daily limit`

The per-minute cap exists so everyone gets a fair chance to use it.

## Privacy

Prompt text and completion text are **not** stored.

Only request metadata is kept:

- model id
- input token count
- output token count
- request timestamp
- request status
- source IP

## Base URL

```text
https://api.freetheai.xyz
```

## API Surface

| Route | Method | Description |
| --- | --- | --- |
| `/v1/health` | `GET` | Health check |
| `/v1/models` | `GET` | Current model list |
| `/v1/chat/completions` | `POST` | OpenAI-compatible chat completions |

Auth header:

```http
Authorization: Bearer YOUR_API_KEY
```

## Quick Start

### List Models

```bash
curl https://api.freetheai.xyz/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Chat Completion

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm/glm-5.1",
    "messages": [
      {
        "role": "user",
        "content": "Write a hello world in Python."
      }
    ]
  }'
```

## OpenAI SDK Usage

### Python

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.freetheai.xyz/v1",
)

completion = client.chat.completions.create(
    model="glm/glm-5.1",
    messages=[
        {"role": "user", "content": "Explain recursion in one paragraph."}
    ],
)

print(completion.choices[0].message.content)
```

### JavaScript

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.freetheai.xyz/v1"
});

const completion = await client.chat.completions.create({
  model: "glm/glm-5.1",
  messages: [
    { role: "user", content: "Say hello in one sentence." }
  ]
});

console.log(completion.choices[0].message.content);
```

### Raw Fetch

```js
const response = await fetch("https://api.freetheai.xyz/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "or/openai/gpt-oss-20b:free",
    messages: [
      { role: "user", content: "Summarize recursion in simple terms." }
    ]
  })
});

const data = await response.json();
console.log(data);
```

## Example Request Body

```json
{
  "model": "glm/glm-5.1",
  "messages": [
    {
      "role": "user",
      "content": "Build a Python script that reads a CSV and prints the top 5 rows."
    }
  ],
  "stream": false
}
```

## Model Families

Use the exact ids returned by `GET /v1/models`.

- `glm/*`
- `kai/*`
- `opc/*`
- `or/*`

## Current Model Snapshot

The live source of truth is always:

```text
GET /v1/models
```

Current snapshot from the deployed API:

<details>
<summary><strong>glm/*</strong></summary>

- `glm/glm-4.5`
- `glm/glm-4.5-air`
- `glm/glm-4.6`
- `glm/glm-4.7`
- `glm/glm-5`
- `glm/glm-5.1`

</details>

<details>
<summary><strong>kai/*</strong></summary>

- `kai/bytedance-seed/dola-seed-2.0-pro:free`
- `kai/google/lyria-3-clip-preview`
- `kai/google/lyria-3-pro-preview`
- `kai/inclusionai/ling-2.6-flash:free`
- `kai/kilo-auto/free`
- `kai/kilo/auto-free`
- `kai/nvidia/nemotron-3-super-120b-a12b:free`
- `kai/openrouter/free`
- `kai/stepfun/step-3.5-flash:free`
- `kai/x-ai/grok-code-fast-1:optimized:free`

</details>

<details>
<summary><strong>opc/*</strong></summary>

- `opc/big-pickle`
- `opc/gpt-5-nano`
- `opc/ling-2.6-flash-free`
- `opc/minimax-m2.5-free`
- `opc/nemotron-3-super-free`
- `opc/trinity-large-preview-free`

</details>

<details>
<summary><strong>or/*</strong></summary>

- `or/arcee-ai/trinity-large-preview:free`
- `or/cognitivecomputations/dolphin-mistral-24b-venice-edition:free`
- `or/google/gemma-3-12b-it:free`
- `or/google/gemma-3-27b-it:free`
- `or/google/gemma-3-4b-it:free`
- `or/google/gemma-3n-e2b-it:free`
- `or/google/gemma-3n-e4b-it:free`
- `or/google/gemma-4-26b-a4b-it:free`
- `or/google/gemma-4-31b-it:free`
- `or/google/lyria-3-clip-preview`
- `or/google/lyria-3-pro-preview`
- `or/inclusionai/ling-2.6-flash:free`
- `or/liquid/lfm-2.5-1.2b-instruct:free`
- `or/liquid/lfm-2.5-1.2b-thinking:free`
- `or/meta-llama/llama-3.2-3b-instruct:free`
- `or/meta-llama/llama-3.3-70b-instruct:free`
- `or/minimax/minimax-m2.5:free`
- `or/nousresearch/hermes-3-llama-3.1-405b:free`
- `or/nvidia/nemotron-3-nano-30b-a3b:free`
- `or/nvidia/nemotron-3-super-120b-a12b:free`
- `or/nvidia/nemotron-nano-12b-v2-vl:free`
- `or/nvidia/nemotron-nano-9b-v2:free`
- `or/openai/gpt-oss-120b:free`
- `or/openai/gpt-oss-20b:free`
- `or/openrouter/free`
- `or/qwen/qwen3-coder:free`
- `or/qwen/qwen3-next-80b-a3b-instruct:free`
- `or/z-ai/glm-4.5-air:free`

</details>

## Why This Exists

Most people never get to build with AI because the first barrier is cost, credits, or access.

This project removes that barrier.

Run one slash command, get a key, and ship.

## Notes

- The API is OpenAI-compatible on the public side
- The model list may change over time as upstream availability changes
- `GET /v1/models` is the live source of truth
- If you lose your key, use `/resetkey`
