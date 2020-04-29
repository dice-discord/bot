import {Snowflake} from 'discord.js';

/**
 * A datastructure for holding a webhook token and ID.
 */
export interface WebhookConfig {
	/** The token of the webhook. */
	token: string;
	/** The ID of the webhook. */
	id: Snowflake;
}
