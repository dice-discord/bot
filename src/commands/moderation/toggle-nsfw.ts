import {bold} from 'discord-md-tags';
import {Message, Permissions, TextChannel} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class ToggleNSFWCommand extends DiceCommand {
	constructor() {
		super('toggle-nsfw', {
			aliases: ['nsfw', 'nsfw-toggle', 'toggle-channel-nsfw', 'toggle-nsfw-channel'],
			category: DiceCommandCategories.Moderation,
			description: {
				content: "Toggle a channel's NSFW setting.",
				usage: '<channel>',
				examples: ['#pics', 'pics', '452599740274573312']
			},
			channel: 'guild',
			args: [
				{
					id: 'channel',
					type: AkairoArgumentType.TextChannel,
					prompt: {
						start: 'Which channel do you want to modify?',
						retry: `Invalid channel provided, please provide a valid channel on this server`
					}
				}
			]
		});
	}

	async exec(message: Message, args: {channel: TextChannel}): Promise<Message | undefined> {
		const channelName = bold`${clean(args.channel.name, message)}`;

		if (!args.channel.manageable) {
			return message.util?.send(`I don't have permissions to manage ${channelName}`);
		}

		if (!args.channel.permissionsFor(message.member!)?.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
			return message.util?.send(`You don't have permissions to manage ${channelName}`);
		}

		try {
			await args.channel.setNSFW(!args.channel.nsfw);
		} catch (error) {
			this.logger.error(error);
			// eslint-disable-next-line no-return-await
			return await message.util?.send(`An error occurred while changing ${channelName}'s NSFW setting`);
		}

		return message.util?.send(`${channelName} was set to ${args.channel.nsfw ? '' : 'not '}NSFW`);
	}
}
