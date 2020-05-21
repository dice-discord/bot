import {Message, MessageEmbed} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {getClusterCount} from '../../util/shard';

export default class StatsCommand extends DiceCommand {
	constructor() {
		super('stats', {
			aliases: ['statistics'],
			description: {content: 'See bot statistics', examples: [''], usage: ''},
			category: DiceCommandCategories.Util,
			typing: true
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		let serverCount = this.client.guilds.cache.size;

		if (this.client.shard) {
			const shardServerCounts = await (this.client.shard.broadcastEval('this.guilds.cache.size') as Promise<number[]>);

			const clusterCount = getClusterCount(this.client.shard);

			const actual = shardServerCounts.length;

			serverCount = shardServerCounts.reduce((previous, value) => previous + value, 0);

			if (actual !== clusterCount) {
				/** The number of clusters that didn't respond. */
				const unresponsiveClusterCount = Math.abs(clusterCount - actual);

				return message.util?.send(
					[
						`It looks like ${unresponsiveClusterCount.toLocaleString()} clusters didn't respond`,
						`The approximate server count is ${serverCount + unresponsiveClusterCount * 1000}`,
						'To get the exact server count, please try this again in a bit once some more clusters have come online'
					].join('\n')
				);
			}
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
