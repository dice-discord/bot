import {User} from '@prisma/client';
import {formatDistance} from 'date-fns';
import {bold} from 'discord-md-tags';
import {Message} from 'discord.js';
import {dailyAmount} from '../../constants';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {DiceUser} from '../../structures/DiceUser';

// 22 hours:     ms     s    m    h
const cooldown = 1000 * 60 * 60 * 22;

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
		const helperUser = new DiceUser(message.author);
		const user: Partial<User> = {
			dailyUsed: (await this.client.prisma.user.findOne({where: {id: message.author.id}, select: {dailyUsed: true}}))?.dailyUsed,
			balance: await helperUser.getBalance()
		};

		const now = message.editedAt ?? message.createdAt;

		if (!user.dailyUsed || user.dailyUsed.getTime() + cooldown < now.getTime()) {
			const botUser = new DiceUser(this.client.user!);
			const [updatedBalance] = await Promise.all([
				helperUser.incrementBalance(dailyAmount),
				botUser.incrementBalance(dailyAmount),
				this.client.prisma.user.upsert({
					where: {id: message.author.id},
					create: {id: message.author.id, dailyUsed: now},
					update: {dailyUsed: now}
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
