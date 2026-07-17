import { error } from "@sveltejs/kit";
import { SETUP_GUIDES } from "@/entities/setup-guide";
import type { EntryGenerator, PageLoad } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => SETUP_GUIDES.map((guide) => ({ slug: guide.slug }));

export const load: PageLoad = ({ params }) => {
    const guide = SETUP_GUIDES.find((item) => item.slug === params.slug);
    if (!guide) throw error(404, "Setup guide not found");
    return { guide };
};
