#!/usr/bin/env python3
"""OpenAI tool calling against FreeTheAi.

Demonstrates a single-turn tool call: model picks a function, you run it,
then send the tool result back for the final answer.

Usage:
    pip install openai
    export FREETHEAI_API_KEY=fta_...
    python python/openai_tool_calling.py
"""
from __future__ import annotations

import json
import os
from openai import OpenAI


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Return a short weather summary for a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                    "units": {
                        "type": "string",
                        "enum": ["metric", "imperial"],
                    },
                },
                "required": ["city"],
            },
        },
    }
]


def get_weather(city: str, units: str = "metric") -> str:
    """
    var: summary
    type: str
    desc: Pretend weather lookup so the example stays self-contained.
    """
    if units == "imperial":
        return f"{city}: 72F and clear."
    return f"{city}: 22C and clear."


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
    desc: Run the tool-calling loop end to end.
    """
    client = get_client()
    messages = [
        {"role": "user", "content": "What is the weather in Boston in metric?"},
    ]

    first = client.chat.completions.create(
        model="wsf/swe-1.6",
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
        max_tokens=256,
    )
    choice = first.choices[0].message
    if not choice.tool_calls:
        print(choice.content)
        return

    messages.append(choice.model_dump())
    for call in choice.tool_calls:
        if call.function.name == "get_weather":
            args = json.loads(call.function.arguments or "{}")
            tool_output = get_weather(args.get("city", ""), args.get("units", "metric"))
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call.id,
                    "content": tool_output,
                }
            )

    final = client.chat.completions.create(
        model="wsf/swe-1.6",
        messages=messages,
        max_tokens=256,
    )
    print(final.choices[0].message.content)


if __name__ == "__main__":
    main()
