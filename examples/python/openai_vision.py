#!/usr/bin/env python3
"""Vision call against a FreeTheAi multimodal alias.

Usage:
    pip install openai
    export FREETHEAI_API_KEY=fta_...
    python python/openai_vision.py path/to/image.png
"""
from __future__ import annotations

import base64
import mimetypes
import os
import sys
from pathlib import Path

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


def load_data_url(path: Path) -> str:
    """
    var: data_url
    type: str
    desc: Read an image and return a base64 data URL the API accepts.
    """
    mime = mimetypes.guess_type(path.name)[0] or "image/png"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def main() -> None:
    """
    var: response
    type: None
    desc: Send an image plus a question and print the assistant reply.
    """
    if len(sys.argv) < 2:
        print("Usage: python openai_vision.py <image-path>")
        sys.exit(1)

    image = Path(sys.argv[1])
    if not image.exists():
        print(f"File not found: {image}")
        sys.exit(1)

    client = get_client()
    response = client.chat.completions.create(
        model="bbg/zai-org/GLM-5.1",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe this image in one sentence."},
                    {"type": "image_url", "image_url": {"url": load_data_url(image)}},
                ],
            }
        ],
        max_tokens=128,
    )
    print(response.choices[0].message.content)


if __name__ == "__main__":
    main()
