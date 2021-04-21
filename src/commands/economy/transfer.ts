import {toDigits} from '@jonahsnider/util';
import assert from 'assert';
import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message, User, Util} from 'discord.js';
import {defaults} from '../../constants';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {DiceUser} from '../../structures/DiceUser';
import {typeName as anyUser} from '../../types/anyUser';

export default class TransferCommand extends DiceCommand {
	constructor() {
		super('transfer', {
			aliases: ['send', 'pay', 'pay-user'],
			category: DiceCommandCategories.Economy,
			description: {
				content: 'Send money to a user.',
				usage: '<user> <amount>',
				examples: ['Dice 100', '@Dice 100', '388191157869477888 100']
			},
			args: [
				{
					id: 'user',
					type: anyUser,
					match: 'rest',
					prompt: {start: 'Who would you like to transfer oats to?', retry: 'Invalid user, please try again'},
					unordered: true
				},
				{
					id: 'amount',
					match: 'phrase',
					type: Argument.range(AkairoArgumentType.Number, 1, Number.MAX_SAFE_INTEGER),
					prompt: {start: 'How many oats would you like to transfer?', retry: 'Invalid amount, please try again'},
					unordered: true
				}
			]
		});
	}

	async exec(message: Message, args: {user: User; amount: number}): Promise<Message | undefined> {
		assert(this.client.user);

		if (args.user?.bot && args.user?.id !== this.client.user.id) {
			return message.util?.send("You can't send oats to bots");
		}

		if (message.author.id === args.user.id) {
			return message.util?.send("You can't send oats to yourself");
		}

		args.amount = toDigits(args.amount, 2);

		const authorUser = new DiceUser(message.author);
		const authorBal = await authorUser.getBalance();

		const queries = {
			author: {id: message.author.id},
			recipient: {id: args.user.id}
		};

		if (authorBal < args.amount) {
			return message.util?.send(
				[
					'You do not have enough oats to make the transfer',
					`Your current balance is ${bold`${authorBal.toLocaleString()}`} oat${authorBal === 1 ? '' : 's'}`
				].join('\n')
			);
		}

		const [{balance: updatedAuthorBalance}] = await this.client.prisma.$transaction([
			this.client.prisma.user.upsert({
				where: queries.author,
				update: {balance: {decrement: args.amount}},
				create: {...queries.author, balance: defaults.startingBalance.users - args.amount},
				select: {balance: true}
			}),
			this.client.prisma.user.upsert({
				where: queries.recipient,
				update: {balance: {increment: args.amount}},
				create: {...queries.recipient, balance: defaults.startingBalance[queries.recipient.id === this.client.user.id ? 'bot' : 'users'] + args.amount},
				select: {balance: true}
			})
		]);

		return message.util?.send(
			[
				`Paid ${Util.escapeMarkdown(args.user.tag)} ${bold`${args.amount.toLocaleString()}`} oat${args.amount === 1 ? '' : 's'}`,
				`Your balance is now ${bold`${updatedAuthorBalance.toLocaleString()}`} oat${updatedAuthorBalance === 1 ? '' : 's'}`
			].join('\n')
		);
	}
}
