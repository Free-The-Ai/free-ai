// Anthropic Node SDK against FreeTheAi /v1/messages.
//
// Usage:
//   npm install @anthropic-ai/sdk
//   export FREETHEAI_API_KEY=fta_...
//   node js/anthropic-messages.mjs

import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const client = new Anthropic({
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const response = await client.messages.create({
    model: "glm/glm-5.1",
    max_tokens: 128,
    messages: [{ role: "user", content: "Reply with exactly: OK" }],
});

const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
console.log(text);
