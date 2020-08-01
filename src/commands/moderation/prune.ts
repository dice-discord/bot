import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Collection, Message, Permissions} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class PruneCommand extends DiceCommand {
	constructor() {
		super('prune', {
			aliases: [
				'bulk-delete-messages',
				'message-prune',
				'message-bulk-delete',
				'delete-messages',
				'messages-prune',
				'messages-bulk-delete',
				'bulk-delete',
				'prune-messages'
			],
			category: DiceCommandCategories.Moderation,
			description: {
				content: 'Delete several messages in bulk.',
				usage: '<amount>',
				examples: ['5', '100']
			},
			userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
			channel: 'guild',
			args: [
				{
					id: 'amount',
					type: Argument.range(AkairoArgumentType.Integer, 1, 100, true),
					prompt: {
						start: 'How many messages do you want to delete?',
						retry: `Invalid amount provided, please provide a number from 1-100`
					}
				}
			]
		});
	}

	async exec(message: Message, args: {amount: number}): Promise<Message | undefined> {
		if (message.member!.permissionsIn(message.channel).has(Permissions.FLAGS.MANAGE_MESSAGES)) {
			const reason = `Requested by ${message.author.tag}`;

			if (message.deletable) {
				await message.delete({reason});
			}

			const channelMessages = await message.channel.messages.fetch({limit: args.amount});

			let deletedMessages: Collection<string, Message>;
			try {
				deletedMessages = await message.channel.bulkDelete(channelMessages);
			} catch {
				// eslint-disable-next-line no-return-await
				return await message.util?.send('Unable to delete those messages');
			}

			return message.util?.send(`${bold`${deletedMessages.size}`} messages were deleted`);
		}

		return message.util?.send("You don't have permissions to delete messages in this channel");
	}
}
