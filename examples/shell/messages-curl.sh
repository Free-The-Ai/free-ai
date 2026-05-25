#!/usr/bin/env bash
# Anthropic-compatible Messages route with curl.
#
# Usage:
#   export FREETHEAI_API_KEY=fta_...
#   bash shell/messages-curl.sh

set -euo pipefail

if [[ -z "${FREETHEAI_API_KEY:-}" ]]; then
    echo "Set FREETHEAI_API_KEY before running this example." >&2
    exit 1
fi

curl -sS https://api.freetheai.xyz/v1/messages \
    -H "Authorization: Bearer ${FREETHEAI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "rev/claude-sonnet-4.5",
        "max_tokens": 128,
        "messages": [
            { "role": "user", "content": "Reply with exactly: OK" }
        ]
    }'
echo
