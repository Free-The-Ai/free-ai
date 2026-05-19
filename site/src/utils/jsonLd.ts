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

export function buildFaqJsonLd() {
	/**
	 * var faqJsonLd
	 * type object
	 * desc FAQ structured data for rich search result snippets.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: 'Is FreeTheAi really free?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes. The FreeTheAi free API remains free with no billing or credit card required. Optional paid slots are available for users who need separate higher-power models.',
				},
			},
			{
				'@type': 'Question',
				name: 'How many AI models does FreeTheAi have?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'FreeTheAi currently exposes 50+ active models across chat, image, and tool-capable routes. The live catalog at freetheai.xyz/models is the source of truth.',
				},
			},
			{
				'@type': 'Question',
				name: 'Is FreeTheAi compatible with the OpenAI SDK?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes. FreeTheAi is fully OpenAI-compatible. Point any OpenAI SDK at https://api.freetheai.xyz/v1 with your API key and it works.',
				},
			},
			{
				'@type': 'Question',
				name: 'How do I get an API key?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Join the FreeTheAi Discord server at discord.gg/secrets, run /signup, and complete the modal with your use case, bot-disclosure answer, and randomized human challenge.',
				},
			},
			{
				'@type': 'Question',
				name: 'Why does my key need check-in?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'FreeTheAi uses a daily /checkin modal to reduce automated abuse. Enter your existing API key and solve the randomized challenge once per UTC day before using the API.',
				},
			},
			{
				'@type': 'Question',
				name: 'How do I reset a lost FreeTheAi API key?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Run /resetkey in Discord. The reset flow asks for a real reason and a human challenge, then rotates your key while preserving your account history.',
				},
			},
			{
				'@type': 'Question',
				name: 'Does FreeTheAi support image generation?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes. FreeTheAi supports image generation through img/gpt-image-2 and vhr/* image models. Image editing is available through img/gpt-image-2 with a base64 input image.',
				},
			},
			{
				'@type': 'Question',
				name: 'Does FreeTheAi store my prompts?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'No. FreeTheAi does not store prompt content, completion content, or conversation history. Only model usage metadata and token counts are tracked.',
				},
			},
		],
	};
}
