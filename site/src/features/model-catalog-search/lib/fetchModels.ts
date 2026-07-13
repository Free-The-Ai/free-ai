const LIVE_ENDPOINT = "https://api.freetheai.xyz/v1/models/full";
const LIVE_KEY = "freetheai.xyz";

export async function fetchModels(): Promise<{ payload: unknown; src: "live" | "snapshot" }> {
    try {
        const res = await fetch(LIVE_ENDPOINT, {
            headers: { Accept: "application/json", Authorization: `Bearer ${LIVE_KEY}` },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return { payload: await res.json(), src: "live" };
    } catch (error) {
        const res = await fetch("/models.json", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        console.warn("Falling back to bundled model catalog snapshot.", error);
        return { payload: await res.json(), src: "snapshot" };
    }
}
