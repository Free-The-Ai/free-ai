// OpenAI Node.js SDK against FreeTheAi.
//
// Usage:
//   npm install openai
//   export FREETHEAI_API_KEY=fta_...
//   node js/openai-chat.mjs

import OpenAI from "openai";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const client = new OpenAI({
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const response = await client.chat.completions.create({
    model: "bbg/zai-org/GLM-5.1",
    messages: [
        { role: "system", content: "You are concise." },
        { role: "user", content: "Reply with exactly: OK" },
    ],
    max_tokens: 64,
});

console.log(response.choices[0].message.content);
