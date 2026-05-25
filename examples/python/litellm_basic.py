#!/usr/bin/env python3
"""LiteLLM against FreeTheAi.

LiteLLM treats any OpenAI-compatible endpoint as a provider. Prefix the
FreeTheAi alias with `openai/` so LiteLLM routes it through the OpenAI driver.

Usage:
    pip install litellm
    export FREETHEAI_API_KEY=fta_...
    python python/litellm_basic.py
"""
from __future__ import annotations

import os

from litellm import completion


def main() -> None:
    """
    var: response
    type: None
    desc: Run one completion through LiteLLM and print the result.
    """
    key = os.environ.get("FREETHEAI_API_KEY")
    if not key:
        raise RuntimeError("Set FREETHEAI_API_KEY before running this example.")

    response = completion(
        model="openai/bbg/zai-org/GLM-5.1",
        messages=[{"role": "user", "content": "Reply with exactly: OK"}],
        api_key=key,
        api_base="https://api.freetheai.xyz/v1",
        max_tokens=64,
    )
    print(response["choices"][0]["message"]["content"])


if __name__ == "__main__":
    main()
