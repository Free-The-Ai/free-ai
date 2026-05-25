#!/usr/bin/env bash
# Speech-to-text against FreeTheAi with curl.
# Voice aliases (xai/grok-stt) are role-gated behind the seems_legit Discord role.
#
# Usage:
#   export FREETHEAI_API_KEY=fta_...
#   bash shell/audio-stt-curl.sh path/to/clip.wav

set -euo pipefail

if [[ -z "${FREETHEAI_API_KEY:-}" ]]; then
    echo "Set FREETHEAI_API_KEY before running this example." >&2
    exit 1
fi

if [[ -z "${1:-}" ]]; then
    echo "Usage: bash shell/audio-stt-curl.sh <audio-path>" >&2
    exit 1
fi

AUDIO="$1"
if [[ ! -f "$AUDIO" ]]; then
    echo "File not found: $AUDIO" >&2
    exit 1
fi

curl -sS https://api.freetheai.xyz/v1/audio/transcriptions \
    -H "Authorization: Bearer ${FREETHEAI_API_KEY}" \
    -F "model=xai/grok-stt" \
    -F "language=en" \
    -F "response_format=json" \
    -F "file=@${AUDIO}"
echo
