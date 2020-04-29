import {Snowflake} from 'discord.js';
import {join} from 'path';
import {WebhookConfig} from '../types/discord';
import {Admins} from './constants';
import * as dotenv from 'dotenv';

dotenv.config({path: join(__dirname, '..', 'bot.env')});

/** Whether or not the bot is running in a production environment. */
export const runningInProduction = process.env.NODE_ENV === 'production';

/** Array of Discord user IDs for owners of the bot. */
export const owners: Snowflake[] = [Admins.PizzaFox, Admins.Chronomly, Admins.Okthx];

/** Discord bot token. */
export const discordToken = process.env.DISCORD_TOKEN;

// Discord tokens are separated by `.`s into 3 base64-encoded parts.
// 1. Bot ID
// 2. Token creation time
// 3. HMAC
// Parts 2 and 3 are sensitive information
const disassembledToken = discordToken?.split('.') ?? [];

/** An array of sensitive strings (ex. API keys) that shouldn't be shown in logs or in messages. */
export const secrets: string[] = [];

// Only mark the secret parts of a Discord token as secrets
if (disassembledToken.length === 3) {
	secrets.push(disassembledToken[1], disassembledToken[2]);
}

/**
 * The default prefix to use for commands.
 */
export const defaultPrefix = '$$';

/**
 * Sentry DSN.
 * @see https://docs.sentry.io/error-reporting/quickstart/?platform=node#configure-the-sdk
 */
export const sentryDSN = process.env.SENTRY_DSN;

/**
 * Discoin virtual currency exchange info.
 */
export const discoin = {
	token: process.env.DISCOIN_TOKEN,
	currencyID: 'OAT'
};

/** Webhook used for when the bot becomes ready in production mode. */
export const readyWebhook: Partial<WebhookConfig> = {
	id: process.env.READY_WEBHOOK_ID,
	token: process.env.READY_WEBHOOK_TOKEN
};

/** Plaintext password used for veryifying request authenticity from top.gg. */
export const topGGWebhookPassword = process.env.TOP_GG_WEBHOOK_PASSWORD;
