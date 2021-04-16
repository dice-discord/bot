import {formatDistanceToNow, subMilliseconds} from 'date-fns';
import {Message, MessageEmbed, Permissions} from 'discord.js';
import {Colors} from '../../constants';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import * as pkg from '../../../package.json';
import {convert} from 'convert';
import {sum} from '@jonahsnider/util';

export default class BotInfoCommand extends DiceCommand {
	constructor() {
		super('bot-info', {
			aliases: ['uptime', 'version', 'bot', 'memory', 'ram', 'memory-usage', 'ram-usage', 'patrons', 'supporters'],
			description: {content: 'Information about the bot.', examples: [''], usage: ''},
			category: DiceCommandCategories.Util,
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS]
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		let heapUsed = 0;

		if (this.client.shard) {
			const allHeapUsed = (await this.client.shard.broadcastEval('process.memoryUsage().heapUsed')) as number[];

			// eslint-disable-next-line unicorn/no-array-reduce, unicorn/no-array-callback-reference
			heapUsed = allHeapUsed.reduce(sum);
		} else {
			heapUsed = process.memoryUsage().heapUsed;
		}

		return message.util?.send(
			new MessageEmbed({
				title: 'Dice',
				url: 'https://dice.js.org',
				color: Colors.Primary,
				description: 'Dice is a multipurpose, general-use, utility bot',
				thumbnail: {url: this.client.user?.displayAvatarURL({format: 'webp', size: 512})},
				fields: [
					{name: 'Uptime', value: formatDistanceToNow(subMilliseconds(new Date(), this.client.uptime!)), inline: true},
					{
						name: 'Version',
						value: `v${pkg.version}`,
						inline: true
					},
					{
						name: 'RAM usage',
						value: `${convert(heapUsed).from('bytes').to('megabytes').toFixed(2)} megabytes`,
						inline: true
					},
					{
						name: 'Support team',
						value: 'Jonah#6905',
						inline: true
					}
				]
			})
		);
	}
}
