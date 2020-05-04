import {Message, MessageEmbed} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {findShardIDByGuildID} from '../../util/shard';
import {code} from 'discord-md-tags';

export default class DevHelpCommand extends DiceCommand {
	constructor() {
		super('dev-help', {
			aliases: ['shard', 'developer-help', 'debug'],
			description: {content: 'Get info to help developers fix bugs.'},
			category: DiceCommandCategories.Developer
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const {shard} = this.client;

		/** This shard's ID. This is a mostly meaningless number since Kurasuta has no real concept of shards, only the clusters that manage them. */
		const shardID = message.guild ? findShardIDByGuildID(message.guild.id, shard?.shardCount) : 0;
		/** This cluster's ID. */
		const clusterID = Number(process.env.CLUSTER_ID ?? 0);
		/** The total number of clusters. */
		const clusterCount = shard?.clusterCount ?? 0;
		/** The shards this cluster is responsible for managing. */
		const responsibleShards = process.env.CLUSTER_SHARDS?.split(',').join(', ') ?? shardID;

		return message.util?.send(
			new MessageEmbed({
				fields: [
					{
						name: 'Shard',
						value: `${shardID}/${shard?.shardCount ?? 0} (cluster ${clusterID}/${clusterCount}, handling ${responsibleShards})`
					},
					{
						name: 'IDs',
						value: [
							`Guild: \`${message.guild ? message.guild.id : 'dm'}\``,
							`Channel: \`${message.channel.id}\``,
							`User: \`${message.author.id}\``,
							`Message: \`${message.id}\``
						].join('\n')
					},
					{
						name: 'Timestamp',
						value: [`Message: ${code`${message.createdTimestamp}`}`, `Current: \`${new Date().getTime()}\``].join('\n')
					}
				]
			})
		);
	}
}
