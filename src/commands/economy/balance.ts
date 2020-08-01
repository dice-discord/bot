import {bold} from 'discord-md-tags';
import {Message, User} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {DiceUser} from '../../structures/DiceUser';
import {typeName as anyUser} from '../../types/anyUser';

export default class BalanceCommand extends DiceCommand {
	constructor() {
		super('balance', {
			aliases: ['bal', 'user-balance'],
			category: DiceCommandCategories.Economy,
			description: {
				content: 'Check the balance of yourself or another user.',
				usage: '[user]',
				examples: ['', 'Dice', '@Dice', '388191157869477888']
			},
			args: [
				{
					id: 'user',
					match: 'content',
					type: anyUser,
					prompt: {optional: true, retry: 'Invalid user, please try again'}
				}
			]
		});
	}

	async exec(message: Message, args: {user?: User}): Promise<Message | undefined> {
		if (args.user?.bot && args.user?.id !== this.client.user!.id) {
			return message.util?.send("You can't check the balance of bots");
		}

		const user = new DiceUser(args.user ?? message.author);
		const balance = await user.getBalance();

		return message.util?.send(
			`${args.user?.tag ? `${args.user.tag}'s` : 'Your'} account has a balance of ${bold`${balance.toLocaleString()}`} oat${balance === 1 ? '' : 's'}`
		);
	}
}
