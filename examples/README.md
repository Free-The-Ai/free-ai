# FreeTheAI examples

Drop-in code samples for common SDKs and clients. Every example reads the API
key from the `FREETHEAI_API_KEY` environment variable and points at
`https://api.freetheai.org/v1`.

Get a key first:

1. Create a free account at [freetheai.org/signup](https://freetheai.org/signup) and confirm your email.
2. Create a key under [API keys](https://freetheai.org/dashboard/api-keys) in your dashboard.
3. Do the daily [check-in](https://freetheai.org/checkin) to unlock free models until 00:00 UTC.

```bash
export FREETHEAI_API_KEY=your_key_here
```

Model IDs look like `fta/<tag>/<model>`. The examples use `fta/zai/glm-5.3` and
`fta/bbl/gpt-5.4-mini`; the full list is on the
[models page](https://freetheai.org/models) or from `GET /v1/models`.

## Python (`examples/python`)

| File | What it shows |
| :--- | :--- |
| [`openai_chat.py`](python/openai_chat.py) | One-shot chat with the OpenAI SDK |
| [`openai_streaming.py`](python/openai_streaming.py) | Streaming completions to stdout |
| [`openai_tool_calling.py`](python/openai_tool_calling.py) | Function and tool calling end to end |
| [`litellm_basic.py`](python/litellm_basic.py) | LiteLLM with `openai/<model id>` routing |
| [`langchain_chat.py`](python/langchain_chat.py) | LangChain `ChatOpenAI` |
| [`llamaindex_chat.py`](python/llamaindex_chat.py) | LlamaIndex `OpenAILike` |

## JavaScript (`examples/js`)

| File | What it shows |
| :--- | :--- |
| [`openai-chat.mjs`](js/openai-chat.mjs) | One-shot chat with the OpenAI SDK |
| [`openai-streaming.mjs`](js/openai-streaming.mjs) | Streaming completions |
| [`openai-tool-calling.mjs`](js/openai-tool-calling.mjs) | Function and tool calling |
| [`langchain-chat.mjs`](js/langchain-chat.mjs) | LangChain.js `ChatOpenAI` |
| [`vercel-ai-sdk.mjs`](js/vercel-ai-sdk.mjs) | Vercel AI SDK with an OpenAI-compatible provider |

## Shell (`examples/shell`)

| File | What it shows |
| :--- | :--- |
| [`chat-curl.sh`](shell/chat-curl.sh) | Chat completion with curl |
| [`chat-stream-curl.sh`](shell/chat-stream-curl.sh) | Streaming chat with curl |

Call the API directly from your app or device. Requests relayed through a
Cloudflare Worker are refused.
