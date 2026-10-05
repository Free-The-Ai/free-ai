<div align="center">

# FreeTheAI

<img src="assets/FreeTheAi.png" alt="FreeTheAI" width="160" />

**Free OpenAI-compatible AI API: 50+ models, one account, no credit card**

<sub>Also searched as <strong>Free The AI</strong>, <strong>Free The Ai</strong>, and <strong>FreeTheAi</strong>.</sub>

<br>

[![Website](https://img.shields.io/badge/website-freetheai.org-f97316?style=flat-square)](https://freetheai.org)
[![API](https://img.shields.io/badge/OpenAI-compatible-white?style=flat-square)](https://freetheai.org/docs)
[![Models](https://img.shields.io/badge/models-50%2B-white?style=flat-square)](https://freetheai.org/models)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/secrets)

[Website](https://freetheai.org) | [Docs](https://freetheai.org/docs) | [Setup guides](https://freetheai.org/setup) | [Models](https://freetheai.org/models) | [Check-in](https://freetheai.org/checkin) | [Status](https://freetheai.org/status) | [Stats](https://freetheai.org/stats) | [Discord](https://discord.gg/secrets) | [Support](https://buymeacoffee.com/vibheksoni)

</div>

---

> [!IMPORTANT]
> **FreeTheAI moved to [freetheai.org](https://freetheai.org).** The old API at `api.freetheai.xyz`, old API keys, and the Discord `/signup` and `/checkin` commands are retired. Create an account at freetheai.org and use the new base URL `https://api.freetheai.org/v1`. Old `freetheai.xyz` links forward to their new pages.

## How it works now

1. **Create an account** at [freetheai.org/signup](https://freetheai.org/signup) with a Gmail, Outlook, Yahoo, or iCloud address, pass the quick security check, then press **Send link** and confirm your email.
2. **Make an API key** under [API keys](https://freetheai.org/dashboard/api-keys). A key can be limited to certain models or providers.
3. **Check in once a day** at [freetheai.org/checkin](https://freetheai.org/checkin). The short security game unlocks free models until 00:00 UTC.
4. **Point your app at the API** with the base URL below. Anything that speaks the OpenAI API works: SillyTavern, JanitorAI, chub.ai, RisuAI, Open WebUI, Cline, LibreChat, and more. Step-by-step guides for 24 apps are at [freetheai.org/setup](https://freetheai.org/setup).

## Free daily requests

| | |
| :--- | :--- |
| **50 requests every day** | On every FreeTheAI-hosted model. Resets at 00:00 UTC; failed requests don't count. |
| **+50 for linking Discord** | Dashboard → Settings → **Link Discord**. Linking also adds you to the FreeTheAI Discord server. |
| **Up to +150 for donating a key** | Donate a spare key from a supported provider on [Donate keys](https://freetheai.org/dashboard/donate-keys). Most keys add 50 a day, up to 150 extra in total. |

Paid plans and the model marketplace are coming soon. Free models stay free.

## Quick start

```
Base URL    https://api.freetheai.org/v1
Auth        Authorization: Bearer YOUR_API_KEY
Model IDs   fta/<tag>/<model>, for example fta/zai/glm-5.3
```

```bash
curl https://api.freetheai.org/v1/chat/completions \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "fta/zai/glm-5.3", "messages": [{"role": "user", "content": "Hello!"}]}'
```

```python
from openai import OpenAI

client = OpenAI(base_url="https://api.freetheai.org/v1", api_key="YOUR_API_KEY")
reply = client.chat.completions.create(
    model="fta/zai/glm-5.3",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(reply.choices[0].message.content)
```

Chat completions support streaming, tool calling, and the usual sampling settings. List the models your key can use with `GET /v1/models`. Errors carry an error ID (in the message, `error.error_id`, and the `X-Error-ID` header); send it to support if something keeps failing. More examples are in [`examples/`](examples/README.md), and every endpoint and error is on the [docs page](https://freetheai.org/docs).

> [!NOTE]
> Call the API directly from your app or device. Requests relayed through a Cloudflare Worker are refused.

## Models

The live list, with context sizes, is at [freetheai.org/models](https://freetheai.org/models). Model IDs start with a short tag:

| Prefix | Models |
| :--- | :--- |
| `fta/zai/*` | GLM family (glm-5.3, glm-5.2, glm-4.7, and more) |
| `fta/kimi/*` | Kimi K3 |
| `fta/bbl/*` | GPT-5.4 mini, Gemini, and Grok chat models |
| `fta/kilo/*` | DeepSeek, Qwen, Gemini, GPT, Llama, Mistral, and more |
| `fta/kai/*` | Rotating free models |
| `fta/olm/*`, `fta/olf/*` | Open-weight models such as gpt-oss, Gemma, Nemotron, and MiniMax |
| `fta/mmx/*` | MiniMax M3 |
| `fta/ocz/*` | Extra free models |

## Privacy

FreeTheAI does not store prompts or replies. To run the service and stop abuse it records request metadata (time, model, status, token counts, and the key used) and network signals such as your IP address. Read the [Terms](https://freetheai.org/terms) and [Privacy Policy](https://freetheai.org/privacy).

## For AI agents

[`SKILL.md`](SKILL.md) teaches coding agents how to set up FreeTheAI in a user's tools without inventing keys, endpoints, or model IDs.

## Support the project

FreeTheAI is built and maintained by [Vibhek Soni](https://vibheksoni.com/) ([@vibheksoni](https://github.com/vibheksoni)). The free tier stays free. If it saves you a subscription, a small tip helps cover servers and proxies.

- Tip on [Buy Me a Coffee](https://buymeacoffee.com/vibheksoni)
- Donate a spare API key on [freetheai.org](https://freetheai.org/dashboard/donate-keys) to raise your own daily limit
- Star this repo and share the docs with anyone who needs a free OpenAI-compatible API

## Team

| | Member | Role | GitHub |
| :---: | :--- | :--- | :--- |
| <img src="https://avatars.githubusercontent.com/u/102437829?v=4" width="48" height="48" alt="Vibhek Soni" /> | **Vibhek Soni** | Founder. Wrote the API and most of the platform. | [@vibheksoni](https://github.com/vibheksoni) |
| <img src="https://avatars.githubusercontent.com/u/166897058?v=4" width="48" height="48" alt="Dr. Vova" /> | **Dr. Vova** | Co-founder. Frontend and the upcoming GoonPia roleplay site. | [@drvova](https://github.com/drvova) |
| <img src="https://avatars.githubusercontent.com/u/157276603?v=4" width="48" height="48" alt="Sai Revanth" /> | **Sai Revanth** | Discord manager. Day-to-day moderation and onboarding. | [@svsairevanth](https://github.com/svsairevanth) |

## This repository

- [`site/`](site/) is the small Astro page at [freetheai.xyz](https://freetheai.xyz). It explains the move and forwards every old page (docs, models, setup guides, pricing, status, and more) to its place on freetheai.org. It deploys to GitHub Pages on every push to `master`.
- [`examples/`](examples/README.md) holds copy-paste code for common SDKs.

<div align="center">

<br>

[Website](https://freetheai.org) | [Docs](https://freetheai.org/docs) | [Discord](https://discord.gg/secrets) | [Backup invite](https://discord.gg/rG3SYpeqYF) | [GitHub](https://github.com/Free-The-Ai) | [Support](https://buymeacoffee.com/vibheksoni)

</div>
