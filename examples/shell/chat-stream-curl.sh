#!/usr/bin/env bash
# Streaming chat completion via SSE.
#
# Usage:
#   export FREETHEAI_API_KEY=fta_...
#   bash shell/chat-stream-curl.sh

set -euo pipefail

if [[ -z "${FREETHEAI_API_KEY:-}" ]]; then
    echo "Set FREETHEAI_API_KEY before running this example." >&2
    exit 1
fi

curl -N -sS https://api.freetheai.xyz/v1/chat/completions \
    -H "Authorization: Bearer ${FREETHEAI_API_KEY}" \
    -H "Content-Type: application/json" \
    --data-raw '{
        "model": "bbl/gpt-5.5-mini",
        "stream": true,
        "messages": [
            { "role": "user", "content": "Stream a haiku about pair programming." }
        ],
        "max_tokens": 128
    }'
echo
