#!/usr/bin/env python3
"""Anthropic SDK against FreeTheAi /v1/messages.

Usage:
    pip install anthropic
    export FREETHEAI_API_KEY=fta_...
    python python/anthropic_messages.py
"""
from __future__ import annotations

import os

from anthropic import Anthropic


def get_client() -> Anthropic:
    """
    var: client
    type: Anthropic
    desc: Anthropic SDK pointed at FreeTheAi /v1.
    """
    key = os.environ.get("FREETHEAI_API_KEY")
    if not key:
        raise RuntimeError("Set FREETHEAI_API_KEY before running this example.")
    return Anthropic(api_key=key, base_url="https://api.freetheai.xyz/v1")


def main() -> None:
    """
    var: result
    type: None
    desc: Send one Messages API request and print the assistant reply.
    """
    client = get_client()
    response = client.messages.create(
        model="glm/glm-5.1",
        max_tokens=128,
        messages=[
            {"role": "user", "content": "Reply with exactly: OK"},
        ],
    )
    text_blocks = [block.text for block in response.content if getattr(block, "text", None)]
    print("\n".join(text_blocks))


if __name__ == "__main__":
    main()
