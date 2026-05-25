#!/usr/bin/env python3
"""Plain OpenAI SDK chat completion against FreeTheAi.

Usage:
    pip install openai
    export FREETHEAI_API_KEY=fta_...
    python python/openai_chat.py
"""
from __future__ import annotations

import os
from openai import OpenAI


def get_client() -> OpenAI:
    """
    var: client
    type: OpenAI
    desc: OpenAI SDK client pointed at the FreeTheAi gateway.
    """
    key = os.environ.get("FREETHEAI_API_KEY")
    if not key:
        raise RuntimeError("Set FREETHEAI_API_KEY before running this example.")
    return OpenAI(api_key=key, base_url="https://api.freetheai.xyz/v1")


def main() -> None:
    """
    var: result
    type: None
    desc: Send one chat completion and print the assistant reply.
    """
    client = get_client()
    response = client.chat.completions.create(
        model="bbg/zai-org/GLM-5.1",
        messages=[
            {"role": "system", "content": "You are a concise developer assistant."},
            {"role": "user", "content": "Reply with exactly: OK"},
        ],
        max_tokens=64,
    )
    print(response.choices[0].message.content)


if __name__ == "__main__":
    main()
