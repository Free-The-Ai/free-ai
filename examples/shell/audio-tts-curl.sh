#!/usr/bin/env bash
# Text-to-speech against FreeTheAi with curl.
# xai/grok-tts is role-gated behind the seems_legit Discord role.
#
# Usage:
#   export FREETHEAI_API_KEY=fta_...
#   bash shell/audio-tts-curl.sh "hello from freetheai" out.wav

set -euo pipefail

if [[ -z "${FREETHEAI_API_KEY:-}" ]]; then
    echo "Set FREETHEAI_API_KEY before running this example." >&2
    exit 1
fi

TEXT="${1:-hello from freetheai}"
OUT="${2:-out.wav}"

curl -sS https://api.freetheai.xyz/v1/audio/speech \
    -H "Authorization: Bearer ${FREETHEAI_API_KEY}" \
    -H "Content-Type: application/json" \
    --output "$OUT" \
    -d "$(jq -n --arg text "$TEXT" '{
        model: "xai/grok-tts",
        voice: "default",
        input: $text,
        response_format: "wav"
    }')"
echo "Wrote ${OUT}"
