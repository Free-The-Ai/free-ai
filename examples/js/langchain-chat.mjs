// LangChain.js against FreeTheAi.
//
// Usage:
//   npm install langchain @langchain/openai @langchain/core
//   export FREETHEAI_API_KEY=fta_...
//   node js/langchain-chat.mjs

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const llm = new ChatOpenAI({
    model: "bbg/zai-org/GLM-5.1",
    apiKey,
    configuration: {
        baseURL: "https://api.freetheai.xyz/v1",
    },
    maxTokens: 128,
});

const response = await llm.invoke([
    new SystemMessage("You are concise."),
    new HumanMessage("Reply with exactly: OK"),
]);

console.log(response.content);
