/** Access-policy entity — free-tier invite/rate-limit policy shared by pricing UI and /access-policy.json. */

export interface InviteTier {
    level: number;
    minimum_invites: number;
    rate_limit_per_minute: number;
    concurrency_limit: number;
}

export interface AccessPolicy {
    invite_tiers: InviteTier[];
}
