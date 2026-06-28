#!/usr/bin/env bash
# Image generation against FreeTheAi with curl.
#
# Output is JSON. Use jq to pull `data[0].b64_json` or `data[0].url`.
#
# Usage:
#   export FREETHEAI_API_KEY=fta_...
#   bash shell/images-curl.sh > out.json

set -euo pipefail

if [[ -z "${FREETHEAI_API_KEY:-}" ]]; then
    echo "Set FREETHEAI_API_KEY before running this example." >&2
    exit 1
fi

PROMPT="${1:-A neon sports car under rainy city lights}"

curl -sS https://api.freetheai.xyz/v1/images/generations \
    -H "Authorization: Bearer ${FREETHEAI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg prompt "$PROMPT" '{
        model: "eve/gpt-image-2",
        prompt: $prompt
    }')"
