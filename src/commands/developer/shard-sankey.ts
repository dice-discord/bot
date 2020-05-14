import {Message} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class ShardSankeyCommand extends DiceCommand {
	constructor() {
		super('shard-sankey', {
			aliases: ['sankey', 'sankey-shard', 'cluster-sankey', 'sankey-cluster'],
			description: {content: 'Generate SankeyMatic compatible notation to show a breakdown of what clusters are managing which shards.'},
			category: DiceCommandCategories.Developer
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const {shard} = this.client;

		/**
		 * @example [{ '0': 999 }]
		 */
		const clusters: Array<{[shardID: number]: number}> = (await shard?.broadcastEval(`this.responsibleGuildCount()`)) ?? [{'0': this.client.guilds.cache.size}];

		const totalServerCount = clusters.flatMap(cluster => Object.values(cluster)).reduce((a, b) => a + b);

		const lines: string[] = [
			`Dice [${totalServerCount}] Clusters`,
			...clusters.map((cluster, clusterID) => {
				const clusterServerCount = Object.values(cluster).reduce((a, b) => a + b, 0);

				const clusterLines = [`Clusters [${clusterServerCount}] Cluster ${clusterID}`];

				for (const [shardID, shardGuildCount] of Object.entries(cluster)) {
					clusterLines.push(`Cluster ${clusterID} [${shardGuildCount}] Shard ${shardID}`);
				}

				return clusterLines.join('\n');
			})
		];

		return message.util?.send(lines.join('\n'), {code: true});
	}
}
