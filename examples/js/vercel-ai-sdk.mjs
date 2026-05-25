// Vercel AI SDK against FreeTheAi.
//
// Usage:
//   npm install ai @ai-sdk/openai-compatible
//   export FREETHEAI_API_KEY=fta_...
//   node js/vercel-ai-sdk.mjs

import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const freetheai = createOpenAICompatible({
    name: "freetheai",
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const { text } = await generateText({
    model: freetheai.chatModel("bbg/zai-org/GLM-5.1"),
    prompt: "Reply with exactly: OK",
    maxOutputTokens: 64,
});

console.log(text);
