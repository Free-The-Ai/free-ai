#!/usr/bin/env python3
"""Speech-to-text against FreeTheAi /v1/audio/transcriptions.

`xai/grok-stt` accepts OpenAI-style multipart uploads. Role-gated behind the
`seems_legit` Discord role.

Usage:
    pip install openai
    export FREETHEAI_API_KEY=fta_...
    python python/audio_stt.py path/to/clip.wav
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
    var: transcript
    type: None
    desc: Transcribe an audio file and print the text.
    """
    if len(sys.argv) < 2:
        print("Usage: python audio_stt.py <audio-path>")
        sys.exit(1)

    audio_path = Path(sys.argv[1])
    if not audio_path.exists():
        print(f"File not found: {audio_path}")
        sys.exit(1)

    client = get_client()
    with audio_path.open("rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="xai/grok-stt",
            file=audio_file,
            language="en",
            response_format="json",
        )
    print(transcript.text)


if __name__ == "__main__":
    main()
