// JS speech-to-text against FreeTheAi.
// Voice aliases (e.g. xai/grok-stt) are role-gated behind the seems_legit
// Discord role.
//
// Usage:
//   npm install openai
//   export FREETHEAI_API_KEY=fta_...
//   node js/audio-stt.mjs path/to/clip.wav

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import OpenAI from "openai";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const [, , audioPath] = process.argv;
if (!audioPath) {
    throw new Error("Usage: node js/audio-stt.mjs <audio-path>");
}
await stat(audioPath);

const client = new OpenAI({
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const transcript = await client.audio.transcriptions.create({
    model: "xai/grok-stt",
    file: createReadStream(audioPath),
    language: "en",
    response_format: "json",
});

console.log(transcript.text);
