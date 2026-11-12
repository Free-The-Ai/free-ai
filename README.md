<p align="center">
  <a href="https://freetheai.org"><img src=".github/banner.jpg" alt="FreeTheAI: one OpenAI-compatible API for models from many providers, paid per token" width="100%"></a>
</p>

<p align="center">
  <a href="https://freetheai.org"><img src="https://img.shields.io/badge/website-freetheai.org-111111" alt="Website"></a>
  <a href="https://freetheai.org/docs"><img src="https://img.shields.io/badge/API-OpenAI--compatible-111111" alt="OpenAI-compatible"></a>
  <a href="https://freetheai.org/models"><img src="https://img.shields.io/badge/models-many_providers-111111" alt="Models from many providers"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111" alt="MIT license"></a>
  <a href="https://discord.gg/secrets"><img src="https://img.shields.io/badge/Discord-join-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <b><a href="https://freetheai.org/docs">Docs</a></b> ·
  <a href="https://freetheai.org/setup">Setup guides</a> ·
  <a href="https://freetheai.org/models">Models</a> ·
  <a href="https://freetheai.org/providers">Providers</a> ·
  <a href="https://freetheai.org/status">Status</a> ·
  <a href="https://discord.gg/secrets">Discord</a>
</p>

# FreeTheAI

FreeTheAI is an AI model marketplace with one OpenAI-compatible API. One account and one API key reach models from many providers, including GPT, Claude, Gemini, Grok, GLM, Kimi, and MiniMax, paid per token from one wallet at each provider's listed price. Streaming, tool calling, and web search with sourced answers work across them. Also searched as *Free The AI*, *Free The Ai*, and *FreeTheAi*.

> [!NOTE]
> The free tier closed for most accounts on November 10, 2026. Read [why it closed](https://freetheai.org/blog/free-tier-closing). Requests are now paid from your wallet.

> [!IMPORTANT]
> FreeTheAI moved to [freetheai.org](https://freetheai.org). The old API at `api.freetheai.xyz`, its keys, and the old Discord `/signup` and `/checkin` commands no longer work. Use the base URL `https://api.freetheai.org/v1` with a key from freetheai.org. Old `freetheai.xyz` links forward to their new pages.

## Quick start

1. Create an account at [freetheai.org](https://freetheai.org), confirm your email, and make a key under [API keys](https://freetheai.org/dashboard/api-keys).
2. Add funds to your wallet (from $5, crypto or card). Each request bills the tokens it used at the listed price; there is no subscription.
3. Follow a provider on its page at [freetheai.org/providers](https://freetheai.org/providers). A key uses the providers its account follows.
4. Point your app at the base URL.

```
Base URL    https://api.freetheai.org/v1
Auth        Authorization: Bearer YOUR_API_KEY
Model IDs   the model name, for example glm-5.3; <provider>/<model> picks one provider
```

```bash
curl https://api.freetheai.org/v1/chat/completions \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "glm-5.3", "messages": [{"role": "user", "content": "Hello!"}]}'
```

```python
from openai import OpenAI

client = OpenAI(base_url="https://api.freetheai.org/v1", api_key="YOUR_API_KEY")
reply = client.chat.completions.create(
    model="glm-5.3",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(reply.choices[0].message.content)
```

Chat Completions, Responses, and Anthropic Messages are supported, with streaming and tool calls. Claude Code and the Anthropic SDK use the base URL `https://api.freetheai.org`. List the models your key can use with `GET /v1/models`. Every error carries an error ID (in the body and the `X-Error-ID` header); quote it when you ask for help.

## SDKs and examples

| Language | Package | Repository |
| :--- | :--- | :--- |
| Python | `pip install freetheai` | [freetheai-python](https://github.com/Free-The-Ai/freetheai-python) |
| JavaScript and TypeScript | `npm install freetheai` | [freetheai-js](https://github.com/Free-The-Ai/freetheai-js) |
| Go | `go get github.com/Free-The-Ai/freetheai-go` | [freetheai-go](https://github.com/Free-The-Ai/freetheai-go) |
| Recipes for all of the above | | [freetheai-cookbook](https://github.com/Free-The-Ai/freetheai-cookbook) |

Code you can copy is in [`examples/`](examples/README.md).

## Pricing

- Add funds to one FreeTheAI wallet, from $5, with crypto or a card.
- Each request bills the tokens it used at the provider's listed price. Prices for every provider are on the [models page](https://freetheai.org/models).
- No subscription, and no daily limit to wait out.

## Models

The live list, with prices, context sizes, and every provider that serves each model, is at [freetheai.org/models](https://freetheai.org/models). A model ID is the model name, for example `glm-5.3`, and by default the request goes to the cheapest provider you follow. Write `<provider>/<model>` to pick one provider.

## Apps and setup guides

Anything that speaks the OpenAI API works with FreeTheAI, including SillyTavern, JanitorAI, Open WebUI, Cline, LibreChat, and more. Step-by-step guides for each app are at [freetheai.org/setup](https://freetheai.org/setup).

## Privacy

Read the [Terms](https://freetheai.org/terms) and the [Privacy Policy](https://freetheai.org/privacy) for what is collected and who is responsible for it.

## For AI agents

[`SKILL.md`](SKILL.md) teaches coding agents how to set up FreeTheAI in a user's tools without inventing keys, endpoints, or model IDs.

## This repository

- [`examples/`](examples/README.md) holds copy-paste code for common SDKs.
- [`site/`](site/) is the small Astro site that forwards the old `freetheai.xyz` links to [freetheai.org](https://freetheai.org). It deploys to GitHub Pages on every push to `master`.

## Support and credits

FreeTheAI is built by [Vibhek Soni](https://vibheksoni.com) ([@vibheksoni](https://github.com/vibheksoni)). A tip on [Buy Me a Coffee](https://buymeacoffee.com/vibheksoni) helps cover the servers. Starring the repo and sharing it helps too.

- Questions and help: [Discord](https://discord.gg/secrets)
- Security issues: vibheksoni@engineer.com

## License

MIT. See [LICENSE](LICENSE).
