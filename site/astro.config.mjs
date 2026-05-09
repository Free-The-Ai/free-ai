import sitemap from '@astrojs/sitemap';
import solid from '@astrojs/solid-js';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://freetheai.xyz',
	output: 'static',
	integrations: [sitemap(), solid()],
	devToolbar: {
		enabled: false,
	},
});
