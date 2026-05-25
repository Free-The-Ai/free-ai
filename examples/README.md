# FreeTheAi examples

Drop-in code samples for the most common packages and clients. Every example
loads the API key from the `FREETHEAI_API_KEY` environment variable, points at
`https://api.freetheai.xyz/v1`, and uses real model aliases from the live
catalog at [`https://freetheai.xyz/models`](https://freetheai.xyz/models).

Get a key first by running `/signup` in the [FreeTheAi Discord](https://discord.gg/secrets),
then unlock it for the day with `/checkin`.

```bash
export FREETHEAI_API_KEY=fta_...
```

## Python (`examples/python`)

| File | What it shows |
| :--- | :--- |
| [`openai_chat.py`](python/openai_chat.py) | One-shot chat with the OpenAI SDK |
| [`openai_streaming.py`](python/openai_streaming.py) | Streaming completions to stdout |
| [`openai_tool_calling.py`](python/openai_tool_calling.py) | Function/tool calling end-to-end |
| [`openai_vision.py`](python/openai_vision.py) | Image-input vision call from a local file |
| [`anthropic_messages.py`](python/anthropic_messages.py) | Anthropic SDK against `/v1/messages` |
| [`litellm_basic.py`](python/litellm_basic.py) | LiteLLM with `openai/<alias>` routing |
| [`langchain_chat.py`](python/langchain_chat.py) | LangChain `ChatOpenAI` integration |
| [`llamaindex_chat.py`](python/llamaindex_chat.py) | LlamaIndex `OpenAILike` LLM |
| [`audio_tts.py`](python/audio_tts.py) | Text-to-speech with `/v1/audio/speech` |
| [`audio_stt.py`](python/audio_stt.py) | Speech-to-text with `/v1/audio/transcriptions` |
| [`image_client.py`](image_client.py) | Standalone image generation/edit CLI |

## JavaScript / TypeScript (`examples/js`)

| File | What it shows |
| :--- | :--- |
| [`openai-chat.mjs`](js/openai-chat.mjs) | One-shot chat with the OpenAI Node SDK |
| [`openai-streaming.mjs`](js/openai-streaming.mjs) | Streaming chat completions |
| [`openai-tool-calling.mjs`](js/openai-tool-calling.mjs) | Tool-calling round trip |
| [`anthropic-messages.mjs`](js/anthropic-messages.mjs) | Anthropic Node SDK against `/v1/messages` |
| [`vercel-ai-sdk.mjs`](js/vercel-ai-sdk.mjs) | Vercel AI SDK with the OpenAI-compatible adapter |
| [`langchain-chat.mjs`](js/langchain-chat.mjs) | LangChain.js `ChatOpenAI` integration |
| [`openai-images.mjs`](js/openai-images.mjs) | Image generation, saved to disk |
| [`audio-tts.mjs`](js/audio-tts.mjs) | Text-to-speech, saved to a `.wav` file |
| [`audio-stt.mjs`](js/audio-stt.mjs) | Speech-to-text from a local audio file |

## Shell / curl (`examples/shell`)

| File | What it shows |
| :--- | :--- |
| [`chat-curl.sh`](shell/chat-curl.sh) | Chat completions, plain JSON response |
| [`chat-stream-curl.sh`](shell/chat-stream-curl.sh) | Chat completions with SSE streaming |
| [`messages-curl.sh`](shell/messages-curl.sh) | Anthropic Messages route |
| [`responses-curl.sh`](shell/responses-curl.sh) | OpenAI Responses-style route |
| [`images-curl.sh`](shell/images-curl.sh) | Image generation, JSON output |
| [`audio-tts-curl.sh`](shell/audio-tts-curl.sh) | Text-to-speech, writes audio bytes |
| [`audio-stt-curl.sh`](shell/audio-stt-curl.sh) | Speech-to-text via multipart upload |

## Notes

- Audio routes (`/v1/audio/speech`, `/v1/audio/transcriptions`) and the model prefixes that back them (`xai/`, `mim/*tts*`) are role-gated. Earn the `seems_legit` Discord role by being active in the server. Check `requires_seems_legit` on `/v1/models/full` to see which aliases need it.
- For the latest setup guides for full apps (Cline, Cursor, Zed, OpenCode, SillyTavern, etc.), see [`https://freetheai.xyz/setup`](https://freetheai.xyz/setup).
- Free tier stays free. If FreeTheAi saves you a subscription, you can [buy Vibhek a coffee](https://buymeacoffee.com/vibheksoni) to keep it running.
