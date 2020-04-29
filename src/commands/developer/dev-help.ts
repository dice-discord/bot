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

		const shardID = message.guild ? findShardIDByGuildID(message.guild.id, shard?.shardCount) : 0;

		return message.util?.send(
			new MessageEmbed({
				fields: [
					{
						name: 'Shard',
						value: `${shardID}/${shard?.shardCount ?? 0} (cluster ${Number(process.env.CLUSTER_ID ?? 0)}/${shard?.clusterCount ?? 0})`
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
