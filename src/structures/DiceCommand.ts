import {Command, CommandOptions} from 'discord-akairo';
import {Collection, Message} from 'discord.js';
import {baseLogger} from '../logging/logger';
import {DiceClient} from './DiceClient';

export const enum DiceCommandCategories {
	Util = 'utility',
	Admin = 'admin',
	Economy = 'economy',
	Developer = 'developer',
	Fun = 'fun',
	Selfroles = 'selfroles',
	Tags = 'tags',
	Moderation = 'moderation',
	Single = 'single response',
	Minecraft = 'minecraft'
}

/**
 * The type that the argument should be cast to.
 */
export const enum AkairoArgumentType {
	/** Does not cast to any type. */
	String = 'string',
	/** Makes the input lowercase. */
	Lowercase = 'lowercase',
	/** Makes the input uppercase. */
	Uppercase = 'uppercase',
	/** Transforms the input to an array of char codes. */
	CharCodes = 'charCodes',
	/** Casts to a number. */
	Number = 'number',
	/** Casts to an integer. */
	Integer = 'integer',
	/** Casts to a big integer. */
	BigInt = 'bigint',
	/** Casts to an URL object. */
	URL = 'url',
	/** Casts to a Date object. */
	Date = 'date',
	/** Casts a hex code to an integer. */
	Color = 'color',
	/** Tries to resolve to a command from an alias. */
	CommandAlias = 'commandAlias',
	/** Matches the ID of a command. */
	Command = 'command',
	/** Matches the ID of an inhibitor. */
	Inhibitor = 'inhibitor',
	/** Matches the ID of a listener. */
	Listener = 'listener',
	/** Tries to resolve to a user. */
	User = 'user',
	/** Tries to resolve to a member. */
	Member = 'member',
	/** Tries to resolve to a relevant user, works in both guilds and DMs. */
	Relevant = 'relevant',
	/** Tries to resolve to a channel. */
	Channel = 'channel',
	/** Tries to resolve to a text channel. */
	TextChannel = 'textChannel',
	/** Tries to resolve to a voice channel. */
	VoiceChannel = 'voiceChannel',
	/** Tries to resolve to a role. */
	Role = 'role',
	/** Tries to resolve to a custom emoji. */
	Emoji = 'emoji',
	/** Tries to resolve to a guild. */
	Guild = 'guild',
	/** Tries to resolve to users. */
	Users = 'users',
	/** Tries to resolve to members. */
	Members = 'members',
	/** Tries to resolve to relevant users, works in both guilds and DMs. */
	Relevants = 'relevants',
	/** Tries to resolve to channels. */
	Channels = 'channels',
	/** Tries to resolve to text channels. */
	TextChannels = 'textChannels',
	/** Tries to resolve to voice channels. */
	VoiceChannels = 'voiceChannels',
	/** Tries to resolve to roles. */
	Roles = 'roles',
	/** Tries to resolve to custom emojis. */
	Emojis = 'emojis',
	/** Tries to resolve to guilds. */
	Guilds = 'guilds',
	/** Tries to fetch a message from an ID within the channel. */
	Message = 'message',
	/** Tries to fetch a message from an ID within the guild. */
	GuildMessage = 'guildMessage',
	/** Is a combination with guild message, works in both guilds and DMs. */
	RelevantMessage = 'relevantMessage',
	/** Tries to fetch an invite object from a link. */
	Invite = 'invite',
	/** Matches a mention of a user. */
	UserMention = 'userMention',
	/** Matches a mention of a guild member. */
	MemberMention = 'memberMention',
	/** Matches a mention of a channel. */
	ChannelMention = 'channelMention',
	/** Matches a mention of a role. */
	RoleMention = 'roleMention',
	/** Matches a mention of an emoji. */
	EmojiMention = 'emojiMention'
}

declare module 'discord-akairo' {
	interface CommandHandler {
		// @ts-ignore
		prefix: (message: Message) => Promise<string>;
		// @ts-ignore
		categories: Collection<DiceCommandCategories, Category<string, DiceCommand>>;
	}

	interface Command {
		logger: typeof baseLogger;
		categoryID: DiceCommandCategories;
	}
}

export interface DiceCommandOptions extends CommandOptions {
	category: DiceCommandCategories;
	description: {
		content: string;
		usage?: string;
		examples?: string[];
	};
}

export class DiceCommand extends Command {
	description!: {
		content: string;
		usage?: string;
		examples?: string[];
	};

	client!: DiceClient;

	constructor(id: string, options: DiceCommandOptions) {
		const logger = baseLogger.scope('commands', id);
		// Add the command ID as an alias if it isn't present
		if (!options.aliases) {
			options.aliases = [id];
		} else if (options.aliases.includes(id)) {
			logger.warn('The command aliases include the command ID, which is automatically added by `DiceCommand`s');
		} else {
			options.aliases.unshift(id);
		}

		super(id, options);

		this.logger = logger;
	}
}
