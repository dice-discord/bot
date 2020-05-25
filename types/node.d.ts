declare namespace NodeJS {
	export interface ProcessEnv {
		DISCORD_TOKEN?: string;
		SENTRY_DSN?: string;
		DISCOIN_TOKEN?: string;
		READY_WEBHOOK_ID?: string;
		READY_WEBHOOK_TOKEN?: string;
		TOP_GG_WEBHOOK_PASSWORD?: string;
		POSTGRES_URI?: string;
		INFLUXDB_DSN?: string;
		GOOGLE_APPLICATION_CREDENTIALS?: string;
		NFL_API_TOKEN?: string;
		/** Always set to `true` on GitHub Actions. */
		CI?: 'true';
	}
}
