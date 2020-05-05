import {Message} from 'discord.js';
import {DiceClient} from '../../structures/DiceClient';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {findShardIDByGuildID, getResponsibleShards} from '../../util/shard';

const sum = (a: number, b: number) => a + b;

export default class ShardSankeyCommand extends DiceCommand {
	constructor() {
		super('shard-sankey', {
			aliases: ['sankey', 'sankey-shard', 'cluster-sankey', 'sankey-cluster'],
			description: {content: 'Generate SankeyMatic compatible notation to show a breakdown of what clusters are managing which shards.'},
			category: DiceCommandCategories.Developer
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const {shard} = <DiceClient>this.client;

		const clusters: number[][] = await shard!.broadcastEval(`this.responsibleGuildCount()`);

		const totalServerCount = clusters.flat().reduce(sum);

		const lines = [
			`Dice [${totalServerCount}] Clusters`,
			...clusters.map((cluster, clusterID) =>
				[
					`Clusters [${cluster.flat().reduce(sum)}] Cluster ${clusterID}`,
					`${cluster.map((shard, shardID) => `Cluster ${clusterID} [${shard}] Shard ${shardID}`).join('\n')}`
				].join('\n')
			)
		];

		return message.util?.send(lines.join('\n'), {code: 'json'});
	}
}
