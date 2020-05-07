import {Message, MessageEmbed} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class StatsCommand extends DiceCommand {
	constructor() {
		super('stats', {
			aliases: ['statistics'],
			description: {content: 'See bot statistics'},
			category: DiceCommandCategories.Util,
			typing: true
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		let serverCount = this.client.guilds.cache.size;

		if (this.client.shard) {
			const shardServerCounts = await (this.client.shard.broadcastEval('this.guilds.cache.size') as Promise<number[]>);

			serverCount = shardServerCounts.reduce((previous, value) => previous + value, 0);
		}

		return message.util?.send(
			new MessageEmbed({
				title: 'Stats',
				fields: [
					{
						name: 'Servers',
						value: serverCount.toLocaleString()
					},
					{
						name: 'Users (who have used Dice before)',
						value: (await this.client.prisma.user.count()).toLocaleString()
					}
				]
			})
		);
	}
}
