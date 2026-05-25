// JS text-to-speech against FreeTheAi.
// Voice aliases (e.g. xai/grok-tts) are role-gated behind the seems_legit
// Discord role.
//
// Usage:
//   npm install openai
//   export FREETHEAI_API_KEY=fta_...
//   node js/audio-tts.mjs "hello from freetheai" out.wav

import { writeFile } from "node:fs/promises";
import OpenAI from "openai";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const [, , text = "hello from freetheai", out = "out.wav"] = process.argv;

const client = new OpenAI({
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const speech = await client.audio.speech.create({
    model: "xai/grok-tts",
    voice: "default",
    input: text,
    response_format: "wav",
});

const buffer = Buffer.from(await speech.arrayBuffer());
await writeFile(out, buffer);
console.log(`Wrote ${out} (${buffer.length} bytes).`);
