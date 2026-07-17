export const homeSnippet = `curl https://api.freetheai.xyz/v1/chat/completions \\
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "opc/deepseek-v4-flash-free",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`;

export const docsSnippets = {
    base: `Base URL
https://api.freetheai.xyz/v1

Header
Authorization: Bearer YOUR_API_KEY`,
    chatCurl: `curl https://api.freetheai.xyz/v1/chat/completions \\
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "opc/deepseek-v4-flash-free",
    "messages": [
      { "role": "user", "content": "Write a tiny Flask route." }
    ],
    "stream": true
  }'`,
    openAiSdk: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FREETHEAI_API_KEY,
  baseURL: "https://api.freetheai.xyz/v1"
});

const res = await client.chat.completions.create({
  model: "opc/deepseek-v4-flash-free",
  messages: [{ role: "user", content: "Reply with OK." }]
});

console.log(res.choices[0].message.content);`,
    messages: `curl https://api.freetheai.xyz/v1/messages \\
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "opc/deepseek-v4-flash-free",
    "max_tokens": 256,
    "messages": [
      { "role": "user", "content": "Give me a short implementation plan." }
    ]
  }'`,
    modelList: `curl https://api.freetheai.xyz/v1/models \\
  -H "Authorization: Bearer $FREETHEAI_API_KEY"`,
    fullModelList: `curl "https://api.freetheai.xyz/v1/models/full" \\
  -H "Authorization: Bearer freetheai.xyz"`,
} as const;

export const quickstartSnippets = {
    python: `pip install openai

import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["FREETHEAI_API_KEY"],
    base_url="https://api.freetheai.xyz/v1",
)

response = client.chat.completions.create(
    model="opc/deepseek-v4-flash-free",
    messages=[{"role": "user", "content": "Reply with OK."}],
)

print(response.choices[0].message.content)
`,
    javascript: `npm install openai

import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.FREETHEAI_API_KEY,
    baseURL: "https://api.freetheai.xyz/v1",
});

const response = await client.chat.completions.create({
    model: "opc/deepseek-v4-flash-free",
    messages: [{ role: "user", content: "Reply with OK." }],
});

console.log(response.choices[0].message.content);
`,
    curl: `curl https://api.freetheai.xyz/v1/chat/completions \\
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "opc/deepseek-v4-flash-free",
    "messages": [{"role": "user", "content": "Reply with OK."}]
  }'
`,
} as const;
