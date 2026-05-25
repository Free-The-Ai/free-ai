#!/usr/bin/env bash
# OpenAI Responses-style route with curl.
#
# Usage:
#   export FREETHEAI_API_KEY=fta_...
#   bash shell/responses-curl.sh

set -euo pipefail

if [[ -z "${FREETHEAI_API_KEY:-}" ]]; then
    echo "Set FREETHEAI_API_KEY before running this example." >&2
    exit 1
fi

curl -sS https://api.freetheai.xyz/v1/responses \
    -H "Authorization: Bearer ${FREETHEAI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "bbg/zai-org/GLM-5.1",
        "input": "Reply with exactly: OK",
        "max_output_tokens": 64
    }'
echo
