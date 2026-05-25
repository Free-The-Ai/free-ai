#!/usr/bin/env python3
"""LlamaIndex against FreeTheAi.

LlamaIndex's `OpenAILike` LLM adapter treats any OpenAI-compatible endpoint
as a peer of OpenAI. Pass `api_base` and a FreeTheAi alias.

Usage:
    pip install llama-index llama-index-llms-openai-like
    export FREETHEAI_API_KEY=fta_...
    python python/llamaindex_chat.py
"""
from __future__ import annotations

import os

from llama_index.core.llms import ChatMessage
from llama_index.llms.openai_like import OpenAILike


def main() -> None:
    """
    var: response
    type: None
    desc: Run a single LlamaIndex chat call.
    """
    key = os.environ.get("FREETHEAI_API_KEY")
    if not key:
        raise RuntimeError("Set FREETHEAI_API_KEY before running this example.")

    llm = OpenAILike(
        model="bbg/zai-org/GLM-5.1",
        api_key=key,
        api_base="https://api.freetheai.xyz/v1",
        is_chat_model=True,
        is_function_calling_model=True,
        max_tokens=128,
    )
    response = llm.chat([
        ChatMessage(role="system", content="You are concise."),
        ChatMessage(role="user", content="Reply with exactly: OK"),
    ])
    print(response.message.content)


if __name__ == "__main__":
    main()
