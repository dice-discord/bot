import {User} from '@prisma/client';
import {formatDistance} from 'date-fns';
import {bold} from 'discord-md-tags';
import {Message} from 'discord.js';
import {dailyAmount} from '../../constants';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {DiceUser} from '../../structures/DiceUser';
import {convert} from 'convert';

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
		const helperUser = new DiceUser(message.author);
		const user: Partial<Pick<User, 'dailyUsed'>> & Pick<User, 'balance'> = {
			dailyUsed: (await this.client.prisma.user.findOne({where: {id: message.author.id}, select: {dailyUsed: true}}))?.dailyUsed,
			balance: await helperUser.getBalance()
		};

		const now = message.editedAt ?? message.createdAt;

		if (!user.dailyUsed || user.dailyUsed.getTime() + cooldown < now.getTime()) {
			const botUser = new DiceUser(this.client.user!);

			const [{balance: updatedBalance}] = await this.client.prisma.transaction([
				(await helperUser.incrementBalanceWithPrisma(dailyAmount))(),
				(await botUser.incrementBalanceWithPrisma(dailyAmount))(),
				this.client.prisma.user.update({where: {id: message.author.id}, data: {dailyUsed: now}})
			]);

			return message.util?.send(
				[`You were paid ${bold`${dailyAmount.toLocaleString()}`} oats`, `Your balance is now ${bold`${updatedBalance.toLocaleString()} oats`}`].join('\n')
			);
		}

		const waitDuration = formatDistance(user.dailyUsed.getTime() + cooldown, now);

		return message.util?.send(`You must wait ${bold`${waitDuration}`} before collecting your daily oats`);
	}
}
