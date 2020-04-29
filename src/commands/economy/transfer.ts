import {Argument} from 'discord-akairo';
import {Message, User, Util} from 'discord.js';
import {ArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {simpleFormat} from '../../util/format';
import {bold} from 'discord-md-tags';
import {DiceUser} from '../../structures/DiceUser';

export default class TransferCommand extends DiceCommand {
	constructor() {
		super('transfer', {
			aliases: ['send', 'pay', 'pay-user'],
			category: DiceCommandCategories.Economy,
			description: {
				content: 'Send money to a user.',
				usage: '<user> <amount>',
				examples: ['', 'Dice', '@Dice', '388191157869477888']
			},
			args: [
				{
					id: 'user',
					type: ArgumentType.User,
					match: 'rest',
					prompt: {start: 'Who would you like to transfer oats to?', retry: 'Invalid user, please try again'},
					unordered: true
				},
				{
					id: 'amount',
					match: 'phrase',
					type: Argument.range(ArgumentType.Number, 1, Number.MAX_SAFE_INTEGER),
					prompt: {start: 'How many oats would you like to transfer?', retry: 'Invalid amount, please try again'},
					unordered: true
				}
			]
		});
	}

	async exec(message: Message, args: {user: User; amount: number}): Promise<Message | undefined> {
		if (args.user?.bot && args.user?.id !== this.client.user!.id) {
			return message.util?.send('You can’t send oats to bots');
		}

		args.amount = simpleFormat(args.amount);

		const authorUser = new DiceUser(message.author);
		const authorBal = await authorUser.getBalance();

		if (authorBal < args.amount) {
			return message.util?.send(
				[
					'You do not have enough oats to make the transfer',
					`Your current balance is ${bold`${authorBal.toLocaleString()}`} oat${authorBal === 1 ? '' : 's'}`
				].join('\n')
			);
		}

		const recipient = new DiceUser(args.user);

		const [updatedAuthorBalance] = await Promise.all([authorUser.incrementBalance(-args.amount), recipient.incrementBalance(args.amount)]);

		return message.util?.send(
			[
				`Paid ${Util.escapeMarkdown(args.user.tag)} ${bold`${args.amount.toLocaleString()}`} oat${args.amount === 1 ? '' : 's'}`,
				`Your balance is now ${bold`${updatedAuthorBalance.toLocaleString()}`} oat${updatedAuthorBalance === 1 ? '' : 's'}`
			].join('\n')
		);
	}
}
