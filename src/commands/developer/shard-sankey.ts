import {Message} from 'discord.js';
import {DiceClient} from '../../structures/DiceClient';
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
		const {shard} = this.client as DiceClient;

		const clusters: number[][] = await shard!.broadcastEval(`this.responsibleGuildCount()`);

		const totalServerCount = clusters.flat().reduce((a: number, b: number) => a + b, 0);

		const lines = [
			`Dice [${totalServerCount}] Clusters`,
			...clusters.map((cluster, clusterID) => {
				const clusterServerCount = cluster.reduce((a: number, b: number) => a + b, 0);

				return [
					`Clusters [${clusterServerCount}] Cluster ${clusterID}`,
					cluster.map((shard, shardID) => `Cluster ${clusterID} [${shard}] Shard ${shardID}`).join('\n')
				].join('\n');
			})
		];

		return message.util?.send(lines.join('\n'), {code: 'json'});
	}
}
