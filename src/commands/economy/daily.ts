import {convert} from 'convert';
import {formatDistance} from 'date-fns';
import {bold} from 'discord-md-tags';
import {Message} from 'discord.js';
import {dailyAmount, defaults} from '../../constants';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

const cooldown = convert(22).from('hours').to('milliseconds');

export default class DailyCommand extends DiceCommand {
	constructor() {
		super('daily', {
			aliases: ['dailies'],
			category: DiceCommandCategories.Economy,
			description: {
				content: 'Collect daily oats.',
				usage: '',
				examples: ['']
			},
			typing: true
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const user = (await this.client.prisma.user.findUnique({where: {id: message.author.id}, select: {dailyUsed: true}})) ?? {dailyUsed: null};
		const now = message.editedAt ?? message.createdAt;

		if (user.dailyUsed === null || user.dailyUsed.getTime() + cooldown < now.getTime()) {
			if (this.client.user === null) {
				throw new TypeError('Expected client.user to be defined');
			}

			this.logger.debug({now, type: typeof now});

			const [{balance: updatedBalance}] = await this.client.prisma.$transaction([
				this.client.prisma.user.upsert({
					where: {id: message.author.id},
					update: {balance: {increment: dailyAmount}, dailyUsed: now},
					create: {balance: defaults.startingBalance.users + dailyAmount, id: message.author.id},
					select: {balance: true}
				}),
				this.client.prisma.user.upsert({
					where: {id: this.client.user.id},
					update: {balance: {increment: dailyAmount}},
					create: {balance: defaults.startingBalance.bot + dailyAmount, id: this.client.user.id},
					select: {id: true}
				})
			]);

			return message.util?.send(
				[`You were paid ${bold`${dailyAmount.toLocaleString()}`} oats`, `Your balance is now ${bold`${updatedBalance.toLocaleString()} oats`}`].join('\n')
			);
		}

		const waitDuration = formatDistance(user.dailyUsed.getTime() + cooldown, now);

		return message.util?.send(`You must wait ${bold`${waitDuration}`} before collecting your daily oats`);
	}
}
