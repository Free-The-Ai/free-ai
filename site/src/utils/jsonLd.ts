export function buildWebsiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'FreeTheAi',
		url: 'https://freetheai.xyz',
		description:
			'Free AI API with Discord key signup, live free models, OpenAI-compatible chat completions, streaming, and tool calling.',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://github.com/vibheksoni/free-ai',
			'query-input': 'required name=search_term_string',
		},
	};
}

export function buildOrganizationJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'FreeTheAi',
		url: 'https://freetheai.xyz',
		sameAs: [
			'https://discord.gg/secrets',
			'https://github.com/vibheksoni/free-ai',
			'https://api.freetheai.xyz',
		],
	};
}

export function buildSoftwareJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'FreeTheAi',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web',
		description:
			'Free AI API for builders with Discord key signup, live free models, OpenAI-compatible chat completions, streaming, and tool calling.',
		url: 'https://freetheai.xyz',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
	};
}
