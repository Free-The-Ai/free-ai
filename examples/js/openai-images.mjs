// JS image generation against FreeTheAi.
//
// Usage:
//   npm install openai
//   export FREETHEAI_API_KEY=fta_...
//   node js/openai-images.mjs "A neon sports car under rainy city lights" out.png

import { writeFile } from "node:fs/promises";
import OpenAI from "openai";

const apiKey = process.env.FREETHEAI_API_KEY;
if (!apiKey) {
    throw new Error("Set FREETHEAI_API_KEY before running this example.");
}

const [, , prompt = "A neon sports car under rainy city lights", out = "out.png"] = process.argv;

const client = new OpenAI({
    apiKey,
    baseURL: "https://api.freetheai.xyz/v1",
});

const response = await client.images.generate({
    model: "eve/gpt-image-2",
    prompt,
});

const item = response.data[0];
if (item.b64_json) {
    await writeFile(out, Buffer.from(item.b64_json, "base64"));
    console.log(`Wrote ${out} from base64.`);
} else if (item.url) {
    const r = await fetch(item.url);
    if (!r.ok) throw new Error(`Failed to download ${item.url}`);
    await writeFile(out, Buffer.from(await r.arrayBuffer()));
    console.log(`Wrote ${out} from URL.`);
} else {
    throw new Error("No image bytes returned.");
}
