const ENDPOINT = "https://api.freetheai.xyz/v1/models/full";
const KEY = "freetheai.xyz";
const OUT = new URL("../public/models.json", import.meta.url);

const res = await fetch(ENDPOINT, {
  headers: { Accept: "application/json", Authorization: `Bearer ${KEY}` },
});
if (!res.ok) throw new Error(`sync-models: ${res.status} ${res.statusText}`);
const data = await res.json();
await import("node:fs/promises").then(({ writeFile }) =>
  writeFile(OUT, JSON.stringify(data, null, 2) + "\n"),
);
console.log(`sync-models: ${data.data?.length ?? 0} models, ${new Set(data.data?.map((m) => m.prefix)).size} providers`);
