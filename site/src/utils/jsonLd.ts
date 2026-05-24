export function buildWebsiteJsonLd() {
	/**
	 * var websiteJsonLd
	 * type object
	 * desc Structured data for the public marketing site and model catalog.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': 'https://freetheai.xyz/#website',
		name: 'FreeTheAi',
		alternateName: ['Free The AI', 'FreeTheAI', 'FreeTheAi.xyz'],
		url: 'https://freetheai.xyz',
		description:
			'Free OpenAI-compatible API with 50+ active models. Chat completions, streaming, tool calling, image generation, and image editing - all behind a single free key from Discord.',
		inLanguage: 'en-US',
		publisher: {
			'@id': 'https://freetheai.xyz/#organization',
		},
		hasPart: [
			{
				'@type': 'WebPage',
				name: 'FreeTheAi API Docs',
				url: 'https://freetheai.xyz/docs',
			},
			{
				'@type': 'CollectionPage',
				name: 'FreeTheAi Model Catalog',
				url: 'https://freetheai.xyz/models',
			},
			{
				'@type': 'WebPage',
				name: 'FreeTheAi Pricing',
				url: 'https://freetheai.xyz/pricing',
			},
			{
				'@type': 'WebPage',
				name: 'FreeTheAi Status',
				url: 'https://freetheai.xyz/status',
			},
		],
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://freetheai.xyz/models?q={search_term_string}',
			},
			'query-input': 'required name=search_term_string',
		},
	};
}

export function buildOrganizationJsonLd() {
	/**
	 * var organizationJsonLd
	 * type object
	 * desc Structured data for the community and public project links.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': 'https://freetheai.xyz/#organization',
		name: 'FreeTheAi',
		alternateName: ['Free The AI', 'FreeTheAI', 'FreeTheAi.xyz'],
		legalName: 'FreeTheAi',
		url: 'https://freetheai.xyz',
		logo: 'https://freetheai.xyz/freetheai-transparent-logo-responsive-same-colors.png',
		description:
			'Community-run free AI API project with 50+ active models, Discord signup, optional paid slots for higher-power models, and a public searchable model catalog.',
		sameAs: [
			'https://discord.gg/secrets',
			'https://github.com/vibheksoni/free-ai',
			'https://github.com/Free-The-Ai',
			'https://api.freetheai.xyz',
		],
	};
}

export function buildSoftwareJsonLd() {
	/**
	 * var softwareJsonLd
	 * type object
	 * desc Structured data for the free developer API product.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		'@id': 'https://freetheai.xyz/#software',
		name: 'FreeTheAi API',
		applicationCategory: 'DeveloperApplication',
		applicationSubCategory: 'AI API Gateway',
		operatingSystem: 'Web',
		description:
			'Free OpenAI-compatible AI API with 50+ active models, Discord key signup, streaming chat completions, tool calling, image generation, image editing, and a live searchable model catalog.',
		url: 'https://freetheai.xyz',
		downloadUrl: 'https://github.com/vibheksoni/free-ai',
		isAccessibleForFree: true,
		audience: {
			'@type': 'Audience',
			audienceType: 'Developers, builders, students, and agent framework users',
		},
		featureList: [
			'Free Discord API key signup',
			'OpenAI-compatible chat completions',
			'Streaming responses',
			'Tool calling and structured outputs',
			'Anthropic-style messages endpoint',
			'Image generation via gpt-image-2',
			'Image editing with prompt and base64 input',
			'Live searchable model catalog with 50+ active models',
			'No billing or credit card required',
			'No daily usage limits',
		],
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock',
			url: 'https://freetheai.xyz/docs',
		},
	};
}

export function buildWebApiJsonLd() {
	/**
	 * var webApiJsonLd
	 * type object
	 * desc Structured data for the API as a WebAPI entity for rich API results.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'WebAPI',
		'@id': 'https://api.freetheai.xyz/v1#webapi',
		name: 'FreeTheAi API',
		url: 'https://api.freetheai.xyz/v1',
		description:
			'Free OpenAI-compatible REST API with chat completions, streaming, tool calling, image generation, image editing, and 50+ active models.',
		documentation: 'https://freetheai.xyz',
		termsOfService: 'https://freetheai.xyz/docs',
		isAccessibleForFree: true,
		provider: {
			'@id': 'https://freetheai.xyz/#organization',
		},
	};
}

export function buildMachineReadableResourcesJsonLd(
	options: {
		modelCount?: number;
		modelGeneratedAt?: string;
		paidModelCount?: number;
		paidUpdatedAt?: string;
	} = {},
) {
	/**
	 * var machineReadableResourcesJsonLd
	 * type object
	 * desc Structured data for answer engines and crawlers that prefer canonical resource files.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'DataCatalog',
		'@id': 'https://freetheai.xyz/#machine-readable-resources',
		name: 'FreeTheAi machine-readable resources',
		url: 'https://freetheai.xyz/ai.txt',
		description:
			'Canonical machine-readable files for FreeTheAi answer engines: LLM guide, AI crawler guide, public model catalog, paid plan catalog, sitemap, and API health.',
		inLanguage: 'en-US',
		creator: {
			'@id': 'https://freetheai.xyz/#organization',
		},
		dataset: [
			{
				'@type': 'Dataset',
				'@id': 'https://freetheai.xyz/models.json#dataset',
				name: 'FreeTheAi public model catalog',
				description: 'JSON snapshot of active public FreeTheAi model aliases.',
				url: 'https://freetheai.xyz/models.json',
				encodingFormat: 'application/json',
				isAccessibleForFree: true,
				dateModified: options.modelGeneratedAt,
				measurementTechnique: 'Public API catalog snapshot',
				variableMeasured: ['model id', 'prefix', 'availability', 'visibility'],
				size: options.modelCount ? `${options.modelCount} models` : undefined,
			},
			{
				'@type': 'Dataset',
				'@id': 'https://freetheai.xyz/paid-plan.json#dataset',
				name: 'FreeTheAi paid plan catalog',
				description: 'JSON snapshot of optional paid launch plan aliases and request-unit costs.',
				url: 'https://freetheai.xyz/paid-plan.json',
				encodingFormat: 'application/json',
				isAccessibleForFree: true,
				dateModified: options.paidUpdatedAt,
				measurementTechnique: 'Paid API pricing snapshot',
				variableMeasured: ['model id', 'route', 'unit cost', 'unit label'],
				size: options.paidModelCount ? `${options.paidModelCount} models` : undefined,
			},
			{
				'@type': 'Dataset',
				'@id': 'https://freetheai.xyz/llms.txt#dataset',
				name: 'FreeTheAi LLM guide',
				description: 'Plain-text overview for AI assistants and answer engines.',
				url: 'https://freetheai.xyz/llms.txt',
				encodingFormat: 'text/plain',
				isAccessibleForFree: true,
			},
			{
				'@type': 'Dataset',
				'@id': 'https://freetheai.xyz/ai.txt#dataset',
				name: 'FreeTheAi AI search guide',
				description: 'Plain-text crawler policy, canonical resource list, and preferred summary.',
				url: 'https://freetheai.xyz/ai.txt',
				encodingFormat: 'text/plain',
				isAccessibleForFree: true,
			},
		],
	};
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
	/**
	 * var breadcrumbJsonLd
	 * type object
	 * desc Breadcrumb structured data for page hierarchy and cleaner search snippets.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

export function buildSignupHowToJsonLd() {
	/**
	 * var signupHowToJsonLd
	 * type object
	 * desc Structured data for the current Discord signup and check-in flow.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name: 'How to get and activate a FreeTheAi API key',
		description:
			'Join Discord, complete the /signup modal, then run /checkin with your key and the human challenge before using the free API.',
		totalTime: 'PT2M',
		supply: [
			{
				'@type': 'HowToSupply',
				name: 'Discord account',
			},
		],
		tool: [
			{
				'@type': 'HowToTool',
				name: 'FreeTheAi Discord bot',
			},
		],
		step: [
			{
				'@type': 'HowToStep',
				name: 'Join Discord',
				text: 'Open discord.gg/secrets and join the FreeTheAi Discord server.',
				url: 'https://freetheai.xyz/docs#auth',
			},
			{
				'@type': 'HowToStep',
				name: 'Run /signup',
				text: 'Run /signup and complete the modal with your use case, bot-disclosure answer, and randomized human challenge.',
				url: 'https://freetheai.xyz/docs#auth',
			},
			{
				'@type': 'HowToStep',
				name: 'Run /checkin',
				text: 'Run /checkin each UTC day, enter your existing API key, and solve the randomized challenge before making API requests.',
				url: 'https://freetheai.xyz/docs#auth',
			},
			{
				'@type': 'HowToStep',
				name: 'Use the API',
				text: 'Set your API key as a bearer token and send requests to https://api.freetheai.xyz/v1.',
				url: 'https://freetheai.xyz/docs#chat',
			},
		],
	};
}

export function buildModelCatalogJsonLd(models: string[]) {
	/**
	 * var modelCatalogJsonLd
	 * type object
	 * desc Structured data for the server-rendered public model catalog snapshot.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'FreeTheAi AI Model Catalog',
		url: 'https://freetheai.xyz/models',
		description:
			'Searchable FreeTheAi model catalog with active OpenAI-compatible chat, image, and tool-capable model aliases.',
		isPartOf: {
			'@id': 'https://freetheai.xyz/#website',
		},
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: models.length,
			itemListElement: models.slice(0, 50).map((model, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: model,
				url: `https://freetheai.xyz/models?q=${encodeURIComponent(model)}`,
			})),
		},
	};
}

export function buildPaidPlanJsonLd(plan: { price: string; period: string; summary: string }) {
	/**
	 * var paidPlanJsonLd
	 * type object
	 * desc Structured data for the optional paid API launch plan.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: 'FreeTheAi Paid API',
		url: 'https://freetheai.xyz/pricing',
		description: plan.summary,
		provider: {
			'@id': 'https://freetheai.xyz/#organization',
		},
		offers: {
			'@type': 'Offer',
			price: plan.price.replace(/[^0-9.]/g, ''),
			priceCurrency: 'USD',
			availability: 'https://schema.org/LimitedAvailability',
			category: `${plan.period} subscription`,
			url: 'https://freetheai.xyz/pricing',
		},
	};
}
