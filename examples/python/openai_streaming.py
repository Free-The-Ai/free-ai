#!/usr/bin/env python3
"""Streaming chat completion against FreeTheAi.

Usage:
    pip install openai
    export FREETHEAI_API_KEY=fta_...
    python python/openai_streaming.py
"""
from __future__ import annotations

import os
import sys

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
    var: stream
    type: None
    desc: Stream tokens to stdout as they arrive.
    """
    client = get_client()
    with client.chat.completions.stream(
        model="bbl/gpt-5.4-mini",
        messages=[
            {"role": "user", "content": "Stream a haiku about pair programming."},
        ],
        max_tokens=128,
    ) as stream:
        for event in stream:
            if event.type == "content.delta" and event.delta:
                sys.stdout.write(event.delta)
                sys.stdout.flush()
        sys.stdout.write("\n")


if __name__ == "__main__":
    main()
