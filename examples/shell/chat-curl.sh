#!/usr/bin/env bash
# Chat completions against FreeTheAi with curl.
#
# Usage:
#   export FREETHEAI_API_KEY=fta_...
#   bash shell/chat-curl.sh

set -euo pipefail

if [[ -z "${FREETHEAI_API_KEY:-}" ]]; then
    echo "Set FREETHEAI_API_KEY before running this example." >&2
    exit 1
fi

curl -sS https://api.freetheai.xyz/v1/chat/completions \
    -H "Authorization: Bearer ${FREETHEAI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "bbg/zai-org/GLM-5.1",
        "messages": [
            { "role": "user", "content": "Reply with exactly: OK" }
        ],
        "max_tokens": 64
    }'
echo
