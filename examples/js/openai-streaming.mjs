// Streaming chat completion with the OpenAI Node SDK against FreeTheAi.
//
// Usage:
//   npm install openai
//   export FREETHEAI_API_KEY=fta_...
//   node js/openai-streaming.mjs

import OpenAI from "openai";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const client = new OpenAI({
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const stream = await client.chat.completions.create({
    model: "bbl/gpt-5.4-mini",
    messages: [{ role: "user", content: "Stream a haiku about pair programming." }],
    stream: true,
    max_tokens: 128,
});

for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content ?? "";
    if (delta) process.stdout.write(delta);
}
process.stdout.write("\n");
