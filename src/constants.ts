import {PresenceData} from 'discord.js';
import {PackageJson} from 'type-fest';
import * as pkg from '../package.json';

/** Utility structure to organize admin user IDs. */
export enum Admins {
	/** `Jonah#6905` on Discord. */
	Jonah = '210024244766179329',
	/** `fizza pox#0594` on Discord. */
	FizzaPox = '405208438101245952'
}

/** Colors in numberic format, mostly for use in message embeds. */
export const enum Colors {
	Primary = 0x4caf50,
	// eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
	Success = Primary,
	Error = 0xf44336,
	Warning = 0xff9800
}

/** The amount of oats a user should receive when they use the daily command. */
export const dailyAmount = 1000;

/** Prompts to give a user while using a command. */
export const commandArgumentPrompts = {
	modify: {
		start: (string?: string) => [string ?? 'No argument was provided, please specify it now', 'Type `cancel` to cancel the command'].join('\n'),
		retry: (string?: string) => [string ?? 'The provided argument was invalid, please try again', 'Type `cancel` to cancel the command'].join('\n')
	},
	timeout: 'The command was automatically cancelled because it timed out',
	ended: 'The command was automatically cancelled',
	cancel: 'The command has been cancelled'
};

/** Default values, mostly for the database. */
export const defaults = {
	startingBalance: {
		bot: 750_000,
		users: 1_000
	},
	/** Default rewards for voting for the bot on a listing. */
	vote: {
		/** Reward when a user votes when it is not the weekend. */
		base: 1_000,
		// Voting on the weekend gives double the normal ranking points on top.gg
		/** Reward when a user votes during the weekend. */
		weekend: 2_000
	}
};

/**
 * Notifications server moderators can enable.
 * Key is the ID of the event, value is the label for the event.
 */
export const notifications: Record<Notifications, string> = {
	BAN_UNBAN: 'ban and unban',
	GUILD_MEMBER_JOIN_LEAVE: 'member join and leave',
	VOICE_CHANNEL: 'voice channel',
	GUILD_MEMBER_UPDATE: 'nickname change',
	USER_ACCOUNT_BIRTHDAY: 'user account birthday',
	MESSAGE_DELETE: 'message delete',
	MESSAGE_UPDATE: 'message update/edit'
};

/**
 * Map notification IDs from the database to nice values for developers.
 * This should be in sync with the `NotificationSettings` id enum in the Prisma schema.
 */
export const enum Notifications {
	BanUnban = 'BAN_UNBAN',
	GuildMemberJoinLeave = 'GUILD_MEMBER_JOIN_LEAVE',
	VoiceChannel = 'VOICE_CHANNEL',
	GuildMemberUpdate = 'GUILD_MEMBER_UPDATE',
	UserAccountBirthday = 'USER_ACCOUNT_BIRTHDAY',
	MessageDelete = 'MESSAGE_DELETE',
	MessageUpdate = 'MESSAGE_UPDATE'
}

/** Number of nanoseconds in a millisecond. */
export const nsInMs = 1_000_000;

/**
 * The maximum number of field elements allowed in an embed.
 * @see https://discordapp.com/developers/docs/resources/channel#embed-limits-limits
 */
export const maxEmbedFields = 25;

/** Port to listen for top.gg webhooks on. */
export const topGGWebhookPort = 5000;

/**
 * Exit codes used for the process.
 */
export const enum ExitCodes {
	Success,
	Error,
	LoginError
}

/** Presence data to use with the client on login. */
export const presence: PresenceData = {activity: {name: 'for @Dice help', type: 'WATCHING'}};

const {version} = pkg as PackageJson;

/** User agent to use in HTTP requests. */
export const userAgent = `Dice Discord bot / v${version ?? '0.0.0-development'} dice.js.org`;
