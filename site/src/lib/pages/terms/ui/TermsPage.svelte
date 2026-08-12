<script lang="ts">
    import { buildSeo } from "@/shared/lib/seo";
    import { DitherGradient, SeoHead } from "@/shared/ui";
    import {
        buildBreadcrumbJsonLd,
        buildMachineReadableResourcesJsonLd,
        buildOrganizationJsonLd,
        buildSoftwareJsonLd,
        buildWebsiteJsonLd,
        buildWebApiJsonLd,
    } from "@/shared/lib/jsonLd";

    const pageTitle = "Terms of Service | FreeTheAi";
    const pageDescription =
        "FreeTheAi Terms of Service covering service description, acceptable use, data protection, intellectual property, liability limitations, dispute resolution, and worldwide legal compliance.";

    const seo = buildSeo({
        title: pageTitle,
        description: pageDescription,
        path: "/terms",
        keywords: "FreeTheAi terms, FreeTheAi terms of service, free ai api terms, api acceptable use, data protection, GDPR, CCPA",
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            buildMachineReadableResourcesJsonLd(),
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "FreeTheAi Terms of Service",
                url: "https://freetheai.xyz/terms",
                description: pageDescription,
                isPartOf: { "@id": "https://freetheai.xyz/#website" },
            },
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: "Terms of Service", url: "https://freetheai.xyz/terms" },
            ]),
        ],
    });
</script>

<SeoHead {seo} />

<main class="jp-dense">
    <section class="policy-hero shell">
        <DitherGradient class="policy-glow" from="grey" direction="up" opacity={0.26} />
        <span class="eyebrow">Terms of Service</span>
        <h1>Terms of Service</h1>
        <p class="hero-text">
            These Terms of Service ("Terms") constitute a legally binding agreement between you
            ("User", "you", "your") and FreeTheAi ("we", "us", "our", "the Provider"), governing
            your access to and use of the FreeTheAi platform, including the website at
            freetheai.xyz, the Discord bot, API keys, API endpoints, model catalog, documentation,
            and all related features and infrastructure (collectively, the "Service"). By
            accessing or using the Service, you agree to be bound by these Terms in their entirety.
            If you do not agree, you must not access or use the Service.
        </p>
        <span class="policy-badge">
            <span class="material-symbols-outlined" aria-hidden="true">event</span>
            Effective date: August 12, 2026
        </span>
    </section>

    <!-- Section 1: Definitions -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 1</span>
            <h2>Definitions</h2>
            <p>For the purposes of these Terms, the following definitions apply:</p>
        </header>
        <div class="privacy-columns">
            <article class="panel policy-panel">
                <h3>"Service"</h3>
                <p>
                    The FreeTheAi platform, including the website at freetheai.xyz, the Discord bot,
                    API keys, API endpoints (including but not limited to chat completions, image
                    generation, audio processing, and search endpoints), model catalog, documentation,
                    community features, and all related software, infrastructure, and technical
                    systems operated by FreeTheAi.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"User", "you", "your"</h3>
                <p>
                    Any individual, organization, legal entity, or agent that accesses or uses the
                    Service, including website visitors, Discord server members, API key holders,
                    and any entity on whose behalf a key holder acts. "You" includes both the
                    individual user and any organization they represent.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"API Key"</h3>
                <p>
                    A unique cryptographic credential issued through the FreeTheAi Discord bot that
                    authorizes access to the Service's API endpoints. API keys are personal,
                    non-transferable, non-assignable, and tied to access checks including daily
                    check-ins, rate limits, concurrency limits, and role eligibility. Each person
                    or entity may hold only one active API key.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"Content"</h3>
                <p>
                    All text, code, data, images, audio, video, embeddings, prompts, instructions,
                    and other materials submitted to, generated by, or transmitted through the
                    Service, including but not limited to user prompts, API requests, model
                    completions, and any outputs returned by the Service.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"Input"</h3>
                <p>
                    Any Content that you submit to the Service through API calls, prompts, or other
                    submission mechanisms, including text, code, images, audio, and any data
                    embedded in API requests.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"Output"</h3>
                <p>
                    Any Content generated by the Service in response to your Input, including text,
                    code, images, audio, metadata, and any other materials returned through API
                    responses. Outputs are generated probabilistically by AI models and may vary
                    between identical requests.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"Paid Plan"</h3>
                <p>
                    An optional subscription plan that provides enhanced access to specific model
                    categories, higher rate limits, additional concurrency, and other benefits
                    beyond the free tier. Paid Plans are billed monthly and are subject to
                    plan-specific terms described at the time of purchase.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"Third-Party Models"</h3>
                <p>
                    AI models operated by third-party providers that are accessible through the
                    Service, including but not limited to models from Anthropic, Google, Meta,
                    Mistral, and other providers listed in the model catalog.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"Personal Data"</h3>
                <p>
                    Any information relating to an identified or identifiable natural person, as
                    defined by applicable data protection laws including GDPR Article 4(1), CCPA
                    Civil Code Section 1798.140(v), and LGPD Article 5(I).
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>"Sensitive Data"</h3>
                <p>
                    Personal Data revealing racial or ethnic origin, political opinions, religious
                    or philosophical beliefs, trade union membership, genetic data, biometric data,
                    health data, sex life or sexual orientation, as defined by GDPR Article 9,
                    and any additional categories defined by applicable local law.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 2: Acceptance and Eligibility -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 2</span>
            <h2>Acceptance of Terms and Eligibility</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>Binding Agreement</h3>
                <p>
                    By creating an API key, accessing the Service, sending any API request, or
                    clicking any button indicating agreement, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms and our Privacy Policy
                    (incorporated by reference). These Terms constitute the entire agreement
                    between you and FreeTheAi regarding the Service. If you are using the Service
                    on behalf of an organization, you represent and warrant that you have the
                    authority to bind that organization to these Terms.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Age Requirements</h3>
                <p>
                    You must be at least 13 years of age (or the minimum age required in your
                    jurisdiction, whichever is higher) to use the Service. If you are between 13
                    and 18 years of age (or the age of majority in your jurisdiction), you may
                    only use the Service with the prior written consent and active supervision of
                    a parent or legal guardian who agrees to be bound by these Terms. Users in
                    South Korea must be at least 14 years of age under the Act on Promotion of
                    Information and Communications Network Utilization and Information Protection.
                    Users in China must be at least 16 years of age under the Personal Information
                    Protection Law. We reserve the right to request proof of age at any time and
                    to suspend or terminate accounts where age requirements are not met.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Legal Capacity</h3>
                <p>
                    You represent and warrant that: (a) you have the legal capacity to enter into
                    a binding agreement in your jurisdiction; (b) your use of the Service will not
                    violate any applicable law, regulation, or ordinance; (c) you are not located
                    in, under the control of, or a national or resident of any country to which
                    the United States, European Union, or United Nations has imposed trade
                    sanctions or embargoes; (d) you are not listed on any U.S. government list
                    of prohibited or restricted parties, including the Specially Designated
                    Nationals (SDN) list, the Entity List, or the Denied Persons List; and
                    (e) you have not been previously banned from the Service.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Compliance with Laws</h3>
                <p>
                    You agree to use the Service in compliance with all applicable local, state,
                    national, and international laws, regulations, ordinances, and treaties. You
                    are solely responsible for determining whether your use of the Service complies
                    with the laws applicable to you, including but not limited to export controls,
                    economic sanctions, data protection laws, sector-specific regulations
                    (including HIPAA, FERPA, COPPA, GLBA, and PCI-DSS where applicable), and
                    AI-specific regulations including the EU AI Act.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 3: Service Description -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 3</span>
            <h2>Service Description and Modifications</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>What We Provide</h3>
                <p>
                    FreeTheAi provides a free, OpenAI-compatible API gateway that provides access
                    to multiple AI models from various third-party providers. The Service includes:
                    (a) a Discord bot for API key management and community support; (b) API
                    endpoints for chat completions, image generation, audio processing, search,
                    and other AI tasks; (c) a model catalog documenting available models and their
                    capabilities; (d) documentation and guides for integrating with the Service;
                    (e) optional Paid Plans with enhanced access to specific model categories; and
                    (f) community features through the Discord server.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Free Tier</h3>
                <p>
                    The free tier provides access to the general AI model catalog subject to rate
                    limits (measured in requests per minute), concurrency limits (simultaneous
                    requests), and daily check-in requirements. Free tier access is best-effort
                    and provided without warranty of availability, performance, or continuity.
                    Specific limits are documented in the access policy at /access-policy.json
                    and may be modified, suspended, or discontinued at any time without notice.
                    Free tier access may be subject to capacity constraints, fair-use policies,
                    and provider-imposed limitations.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Paid Plans</h3>
                <p>
                    Optional Paid Plans provide enhanced access to specific model categories (such
                    as dedicated roleplay models) with separate rate limits, concurrency, and
                    pricing. Paid Plans are billed monthly in advance and are subject to the
                    plan-specific terms described at the time of purchase. Paid Plans do not
                    modify, limit, or otherwise affect free-tier access. We reserve the right to
                    change Paid Plan pricing, features, and terms with 30 days' prior notice.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Service Modifications</h3>
                <p>
                    We reserve the right to modify, suspend, or discontinue any part of the
                    Service at any time, including but not limited to models, model providers,
                    rate limits, features, endpoints, access rules, documentation, and community
                    features. We will make reasonable efforts to provide notice of material
                    changes through the Discord server, website, or email, but are not obligated
                    to do so. Continued use of the Service after any changes constitutes
                    acceptance of the modified Service. We are not liable for any loss or
                    damage arising from modifications to the Service.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 4: Account and API Keys -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 4</span>
            <h2>Account Registration and API Keys</h2>
        </header>
        <div class="privacy-columns">
            <article class="panel policy-panel">
                <h3>Key Issuance</h3>
                <p>
                    API keys are issued through the FreeTheAi Discord bot upon completion of the
                    /signup process and human verification challenge. Each key is unique, tied to
                    your Discord account, and subject to access checks including daily check-ins
                    (/checkin command), role eligibility, rate limits, and concurrency limits.
                    Keys are issued at our sole discretion and may be refused without explanation.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Key Security</h3>
                <p>
                    You are solely responsible for maintaining the confidentiality and security of
                    your API key. You must not: (a) share, publish, embed in client-side code,
                    or expose your key in any public repository, gist, log, or other accessible
                    location; (b) store your key in plaintext without encryption; (c) transmit
                    your key over unencrypted channels; or (d) allow any third party to use your
                    key. You must notify us immediately at the contact address below if you
                    believe your key has been compromised. We are not liable for any loss,
                    damage, or unauthorized use arising from your failure to secure your key.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Key Restrictions</h3>
                <p>
                    You must not: (a) sell, rent, lease, transfer, sublicense, or share your API
                    key with any third party; (b) create multiple accounts to circumvent rate
                    limits, bans, or access restrictions; (c) automate key creation, rotation,
                    check-in processes, or any other access mechanism; (d) use automated tools
                    to interact with the Discord bot in ways that violate Discord's Terms of
                    Service; (e) reverse-engineer, decompile, or attempt to derive the key
                    generation algorithm; or (f) use your key in any manner that violates these
                    Terms. Each person or entity may hold only one active API key.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Revocation and Suspension</h3>
                <p>
                    We reserve the right to revoke, suspend, restrict, or terminate your API key
                    at any time, with or without notice, for any reason including but not limited
                    to: (a) suspected or actual violation of these Terms; (b) suspicious or
                    abusive usage patterns; (c) security concerns or compromises; (d) capacity
                    management; (e) legal or regulatory requirements; (f) requests by law
                    enforcement; or (g) discontinuation of the Service. Upon revocation, your
                    access to the Service ceases immediately. We are not required to provide
                    reasons for revocation and are not liable for any loss arising from
                    revocation. You may request key restoration through the Discord server,
                    which we may grant at our sole discretion.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 5: Acceptable Use -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 5</span>
            <h2>Acceptable Use Policy</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>Permitted Uses</h3>
                <p>
                    You may use the Service for: (a) personal, non-commercial projects,
                    experiments, and learning; (b) research and academic purposes; (c) roleplay
                    clients, coding agents, bots, and applications; (d) prototyping and
                    development of software that integrates with the Service; (e) testing and
                    evaluation of AI capabilities; and (f) any other purpose that complies with
                    these Terms, applicable law, and Discord's Terms of Service. The Service is
                    designed to support creative, educational, and professional AI applications.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Prohibited Uses</h3>
                <p>
                    You must not use the Service to: (a) generate, store, or distribute Content
                    that is illegal, harmful, threatening, abusive, harassing, defamatory,
                    libelous, tortious, vulgar, obscene, or otherwise objectionable; (b) impersonate
                    any person or entity or misrepresent your affiliation with any person or
                    entity; (c) transmit spam, chain letters, phishing messages, or unsolicited
                    communications; (d) distribute malware, viruses, worms, trojans, ransomware,
                    spyware, adware, or other malicious code; (e) attempt to gain unauthorized
                    access to any part of the Service, related systems, or other users' accounts;
                    (f) interfere with, disrupt, or overload the Service or its infrastructure,
                    including through denial-of-service attacks, resource exhaustion, or excessive
                    API calls; (g) violate any applicable law, regulation, or ordinance, including
                    data protection, privacy, intellectual property, export control, and
                    anti-bribery laws; (h) infringe any third-party intellectual property rights,
                    including patents, copyrights, trademarks, trade secrets, or moral rights;
                    (i) collect, harvest, or scrape user data, API keys, or other information
                    without explicit consent; (j) use the Service for commercial purposes
                    without authorization, including resale, sublicensing, or redistribution of
                    API access; (k) bypass, circumvent, or attempt to bypass any rate limits,
                    access controls, security features, or other restrictions; (l) use the Service
                    to train, fine-tune, or develop competing AI models, services, or products;
                    (m) generate non-consensual intimate imagery, deepfakes, or deceptive
                    synthetic media; (n) facilitate discrimination, harassment, or targeting of
                    individuals or groups based on protected characteristics; (o) exploit or
                    harm minors in any way; (p) provide medical, legal, financial, or other
                    professional advice without appropriate human oversight; (q) make automated
                    decisions that produce legal effects or similarly significant effects on
                    individuals without appropriate safeguards; or (r) use the Service in any
                    manner that we determine, in our sole discretion, to be harmful, abusive,
                    or contrary to the intended purpose of the Service.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Content Responsibility</h3>
                <p>
                    You are solely responsible for all Content you submit to the Service,
                    including prompts, instructions, data, images, code, and any other materials
                    embedded in API calls. You represent and warrant that: (a) you own or have
                    all necessary rights, licenses, consents, and permissions to submit such
                    Content; (b) your Content does not violate any applicable law or third-party
                    rights; (c) your Content does not contain any material that would require
                    additional consent or authorization beyond what you have obtained; and
                    (d) your Content complies with these Terms and all applicable policies. We
                    do not claim ownership of your Content, but you grant us a limited,
                    worldwide, non-exclusive, royalty-free, sublicensable license to use,
                    reproduce, modify, adapt, and process your Content solely for the purpose
                    of providing and improving the Service. This license terminates when you
                    delete your Content or API key, except to the extent required for legal
                    compliance, dispute resolution, or enforcement of these Terms.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Output Disclaimer</h3>
                <p>
                    AI-generated Outputs are probabilistic and may contain inaccuracies,
                    biases, contradictions, offensive content, or material that infringes
                    third-party rights. You are solely responsible for reviewing, validating,
                    and independently verifying all Outputs before use. We do not endorse,
                    guarantee, warrant, or assume responsibility for any Content generated
                    through the Service. Outputs must not be used as the sole basis for any
                    decision that could result in harm to persons, property, or legal rights,
                    including but not limited to medical, legal, financial, employment,
                    insurance, credit, housing, education, law enforcement, and safety-critical
                    decisions. You acknowledge that similar or identical Inputs may produce
                    similar or identical Outputs for other users.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 6: Data Protection and Privacy -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 6</span>
            <h2>Data Protection and Privacy</h2>
        </header>
        <div class="privacy-columns">
            <article class="panel policy-panel">
                <h3>Privacy Policy</h3>
                <p>
                    Our collection and use of personal information is governed by our
                    <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms
                    by reference. By using the Service, you consent to the collection, use,
                    processing, and disclosure of your data as described in the Privacy Policy.
                    We encourage you to review the Privacy Policy regularly, as it may be updated
                    from time to time.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Data Processing</h3>
                <p>
                    FreeTheAi operates as an API gateway and relay. We process Inputs solely to
                    route them to the appropriate Third-Party Model provider and return the
                    resulting Output to you. We do not store prompts, completions, uploaded
                    media, or conversation history. We do log: (a) IP addresses; (b) request
                    metadata (timestamps, endpoints, status codes, model used); (c) account
                    information (Discord user ID, key identifier); (d) usage data (request
                    counts, rate limits, error rates); and (e) client information (user agent,
                    SDK version). These logs are used for security, access validation, debugging,
                    abuse prevention, and service improvement. Logs are retained for a maximum
                    of 90 days unless longer retention is required for legal compliance or
                    dispute resolution. We do not use your Inputs to train, fine-tune, or
                    improve any AI models, and we do not sell your data.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Data Retention and Deletion</h3>
                <p>
                    We retain personal data only for as long as necessary to fulfill the purposes
                    for which it was collected, as described in the Privacy Policy, or as required
                    by applicable law. When you delete your API key, we will delete or anonymize
                    your personal data within 30 days, except to the extent retention is required
                    by: (a) applicable law or regulation; (b) legal proceedings or investigations;
                    (c) enforcement of these Terms; or (d) technical necessity (such as backup
                    archives, which are purged within 90 days). You may request early deletion
                    of your data by contacting us at the address below.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Third-Party Data Handling</h3>
                <p>
                    When you send a request through FreeTheAi, your Input is relayed to a
                    Third-Party Model provider (such as Anthropic, Google, Meta, Mistral, or
                    others) to generate the Output. Each Third-Party Model provider has its own
                    privacy policy, data retention policy, and terms of service that govern how
                    they process your Input and any associated data. We do not control, and are
                    not responsible for, the data handling practices of Third-Party Model
                    providers. Third-Party Model providers may: (a) log your Inputs, Outputs,
                    or metadata for their own purposes, including safety monitoring, abuse
                    prevention, research, and model improvement; (b) retain data for periods
                    determined by their own policies; (c) process data in jurisdictions other
                    than your own; and (d) share data with subprocessors or affiliates.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Third-Party Data Recommendations</h3>
                <p>
                    We strongly recommend that you: (a) review the privacy policy and terms of
                    service of each Third-Party Model provider before sending sensitive, personal,
                    confidential, or proprietary data through the Service; (b) avoid submitting
                    Sensitive Data, Personal Data, or information subject to special regulatory
                    requirements (such as HIPAA, FERPA, or PCI-DSS) through the Service unless
                    you have verified that the relevant Third-Party Model provider offers
                    appropriate protections; (c) use the Service in compliance with your
                    organization's data handling policies; and (d) consult with your data
                    protection officer or legal counsel if you have questions about data
                    processing by Third-Party Model providers. Current provider privacy policies
                    are available at: Anthropic (anthropic.com/privacy), Google
                    (policies.google.com/privacy), Meta (mbasic.facebook.com/privacy/policy/),
                    and Mistral (mistral.ai/privacy-policy).
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>GDPR Compliance (EU/EEA)</h3>
                <p>
                    If you are in the European Union or European Economic Area, you have rights
                    under the General Data Protection Regulation (GDPR), including: (a) the right
                    of access (Article 15); (b) the right to rectification (Article 16); (c) the
                    right to erasure (Article 17); (d) the right to restriction of processing
                    (Article 18); (e) the right to data portability (Article 20); (f) the right
                    to object to processing (Article 21); and (g) the right not to be subject to
                    automated decision-making (Article 22). To exercise these rights, contact us
                    at the address below. We will respond to GDPR requests within 30 days. We
                    process data based on: (i) consent (Article 6(1)(a)); (ii) contractual
                    necessity (Article 6(1)(b)); (iii) legitimate interests (Article 6(1)(f));
                    and (iv) legal obligations (Article 6(1)(c)). Data may be transferred outside
                    the EU/EEA; such transfers are protected by Standard Contractual Clauses
                    (SCCs) or other appropriate safeguards under Article 46. We maintain records
                    of processing activities under Article 30 and conduct data protection impact
                    assessments where required under Article 35. Our EU representative, if
                    applicable, can be contacted at the address below.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>CCPA/CPRA Compliance (California)</h3>
                <p>
                    If you are a California resident, the California Consumer Privacy Act (CCPA),
                    as amended by the California Privacy Rights Act (CPRA), grants you the
                    following rights: (a) the right to know what personal information we collect,
                    use, disclose, and sell (Civil Code Section 1798.100); (b) the right to
                    delete personal information (Civil Code Section 1798.105); (c) the right to
                    opt out of the sale or sharing of personal information (Civil Code Section
                    1798.120); (d) the right to correct inaccurate personal information (Civil
                    Code Section 1798.106); (e) the right to limit use and disclosure of sensitive
                    personal information (Civil Code Section 1798.121); and (f) the right not to
                    be discriminated against for exercising your rights (Civil Code Section
                    1798.125). We do not sell personal information. We do not use personal
                    information for cross-context behavioral advertising without opt-in consent.
                    To exercise your rights, contact us at the address below. We will verify
                    your identity before processing your request and respond within 45 days.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>LGPD Compliance (Brazil)</h3>
                <p>
                    If you are in Brazil, you have rights under the Lei Geral de Protecao de
                    Dados (LGPD), including: (a) confirmation of processing (Article 18(I)); (b)
                    access to data (Article 18(II)); (c) correction of incomplete or inaccurate
                    data (Article 18(III)); (d) anonymization, blocking, or deletion of unnecessary
                    or excessive data (Article 18(IV)); (e) data portability (Article 18(V)); (f)
                    deletion of data processed with consent (Article 18(VI)); (g) information
                    about entities with whom data has been shared (Article 18(VII)); (h) information
                    about the possibility of withholding consent and its consequences (Article
                    18(VIII)); and (i) revocation of consent (Article 18(IX)). To exercise these
                    rights, contact us at the address below. International data transfers are
                    conducted in compliance with LGPD Chapter V (Articles 33-36), including
                    standard contractual clauses and other adequate safeguards.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>PIPEDA Compliance (Canada)</h3>
                <p>
                    If you are in Canada, we comply with the Personal Information Protection and
                    Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation.
                    You have the right to: (a) access your personal information; (b) challenge
                    the accuracy and completeness of your information and have it amended as
                    appropriate; (c) withdraw consent for the collection, use, or disclosure of
                    your personal information (subject to legal or contractual restrictions); and
                    (d) file a complaint with the Office of the Privacy Commissioner of Canada.
                    We obtain meaningful consent for the collection, use, and disclosure of
                    personal information in accordance with PIPEDA principles.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Other International Jurisdictions</h3>
                <p>
                    We comply with applicable data protection laws in all jurisdictions where we
                    operate, including but not limited to: the Privacy Act 1988 (Australia); the
                    Personal Data Protection Act (Singapore); the Protection of Personal
                    Information Act (South Africa); the Federal Law on Personal Data (Russia);
                    the Act on Promotion of Information and Communications Network Utilization
                    and Information Protection (South Korea); the Personal Information Protection
                    Law (China); and the Act on the Protection of Personal Information (Japan).
                    If your jurisdiction provides specific data protection rights not addressed
                    here, contact us at the address below to exercise them. We will respond to
                    all data protection requests within the timeframe required by applicable law,
                    or within 30 days if no specific timeframe is mandated.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 7: Intellectual Property -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 7</span>
            <h2>Intellectual Property Rights</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>Our Intellectual Property</h3>
                <p>
                    The Service, including its website, source code, documentation, model catalog,
                    branding, logos, trademarks, trade names, service marks, and all related
                    materials, is owned by FreeTheAi and protected by copyright, trademark,
                    patent, trade secret, and other intellectual property laws. You may not copy,
                    modify, distribute, sell, lease, sublicense, reverse-engineer, decompile, or
                    create derivative works from any part of the Service without our prior
                    written consent, except as expressly permitted by applicable open source
                    licenses.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Your Content and Inputs</h3>
                <p>
                    You retain all rights, title, and interest in your Inputs and Content. By
                    submitting Inputs to the Service, you grant FreeTheAi a worldwide,
                    non-exclusive, royalty-free, sublicensable, and transferable license to use,
                    reproduce, modify, adapt, translate, and process your Inputs solely for the
                    purpose of providing and improving the Service. This license: (a) is limited
                    to what is necessary to operate the Service; (b) terminates when you delete
                    your Input, Content, or API key (subject to legal retention requirements);
                    (c) does not grant us any right to use your Inputs for marketing, advertising,
                    or model training without your explicit consent; and (d) is subject to our
                    Privacy Policy. We will not use your Inputs to train, fine-tune, or improve
                    any AI models without your explicit opt-in consent.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>AI-Generated Outputs</h3>
                <p>
                    You own the Outputs generated by the Service in response to your Inputs,
                    subject to the following limitations: (a) the underlying Third-Party Model
                    providers may retain rights in their models and training data; (b) similar
                    or identical Inputs may produce similar or identical Outputs for other users;
                    (c) Outputs may contain elements derived from training data owned by third
                    parties; (d) we make no representations or warranties about the originality,
                    non-infringement, or exclusivity of any Output; and (e) your ownership of
                    Outputs is subject to applicable law, including copyright doctrines of
                    originality and authorship. We make no claims of ownership over Outputs.
                    However, you acknowledge that the legal status of AI-generated content
                    varies by jurisdiction and is subject to ongoing legal development.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Open Source Components</h3>
                <p>
                    The Service includes open source software components, each governed by its
                    own license. The source code for FreeTheAi is available under the applicable
                    open source license as specified in the repository. Using the Service does
                    not grant you any rights to our trademarks, logos, or brand materials beyond
                    what is necessary to use the Service as intended. A list of open source
                    components and their licenses is available in the repository.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Copyright Complaints</h3>
                <p>
                    We respect intellectual property rights. If you believe that Content available
                    through the Service infringes your copyright, please submit a written notice
                    to our designated copyright agent at the address below, including: (a) a
                    physical or electronic signature of the copyright owner or authorized agent;
                    (b) identification of the copyrighted work claimed to be infringed; (c)
                    identification of the material claimed to be infringing and its location;
                    (d) your contact information; (e) a statement that you have a good faith
                    belief that the use is not authorized; and (f) a statement, under penalty of
                    perjury, that the information in the notice is accurate and you are authorized
                    to act on behalf of the copyright owner. We will process notices in accordance
                    with the Digital Millennium Copyright Act (DMCA) and equivalent laws in other
                    jurisdictions.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 8: Payments and Refunds -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 8</span>
            <h2>Payments, Refunds, and Taxes</h2>
        </header>
        <div class="privacy-columns">
            <article class="panel policy-panel">
                <h3>Paid Plan Billing</h3>
                <p>
                    Paid Plans are billed monthly in advance. By subscribing to a Paid Plan, you
                    authorize us (or our third-party payment processor) to charge your payment
                    method on a recurring monthly basis until you cancel. All fees are stated in
                    U.S. dollars and are non-refundable except as required by applicable law or
                    as described in the Refund Policy below. We reserve the right to change
                    pricing with 30 days' prior notice. Price changes take effect at the start
                    of your next billing cycle.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Refund Policy</h3>
                <p>
                    For users in the European Union: you have the right to withdraw from a
                    distance selling agreement within 14 days of purchase without giving any
                    reason, under Article 9 of the Consumer Rights Directive (2011/83/EU). To
                    exercise this right, contact us within 14 days of your purchase. Refunds
                    will be processed within 14 days of receiving your withdrawal notice, using
                    the same payment method used for the original transaction. For users in
                    other jurisdictions: refunds are issued at our sole discretion, except where
                    mandatory consumer protection laws provide additional refund rights, which
                    are hereby preserved. Nothing in these Terms excludes or limits your
                    statutory right to a refund where services are not provided as described.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Chargebacks and Payment Disputes</h3>
                <p>
                    If you initiate a chargeback, payment dispute, or payment reversal without
                    first contacting us to resolve the issue in good faith, we reserve the right
                    to immediately suspend or terminate your access to the Service and all Paid
                    Plan benefits, and to pursue all available legal remedies. You are responsible
                    for any fees, costs, or penalties associated with chargebacks or payment
                    disputes initiated by you.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Taxes</h3>
                <p>
                    You are responsible for all applicable taxes associated with your use of Paid
                    Plans, including but not limited to sales tax, value-added tax (VAT), goods
                    and services tax (GST), and withholding tax. Prices displayed may not include
                    taxes, which will be calculated and displayed at checkout where required by
                    applicable law. We will provide tax invoices where required. If you are
                    required to withhold any tax from payments to us, you must gross up the
                    payment so that we receive the full amount owed.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 9: Disclaimers -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 9</span>
            <h2>Disclaimers and Warranties</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>"As Is" and "As Available"</h3>
                <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED
                    ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND,
                    WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO
                    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                    NON-INFRINGEMENT, TITLE, ACCURACY, COMPLETENESS, OR RELIABILITY. WE DO NOT
                    WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, TIMELY, SECURE,
                    OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE MAKE NO WARRANTIES
                    REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT,
                    OUTPUTS, OR INFORMATION AVAILABLE THROUGH THE SERVICE.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>No Professional Advice</h3>
                <p>
                    THE SERVICE AND ANY OUTPUTS GENERATED THROUGH IT ARE NOT INTENDED TO PROVIDE
                    PROFESSIONAL ADVICE OF ANY KIND, INCLUDING BUT NOT LIMITED TO LEGAL, FINANCIAL,
                    MEDICAL, PSYCHOLOGICAL, TAX, ACCOUNTING, OR TECHNICAL ADVICE. OUTPUTS ARE
                    GENERATED BY AI MODELS AND MAY CONTAIN INACCURACIES, BIASES, OR ERRORS. YOU
                    SHOULD CONSULT WITH QUALIFIED, LICENSED PROFESSIONALS BEFORE MAKING ANY
                    DECISIONS OR TAKING ANY ACTIONS BASED ON AI-GENERATED CONTENT. WE EXPRESSLY
                    DISCLAIM ANY LIABILITY FOR RELIANCE ON OUTPUTS FOR PROFESSIONAL DECISIONS.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Third-Party Models and Providers</h3>
                <p>
                    The Service provides access to AI models operated by third-party providers.
                    We do not control, endorse, or assume responsibility for these models, their
                    behavior, accuracy, availability, performance, security, or compliance with
                    applicable laws. Your use of Third-Party Models may be subject to additional
                    terms, policies, and restrictions imposed by those providers. We disclaim
                    all liability arising from or related to Third-Party Models, including
                    availability interruptions, accuracy issues, content policy violations, and
                    changes to model capabilities or access terms.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Service Availability</h3>
                <p>
                    Free access is provided on a best-effort basis without any Service Level
                    Agreement (SLA). We do not guarantee uptime, availability, latency, or
                    performance of the Service. Models, rate limits, routes, features, plans,
                    access rules, and other aspects of the Service may change at any time based
                    on capacity constraints, security considerations, provider behavior, legal
                    requirements, or other factors beyond our control. We are not liable for any
                    loss or damage arising from service interruptions, downtime, or degradation.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>AI-Specific Disclaimers</h3>
                <p>
                    You acknowledge and agree that: (a) AI models are probabilistic systems that
                    generate outputs based on statistical patterns, not deterministic facts; (b)
                    Outputs may be inaccurate, incomplete, misleading, offensive, or harmful;
                    (c) Outputs may not reflect the views or opinions of FreeTheAi; (d) Outputs
                    may inadvertently reproduce copyrighted material or infringe third-party rights;
                    (e) the quality and accuracy of Outputs depend on the quality and accuracy of
                    Inputs; (f) AI technology is rapidly evolving and the Service may not reflect
                    the latest advances; (g) we do not guarantee that the Service will be free
                    from bias, discrimination, or harmful content; and (h) you are solely
                    responsible for evaluating the appropriateness and accuracy of Outputs for
                    your specific use case.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 10: Limitation of Liability -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 10</span>
            <h2>Limitation of Liability</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>Exclusion of Damages</h3>
                <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
                    FREETHEAI, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS,
                    OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                    PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR
                    LOSS OF PROFITS, REVENUE, GOODWILL, DATA, BUSINESS OPPORTUNITY, USE,
                    PRODUCTIVITY, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION
                    WITH: (A) YOUR ACCESS TO OR USE OF THE SERVICE; (B) YOUR INABILITY TO
                    ACCESS OR USE THE SERVICE; (C) ANY CONTENT, OUTPUTS, OR INFORMATION
                    OBTAINED THROUGH THE SERVICE; (D) UNAUTHORIZED ACCESS TO OR ALTERATION OF
                    YOUR DATA OR TRANSMISSIONS; (E) THIRD-PARTY CONDUCT OR CONTENT ON THE
                    SERVICE; (F) ANY RELIANCE PLACED ON OUTPUTS; OR (G) ANY OTHER MATTER
                    RELATING TO THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT
                    (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE
                    BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Cap on Liability</h3>
                <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OUR TOTAL AGGREGATE
                    LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS, THE
                    SERVICE, OR ANY CONTENT OR OUTPUTS, WHETHER IN CONTRACT, TORT (INCLUDING
                    NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, SHALL NOT EXCEED THE GREATER
                    OF: (A) THE TOTAL AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS
                    IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (B) ONE
                    HUNDRED UNITED STATES DOLLARS (USD $100.00). THIS LIMITATION APPLIES
                    REGARDLESS OF THE THEORY OF LIABILITY AND EVEN IF WE HAVE BEEN ADVISED OF
                    THE POSSIBILITY OF SUCH DAMAGES.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Exceptions and Carve-Outs</h3>
                <p>
                    Nothing in these Terms shall exclude or limit liability for: (a) death or
                    personal injury caused by negligence; (b) fraud or fraudulent
                    misrepresentation; (c) gross negligence or willful misconduct; (d) any
                    liability that cannot be excluded or limited under applicable law, including
                    mandatory consumer protection laws; (e) breach of confidentiality obligations
                    under the Privacy Policy; or (f) infringement of intellectual property rights.
                    In jurisdictions that do not allow the exclusion of certain warranties or
                    limitations of liability, our liability is limited to the greatest extent
                    permitted by applicable law. The limitations in this section apply even if
                    any limited remedy provided herein fails of its essential purpose.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Basis of the Bargain</h3>
                <p>
                    You acknowledge that FreeTheAi provides the Service at no charge (for
                    free-tier access) and that the limitations of liability in these Terms reflect
                    a reasonable allocation of risk. You agree that the limitation of liability
                    herein is a fundamental element of the basis of the bargain between you and
                    FreeTheAi, and that we would not provide the Service to you without these
                    limitations. Some jurisdictions do not allow limitations on implied warranties
                    or exclusions of consequential damages, so the above limitations may not apply
                    to you. In such cases, our liability is limited to the fullest extent
                    permitted by applicable law.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 11: Indemnification -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 11</span>
            <h2>Indemnification</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>Your Indemnification Obligations</h3>
                <p>
                    You agree to indemnify, defend, and hold harmless FreeTheAi, its affiliates,
                    officers, directors, employees, agents, licensors, and suppliers from and
                    against any and all claims, actions, proceedings, liabilities, damages, losses,
                    costs, and expenses (including reasonable attorneys' fees and court costs)
                    arising out of or relating to: (a) your access to or use of the Service;
                    (b) your violation of these Terms; (c) your violation of any applicable law,
                    regulation, or ordinance; (d) your violation of any third-party rights,
                    including intellectual property, privacy, or publicity rights; (e) any Content
                    you submit, transmit, or generate through the Service; (f) your interactions
                    with other users; (g) any use of Outputs by you or third parties; or (h) any
                    negligent, reckless, or intentionally harmful conduct on your part.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Indemnification Procedure</h3>
                <p>
                    We will provide you with: (a) prompt written notice of any claim for which
                    indemnification is sought (provided that failure to provide timely notice does
                    not relieve you of indemnification obligations except to the extent that such
                    failure materially prejudices your defense); (b) reasonable cooperation and
                    assistance in the defense of any such claim at your expense; and (c) exclusive
                    control of the defense and settlement of any such claim, provided that we may
                    participate in the defense with our own counsel at our expense, and provided
                    further that you may not settle any claim without our prior written consent if
                    such settlement imposes any liability, obligation, or restriction on us.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 12: Termination -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 12</span>
            <h2>Termination and Suspension</h2>
        </header>
        <div class="two-panel">
            <article class="panel policy-panel">
                <h3>Termination by You</h3>
                <p>
                    You may terminate your use of the Service at any time by: (a) ceasing all
                    use of the Service; (b) revoking your API key through the Discord bot; (c)
                    deleting any copies of the Service software you have installed; and (d)
                    notifying us of your termination. Termination does not relieve you of any
                    obligations incurred prior to termination, including payment obligations for
                    Paid Plans and indemnification obligations under Section 11.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Termination by Us</h3>
                <p>
                    We may terminate or suspend your access to the Service immediately, without
                    prior notice or liability, for any reason, including but not limited to: (a)
                    breach of these Terms; (b) suspected or actual abuse, fraud, or illegal
                    activity; (c) security concerns or compromises; (d) requests by law
                    enforcement or government agencies; (e) discontinuation of the Service;
                    (f) extended inactivity (90+ days without any API calls); or (g) any other
                    reason we determine, in our sole discretion, to be necessary for the
                    protection of the Service, its users, or third parties. Upon termination,
                    your right to use the Service ceases immediately.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Survival of Terms</h3>
                <p>
                    All provisions of these Terms which by their nature should survive
                    termination shall survive, including but not limited to: Sections 1
                    (Definitions), 6 (Data Protection), 7 (Intellectual Property), 9
                    (Disclaimers), 10 (Limitation of Liability), 11 (Indemnification), 13
                    (Dispute Resolution), and 14 (General Provisions). Termination does not
                    relieve you of any obligations incurred prior to termination.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Effect of Termination</h3>
                <p>
                    Upon termination: (a) all API keys are immediately revoked; (b) access to the
                    Service is disabled; (c) any active Paid Plan subscriptions are cancelled and
                    no further charges are made (prorated refunds are not provided except as
                    required by law); (d) your Content and data may be deleted within 30 days
                    (subject to legal retention requirements); and (e) you must cease all use of
                    the Service and any related materials. We are not liable for any loss of
                    data, Content, or business resulting from termination. You are responsible
                    for exporting any data you wish to retain before termination.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 13: Dispute Resolution -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 13</span>
            <h2>Dispute Resolution and Governing Law</h2>
        </header>
        <div class="privacy-columns">
            <article class="panel policy-panel">
                <h3>Governing Law</h3>
                <p>
                    These Terms shall be governed by and construed in accordance with the laws
                    of the United States, without regard to its conflict of law provisions. For
                    users in the European Union, nothing in these Terms deprives you of the
                    protection afforded by mandatory provisions of consumer protection law in your
                    country of residence. For users in other jurisdictions, nothing in these Terms
                    deprives you of protections that cannot be waived by contract under applicable
                    local law.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Informal Resolution</h3>
                <p>
                    Before filing any formal dispute, you agree to contact us and attempt to
                    resolve the dispute informally by sending a written notice describing: (a) the
                    nature and basis of your claim; (b) the specific relief you seek; and (c) your
                    contact information. We will attempt to resolve the dispute within 60 days of
                    receiving your notice. If the dispute cannot be resolved informally within 60
                    days, either party may proceed to formal dispute resolution as described below.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Binding Arbitration</h3>
                <p>
                    If the dispute cannot be resolved informally, any dispute, controversy, or
                    claim arising out of or relating to these Terms, the Service, or any Content
                    or Outputs, shall be resolved by binding arbitration administered by the
                    American Arbitration Association (AAA) under its Consumer Arbitration Rules
                    then in effect. The arbitration shall: (a) be conducted in English; (b) take
                    place remotely unless both parties agree to an in-person hearing; (c) be
                    conducted by a single arbitrator; (d) be limited to individual claims only;
                    and (e) result in a written, reasoned decision. The arbitrator's decision is
                    final and binding, and judgment may be entered in any court of competent
                    jurisdiction. The AAA's rules and procedures, including filing fees, are
                    available at adr.org or by contacting the AAA.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Class Action and Collective Proceedings Waiver</h3>
                <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOU AGREE THAT ANY
                    DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ON AN INDIVIDUAL BASIS AND
                    NOT AS A CLASS, CONSOLIDATED, COLLECTIVE, OR REPRESENTATIVE ACTION. YOU
                    EXPRESSLY WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT,
                    CLASS-WIDE ARBITRATION, OR COLLECTIVE PROCEEDING AGAINST FREETHEAI. THE
                    ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS AND MAY NOT
                    PRESIDE OVER ANY FORM OF CLASS OR REPRESENTATIVE PROCEEDING. IF THIS CLASS
                    ACTION WAIVER IS FOUND TO BE UNENFORCEABLE, THEN THE ARBITRATION CLAUSE
                    SHALL NOT APPLY TO THE EXTENT NECESSARY TO MAKE IT ENFORCEABLE.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Exceptions to Arbitration</h3>
                <p>
                    Notwithstanding the above, either party may: (a) seek injunctive or other
                    equitable relief in any court of competent jurisdiction to prevent the actual
                    or threatened infringement, misappropriation, or violation of intellectual
                    property rights, trade secrets, or confidential information; (b) bring an
                    individual action in small claims court for disputes within that court's
                    jurisdictional limits; and (c) seek emergency or provisional relief from a
                    court of competent jurisdiction to prevent irreparable harm pending arbitration.
                    Nothing in this section prevents either party from reporting suspected illegal
                    activity to law enforcement authorities.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>EU Consumer Rights</h3>
                <p>
                    If you are a consumer in the European Union, you may also bring proceedings
                    in the courts of your country of residence. The European Commission provides
                    an online dispute resolution platform at
                    https://ec.europa.eu/consumers/odr. Nothing in these Terms affects your rights
                    as a consumer under the applicable mandatory laws of your country of residence,
                    including the right to use the dispute resolution platform of the European
                    Commission and the right to bring proceedings in the courts of your domicile.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Limitation Period</h3>
                <p>
                    Any claim arising out of or relating to these Terms or the Service must be
                    filed within one (1) year after the cause of action accrues, except where a
                    longer limitation period is required by applicable law. This limitation period
                    applies to all claims, whether based on contract, tort, statute, or any other
                    legal theory. If a claim is not filed within this period, it is permanently
                    barred.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 14: General Provisions -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 14</span>
            <h2>General Provisions</h2>
        </header>
        <div class="privacy-columns">
            <article class="panel policy-panel">
                <h3>Entire Agreement</h3>
                <p>
                    These Terms, together with the Privacy Policy, the Acceptable Use Policy
                    (if separate), any applicable DPA, and any additional terms applicable to
                    specific features or Paid Plans, constitute the entire agreement between you
                    and FreeTheAi regarding the Service and supersede all prior and contemporaneous
                    agreements, understandings, negotiations, and discussions, whether oral or
                    written, relating to the subject matter hereof.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Severability</h3>
                <p>
                    If any provision of these Terms is held by a court or arbitrator of competent
                    jurisdiction to be invalid, illegal, or unenforceable, the remaining
                    provisions shall continue in full force and effect. The invalid provision
                    shall be modified to the minimum extent necessary to make it valid and
                    enforceable while preserving the original intent of the parties. If
                    modification is not possible, the invalid provision shall be severed from
                    these Terms.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Waiver</h3>
                <p>
                    No waiver of any term or condition shall be deemed a further or continuing
                    waiver of such term or any other term. Our failure to assert any right or
                    provision under these Terms shall not constitute a waiver of such right or
                    provision. Any waiver must be in writing and signed by an authorized
                    representative of FreeTheAi to be effective.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Assignment</h3>
                <p>
                    You may not assign, transfer, or delegate these Terms or any of your rights
                    or obligations under them without our prior written consent. We may assign
                    these Terms without restriction, including in connection with a merger,
                    acquisition, corporate reorganization, sale of all or substantially all of
                    our assets, or operation of law. Any purported assignment in violation of
                    this section is null and void.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Force Majeure</h3>
                <p>
                    We shall not be liable for any failure or delay in performance resulting from
                    causes beyond our reasonable control, including but not limited to natural
                    disasters, pandemics, government actions, sanctions, embargoes, power outages,
                    internet failures, telecommunications failures, cyberattacks, acts of
                    terrorism, labor disputes, supply chain disruptions, or acts of third-party
                    providers. Our obligations under these Terms are suspended for the duration
                    of such events.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Modifications to Terms</h3>
                <p>
                    We reserve the right to modify these Terms at any time at our sole discretion.
                    Material changes will be posted on this page with an updated effective date
                    and, where feasible, communicated through the Discord server, website, or
                    email. Your continued use of the Service after changes are posted constitutes
                    acceptance of the modified Terms. If you do not agree to the modified Terms,
                    you must stop using the Service. We encourage you to review these Terms
                    periodically.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Notices</h3>
                <p>
                    We may provide notices to you through: (a) the Discord server; (b) the
                    website at freetheai.xyz; (c) email to the address associated with your
                    account; or (d) any other reasonable means. You may provide notices to us
                    by sending an email to complex.hummingbird.nliw@masked.me or by writing to
                    the address below. Notices to us are effective upon receipt.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>No Agency or Partnership</h3>
                <p>
                    Nothing in these Terms shall be construed to create a partnership, joint
                    venture, agency, or employment relationship between you and FreeTheAi. Neither
                    party has the authority to bind the other or incur any obligation on behalf
                    of the other.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Third-Party Beneficiaries</h3>
                <p>
                    These Terms are for the sole benefit of the parties and their permitted
                    successors and assigns. Nothing in these Terms confers any rights or benefits
                    on any third party, except that our affiliates and licensors are intended
                    third-party beneficiaries of the applicable provisions of these Terms.
                </p>
            </article>
        </div>
    </section>

    <!-- Section 15: Contact -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Section 15</span>
            <h2>Contact Information</h2>
        </header>
        <div class="privacy-columns">
            <article class="panel policy-panel">
                <h3>General Inquiries</h3>
                <p>
                    For questions about these Terms, contact us at
                    <a href="mailto:complex.hummingbird.nliw@masked.me">complex.hummingbird.nliw@masked.me</a>
                    or through our <a href="/support">Support page</a>.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Data Protection Officer</h3>
                <p>
                    For data protection or privacy-related inquiries, including exercising
                    your rights under GDPR, CCPA, LGPD, PIPEDA, or other data protection laws,
                    contact us at
                    <a href="mailto:complex.hummingbird.nliw@masked.me">complex.hummingbird.nliw@masked.me</a>.
                    We will respond to data protection requests within the timeframe required by
                    applicable law, or within 30 days if no specific timeframe is mandated.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>Copyright Agent</h3>
                <p>
                    For copyright infringement notices under the DMCA or equivalent laws,
                    contact our designated copyright agent at
                    <a href="mailto:complex.hummingbird.nliw@masked.me">complex.hummingbird.nliw@masked.me</a>
                    with "Copyright Notice" in the subject line.
                </p>
            </article>
            <article class="panel policy-panel">
                <h3>EU Representative</h3>
                <p>
                    For users in the European Union, if required under the GDPR or other
                    applicable law, our EU representative can be contacted at the same address
                    above. We will provide details of our EU representative upon request.
                </p>
            </article>
        </div>
    </section>

    <!-- Legal links -->
    <section class="section shell policy-section">
        <header class="section-head">
            <span class="eyebrow">Related</span>
            <h2>Related pages</h2>
        </header>
        <div class="legal-foot">
            <a href="/privacy">Privacy Policy</a>
            <a href="/support">Support</a>
            <a href="/terms">Terms of Service</a>
        </div>
    </section>
</main>
