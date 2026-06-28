// Tool calling against FreeTheAi with the OpenAI Node SDK.
//
// Usage:
//   npm install openai
//   export FREETHEAI_API_KEY=fta_...
//   node js/openai-tool-calling.mjs

import OpenAI from "openai";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const client = new OpenAI({
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const tools = [
    {
        type: "function",
        function: {
            name: "get_weather",
            description: "Return a short weather summary for a city.",
            parameters: {
                type: "object",
                properties: {
                    city: { type: "string" },
                    units: { type: "string", enum: ["metric", "imperial"] },
                },
                required: ["city"],
            },
        },
    },
];

function getWeather({ city, units = "metric" }) {
    return units === "imperial" ? `${city}: 72F and clear.` : `${city}: 22C and clear.`;
}

const messages = [{ role: "user", content: "What is the weather in Boston in metric?" }];

const first = await client.chat.completions.create({
    model: "glm/glm-5.1",
    messages,
    tools,
    tool_choice: "auto",
    max_tokens: 256,
});

const choice = first.choices[0].message;
if (!choice.tool_calls?.length) {
    console.log(choice.content);
    process.exit(0);
}

messages.push(choice);
for (const call of choice.tool_calls) {
    if (call.function.name === "get_weather") {
        const args = JSON.parse(call.function.arguments || "{}");
        messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: getWeather(args),
        });
    }
}

const final = await client.chat.completions.create({
    model: "glm/glm-5.1",
    messages,
    max_tokens: 256,
});

console.log(final.choices[0].message.content);
