#!/usr/bin/env python3
"""Text-to-speech against FreeTheAi /v1/audio/speech.

`xai/grok-tts` is role-gated behind the `seems_legit` Discord role. Pricing on
the free tier stays $0.

Usage:
    pip install openai
    export FREETHEAI_API_KEY=fta_...
    python python/audio_tts.py "hello from freetheai" out.wav
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from openai import OpenAI


def get_client() -> OpenAI:
    """
    var: client
    type: OpenAI
    desc: OpenAI SDK client pointed at FreeTheAi.
    """
    key = os.environ.get("FREETHEAI_API_KEY")
    if not key:
        raise RuntimeError("Set FREETHEAI_API_KEY before running this example.")
    return OpenAI(api_key=key, base_url="https://api.freetheai.xyz/v1")


def main() -> None:
    """
    var: result
    type: None
    desc: Synthesize speech and write the bytes to disk.
    """
    if len(sys.argv) < 3:
        print("Usage: python audio_tts.py <text> <output-path>")
        sys.exit(1)

    text = sys.argv[1]
    output = Path(sys.argv[2])
    client = get_client()

    response = client.audio.speech.create(
        model="xai/grok-tts",
        voice="default",
        input=text,
        response_format="wav",
    )
    response.write_to_file(output.as_posix())
    size = output.stat().st_size
    print(f"Wrote {output} ({size} bytes).")


if __name__ == "__main__":
    main()
