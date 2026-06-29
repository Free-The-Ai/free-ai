<div align="center">

# FreeTheAi

<img src="assets/TrevorSecretsToAi.webp" alt="TrevorSecretsToAi" width="400" style="border-radius: 8px;" />
<br>
<sub><i>gpt-image-2 api for free</i></sub>
<br><br>

**Free OpenAI-compatible API - 60+ active models, zero billing**

<sub>Also searched as <strong>Free The AI</strong>, <strong>Free The Ai</strong>, and <strong>FreeTheAI</strong>.</sub>

Chat | Streaming | Tool Calling | Image Generation | Audio

<br>

[![Models](https://img.shields.io/badge/models-60%2B%20active-white?style=flat-square)](https://freetheai.xyz/models)
[![API](https://img.shields.io/badge/OpenAI-compatible-white?style=flat-square)](https://api.freetheai.xyz)
[![Cost](https://img.shields.io/badge/cost-%240-white?style=flat-square)](https://freetheai.xyz)
[![Prompts](https://img.shields.io/badge/prompts-not%20stored-white?style=flat-square)](https://freetheai.xyz)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/secrets)

<br>

[Website](https://freetheai.xyz) | [Quickstart](https://freetheai.xyz/quickstart) | [Setup Guides](https://freetheai.xyz/setup) | [Docs](https://freetheai.xyz/docs) | [Model Catalog](https://freetheai.xyz/models) | [Pricing](https://freetheai.xyz/pricing) | [Status](https://freetheai.xyz/status) | [API Health](https://api.freetheai.xyz/v1/health) | [Discord](https://discord.gg/secrets) | [Support](https://buymeacoffee.com/vibheksoni)

<br>

[Roleplay API](https://freetheai.xyz/roleplay-api) | [Coding Agent API](https://freetheai.xyz/coding-agent-api) | [OpenAI-Compatible API](https://freetheai.xyz/openai-compatible-api) | [What Is Free The AI](https://freetheai.xyz/what-is-free-the-ai)

</div>

---

## Overview

FreeTheAi, also searched as Free The AI or Free The Ai, is a free API gateway with 60+ active models behind a single key. OpenAI-compatible - if your SDK works with OpenAI, it works here. Full request docs live at [freetheai.xyz/docs](https://freetheai.xyz/docs).

- `POST /v1/chat/completions` - chat with streaming and tool calling
- `POST /v1/messages` - Anthropic-style messages route
- `POST /v1/responses` - OpenAI Responses API
- `POST /v1/images/generations` - image generation
- `POST /v1/images/edits` - image edits for supported image aliases
- `POST /v1/audio/speech` and `/v1/audio/transcriptions` - supported voice aliases
- Tool calling, structured outputs, multi-turn conversations
- No billing, no credit card, no prompt storage
- Optional paid slots at [freetheai.xyz/pricing](https://freetheai.xyz/pricing) for separate higher-power models

---

## Quick Start

```
Base URL    https://api.freetheai.xyz/v1
Auth        Bearer YOUR_API_KEY
```

<table>
<tr>
<td width="50%">

**1 - Join Discord**

Open [discord.gg/secrets](https://discord.gg/secrets)

</td>
<td width="50%">

**2 - Get a key**

Run `/signup` and complete the Discord modal

</td>
</tr>
<tr>
<td>

**3 - Check in**

Run `/checkin` with your API key once per UTC day

</td>
<td>

**4 - Build**

Point any OpenAI SDK at the base URL

</td>
</tr>
</table>

> [!IMPORTANT]
> New keys must complete `/checkin` once per UTC day before API use. `/checkin` asks for your existing key and a randomized human challenge.

> [!TIP]
> Lost your key? Run `/resetkey` and provide a real reset reason - same account, same stats, fresh key.

---

## Setup Guides

Step-by-step setup for the most common AI clients lives at [freetheai.xyz/setup](https://freetheai.xyz/setup).

| Category | Clients |
| :--- | :--- |
| Coding agents | OpenCode, Kilo Code, Zed, Cline, Roo Code, Continue.dev |
| CLI | Aider, Claude Code |
| Roleplay & chat | SillyTavern, Janitor AI, Chub AI, RisuAI |
| General chat clients | LibreChat, Open WebUI, LobeChat, AnythingLLM, Cherry Studio, TypingMind, BoltAI, Page Assist, Chatbox, Big-AGI |

Each guide ships exact field labels, a copy-paste config, and the gotchas users actually hit.

---

## SKILL.md

This repo includes a [`SKILL.md`](SKILL.md) describing how AI agents should connect to FreeTheAi (base URL, routes, model aliases, capability metadata, and rate limits). The standalone skeuomorphic UI skill that previously lived here is now at [`docs/SKILL_SKEUOMORPHIC.md`](docs/SKILL_SKEUOMORPHIC.md).

---

## Routes

| Route | Method | What it does |
| :--- | :---: | :--- |
| `/v1/chat/completions` | `POST` | Chat completions with streaming |
| `/v1/messages` | `POST` | Anthropic-style messages |
| `/v1/responses` | `POST` | OpenAI Responses API |
| `/v1/images/generations` | `POST` | Image generation |
| `/v1/images/edits` | `POST` | Image edits for supported image aliases |
| `/v1/images/generations/{request_id}` | `GET` | Poll async image generation jobs |
| `/v1/audio/speech` | `POST` | Text to speech for supported voice aliases |
| `/v1/audio/transcriptions` | `POST` | Speech to text for supported voice aliases |
| `/v1/models` | `GET` | Authenticated model catalog |
| `/v1/models/full` | `GET` | Expanded model catalog with throughput policy metadata |
| `/v1/models/leaderboard` | `GET` | Site-key top model leaderboard |
| `/v1/health` | `GET` | Health check |

---

## Code Examples

<details>
<summary><b>Chat - curl</b></summary>
<br>

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm/glm-5.1",
    "messages": [
      { "role": "user", "content": "Write a Python hello world." }
    ],
    "stream": true
  }'
```

</details>

<details>
<summary><b>Chat - JavaScript</b></summary>
<br>

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FREETHEAI_API_KEY,
  baseURL: "https://api.freetheai.xyz/v1",
});

const res = await client.chat.completions.create({
  model: "glm/glm-5.1",
  messages: [{ role: "user", content: "Say hello." }],
});

console.log(res.choices[0].message.content);
```

</details>

<details>
<summary><b>Chat - Python</b></summary>
<br>

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.freetheai.xyz/v1",
)

res = client.chat.completions.create(
    model="glm/glm-5.1",
    messages=[{"role": "user", "content": "Say hello."}],
)

print(res.choices[0].message.content)
```

</details>

<details>
<summary><b>Messages API - curl</b></summary>
<br>

```bash
curl https://api.freetheai.xyz/v1/messages \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm/glm-5.1",
    "max_tokens": 256,
    "messages": [
      { "role": "user", "content": "Write a migration plan." }
    ]
  }'
```

</details>

<details>
<summary><b>Tool calling - Python</b></summary>
<br>

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.freetheai.xyz/v1",
)

res = client.chat.completions.create(
    model="glm/glm-5.1",
    tool_choice="required",
    messages=[{"role": "user", "content": "Get weather for Boston."}],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
                "additionalProperties": False,
            },
        },
    }],
)

print(res.choices[0].message.tool_calls)
```

</details>

<details>
<summary><b>Image generation - curl</b></summary>
<br>

```bash
curl https://api.freetheai.xyz/v1/images/generations \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "eve/gpt-image-2",
    "prompt": "A neon sports car under rainy city lights"
  }'
```

The free API exposes `eve/gpt-image-2`, `eve/gpt-image-2-low`, and `eve/gpt-image-2-medium` for image generation. It also exposes `ever/*image*` aliases for image generation and supported image edits. Live availability and any future image models are in [`GET /v1/models`](https://freetheai.xyz/models).

Image responses are OpenAI-compatible and return:

- `data[0].b64_json` for base64 image data
- For long EVE jobs, send `background: true` or `async: true`, then poll `GET /v1/images/generations/{request_id}` with the same API key.

</details>

See [`examples/image_client.py`](examples/image_client.py) for a beginner-friendly CLI tool that saves the key locally and writes the returned `b64_json` image to disk.

---

## Release And Growth

Public releases make updates easier to follow and help the repo look active to GitHub users.

- Latest release draft notes: [`RELEASE_NOTES.md`](RELEASE_NOTES.md)
- Public changelog: [`CHANGELOG.md`](CHANGELOG.md)
- SEO and GitHub growth checklist: [`docs/GROWTH.md`](docs/GROWTH.md)

If this project helps you, star the repo and share the docs page. It helps more developers find a free OpenAI-compatible API without a billing setup.

---

## Support The Project

FreeTheAi is built and maintained by [Vibhek Soni](https://github.com/vibheksoni). The free tier always stays free. If this project saves you a subscription, replaces a paid plan, or unblocks something you were stuck on, a small tip helps cover servers, proxies, and the long nights spent keeping models alive.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20FreeTheAi-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/vibheksoni)

- One-time tip on Buy Me a Coffee: [`buymeacoffee.com/vibheksoni`](https://buymeacoffee.com/vibheksoni)
- Star the repo: [`github.com/Free-The-Ai/free-ai`](https://github.com/Free-The-Ai/free-ai)
- Share the docs and the [setup guides](https://freetheai.xyz/setup) with anyone you know who needs a free OpenAI-compatible key

Thanks for keeping the free tier alive.

---

## Models

Browse the full searchable catalog at [freetheai.xyz/models](https://freetheai.xyz/models). Request examples and endpoint details are on [freetheai.xyz/docs](https://freetheai.xyz/docs).

Live health currently reports 64 public catalog models across 12 provider prefixes. The bundled site fallback snapshot at [`site/public/models.json`](site/public/models.json) is refreshed from the same live `/v1/models/full` catalog used by the models page.

| Prefix | What it is |
| :--- | :--- |
| `bbl/*` | General chat models |
| `eve/*` | Image generation models |
| `ever/*` | Chat, image generation, and image edit models |
| `exa/*` | Role-gated web search models |
| `glm/*` | Long-context chat models |
| `kai/*` | Aggregated free chat and coding models |
| `mim/*` | Chat and voice models |
| `min/*` | Chat models |
| `olm/*` | DeepSeek and coding-oriented models |
| `opc/*` | Free chat/coding models |
| `pplx/*` | Role-gated web search |
| `xai/*` | Role-gated voice models |

> [!NOTE]
> Use exact alias IDs from `GET /v1/models`. Model availability updates automatically as the service catalog changes.

---

## Rate Limits

| Tier | RPM | Concurrency |
| :---: | :---: | :---: |
| 1 | 10 | 1 |
| 2 | 15 | 1 |
| 3 | 20 | 2 |
| 4 | 28 | 2 |
| 5 | 35 | 3 |

Tiers unlock through Discord invite progress. Per-user daily success cap defaults to `250/day` (resets at UTC midnight) with role-based bumps for trusted members.

---

## Privacy

FreeTheAi does **not** store prompt text, completion text, uploaded media, or conversation history as operational logs.

<table>
<tr>
<td width="50%">

**Tracked**
- IP address and network/security signals
- API key prefix and account/user identifiers
- Discord eligibility, role, and check-in state
- Model alias used
- Route, timestamp, latency, and token/request-unit counts
- Request timestamp
- Status code
- Error IDs and rate-limit/concurrency signals

</td>
<td width="50%">

**Not tracked**
- Prompt content
- Completion content
- Uploaded media as message logs
- Conversation history

</td>
</tr>
</table>

See the public [Privacy Policy](https://freetheai.xyz/privacy) and [Terms of Use](https://freetheai.xyz/terms) for the plain-English disclosure. Metadata is logged to validate access, debug failures, secure the service, enforce limits, and prevent abuse.

---

## Discord Commands

<table>
<tr>
<td width="50%">

| Command | Description |
| :--- | :--- |
| `/signup` | Get your API key after the modal |
| `/checkin` | Daily key activation challenge |
| `/resetkey` | Rotate to a fresh key after a reason + challenge |
| `/models` | Browse models |
| `/stats` | Your usage stats |
| `/generate` | Generate an image |

</td>
<td width="50%">

| Command | Description |
| :--- | :--- |
| `/tiers` | View rate limit tiers |
| `/tiermodels` | Models grouped by provider prefix |
| `/leaderboard` | Top users |
| `/modelleaderboard` | Top models |
| `/modelstats` | Stats for a model |

</td>
</tr>
</table>

---

## Team

Built by a small crew sharing free AI tools with everyone. Open source on GitHub.

| | Member | Role | GitHub |
| :---: | :--- | :--- | :--- |
| <img src="https://avatars.githubusercontent.com/u/102437829?v=4" width="48" height="48" alt="Vibhek Soni" style="border-radius:50%" /> | **Vibhek Soni** | Founder. Wrote the full API and most of the platform. | [@vibheksoni](https://github.com/vibheksoni) |
| <img src="https://avatars.githubusercontent.com/u/166897058?v=4" width="48" height="48" alt="Dr. Vova" style="border-radius:50%" /> | **Dr. Vova** | Frontend and the upcoming GoonPia roleplay site. | [@drvova](https://github.com/drvova) |
| <img src="https://avatars.githubusercontent.com/u/33468668?v=4" width="48" height="48" alt="Dysekt" style="border-radius:50%" /> | **Dysekt** | Discord ops and community. | [@DysektAI](https://github.com/DysektAI) |
| <img src="https://avatars.githubusercontent.com/u/157276603?v=4" width="48" height="48" alt="Sai Revanth" style="border-radius:50%" /> | **Sai Revanth** | Discord manager. Day-to-day moderation and onboarding. | [@svsairevanth](https://github.com/svsairevanth) |

GitHub org: [Free-The-Ai](https://github.com/Free-The-Ai). Full team page: [freetheai.xyz/team](https://freetheai.xyz/team).

---

<div align="center">

## Community

<a href="https://discord.gg/secrets">
  <img src="https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Join Discord" />
</a>
<a href="https://github.com/Free-The-Ai">
  <img src="https://img.shields.io/badge/GitHub-Free--The--Ai-181717?style=flat-square&logo=github&logoColor=white" alt="Free-The-Ai org" />
</a>
<a href="https://buymeacoffee.com/vibheksoni">
  <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20FreeTheAi-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" />
</a>

<br>

[Website](https://freetheai.xyz) | [Quickstart](https://freetheai.xyz/quickstart) | [Docs](https://freetheai.xyz/docs) | [Model Catalog](https://freetheai.xyz/models) | [Pricing](https://freetheai.xyz/pricing) | [Status](https://freetheai.xyz/status) | [Team](https://freetheai.xyz/team) | [Discord](https://discord.gg/secrets) | [Backup Invite](https://discord.gg/rG3SYpeqYF) | [Support](https://buymeacoffee.com/vibheksoni)

<br>

<sub>Free tier stays free. Optional paid slots are available for higher-power models.</sub>

</div>
