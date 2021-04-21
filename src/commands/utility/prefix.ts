import {captureException} from '@sentry/node';
import assert from 'assert';
import {Argument} from 'discord-akairo';
import {Message, Permissions, Util} from 'discord.js';
import {defaultPrefix} from '../../config';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class PrefixCommand extends DiceCommand {
	constructor() {
		super('prefix', {
			category: DiceCommandCategories.Util,
			description: {
				content: 'View or update the prefix used for triggering commands.',
				usage: '[prefix] [--reset]',
				examples: ['', '!', '--reset']
			},
			channel: 'guild',
			args: [
				{
					id: 'prefix',
					match: 'text',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 10),
					// An Akairo bug will display the `otherwise` message every time if prefix arg is not provided
					// https://discordapp.com/channels/305153029567676426/387777801412935691/677012630531080192
					// otherwise: 'The provided prefix was too long',
					prompt: {optional: true, retry: 'The provided prefix was more than 10 characters long'}
				},
				{
					id: 'reset',
					match: 'flag',
					flag: '--reset',
					prompt: {optional: true}
				}
			]
		});
	}

	/**
	 * Handle an error that occurred while refreshing a cached guild's settings.
	 * @param error Error to log and report to Sentry
	 * @returns The generated Sentry `eventId`.
	 */
	handleRefreshError(error: unknown) {
		this.logger.error("An error occurred while attempting to refresh a guild's settings", error);
		return captureException(error);
	}

	async exec(message: Message, {prefix, reset}: {prefix?: string; reset: boolean}): Promise<Message | undefined> {
		assert(message.guild);
		const {id} = message.guild;

		// If you are modifying the prefix and you don't have `MANAGE_GUILD` and you aren't an owner
		if ((prefix ?? reset) && !message.member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD) && !this.client.isOwner(message.author.id)) {
			return message.util?.send('You must have manage server permissions to modify the command prefix');
		}

		if (prefix) {
			await this.client.prisma.guild.upsert({where: {id}, create: {id, prefix}, update: {prefix}});

			// eslint-disable-next-line promise/prefer-await-to-then
			this.client.guildSettingsCache.refresh(id).catch(this.handleRefreshError);

			return message.util?.send(`Command prefix changed to \`${Util.escapeMarkdown(prefix, {inlineCodeContent: true})}\``);
		}

		if (reset) {
			const guild = await this.client.guildSettingsCache.get(id);

			if (guild?.prefix) {
				await this.client.prisma.guild.update({where: {id}, data: {prefix: null}});
				// eslint-disable-next-line promise/prefer-await-to-then
				this.client.guildSettingsCache.refresh(id).catch(this.handleRefreshError);

				return message.util?.send(`The command prefix was reset to the default (\`${Util.escapeMarkdown(defaultPrefix, {inlineCodeContent: true})}\`)`);
			}

			return message.util?.send('The command prefix is already the default.');
		}

		const guild = await this.client.guildSettingsCache.get(id);
		const currentPrefix = guild?.prefix ?? defaultPrefix;

		return message.util?.send(`Command prefix is \`${Util.escapeMarkdown(currentPrefix, {inlineCodeContent: true})}\``);
	}
}
