#!/usr/bin/env python3
"""LangChain against FreeTheAi.

Uses the standard `ChatOpenAI` integration with a custom `base_url`.

Usage:
    pip install langchain langchain-openai
    export FREETHEAI_API_KEY=fta_...
    python python/langchain_chat.py
"""
from __future__ import annotations

import os

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI


def main() -> None:
    """
    var: result
    type: None
    desc: Run a single LangChain prompt against FreeTheAi.
    """
    key = os.environ.get("FREETHEAI_API_KEY")
    if not key:
        raise RuntimeError("Set FREETHEAI_API_KEY before running this example.")

    llm = ChatOpenAI(
        model="bbg/zai-org/GLM-5.1",
        api_key=key,
        base_url="https://api.freetheai.xyz/v1",
        max_tokens=128,
    )
    response = llm.invoke([
        SystemMessage(content="You are concise."),
        HumanMessage(content="Reply with exactly: OK"),
    ])
    print(response.content)


if __name__ == "__main__":
    main()
