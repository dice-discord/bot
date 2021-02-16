import {Stopwatch} from '@pizzafox/util';
import {Argument} from 'discord-akairo';
import {codeblock} from 'discord-md-tags';
import {Message, MessageEmbed} from 'discord.js';
import {maxEmbedFields} from '../../constants';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import ms = require('pretty-ms');

/**
 * The number of fields allowed before the output will be in codeblock form.
 * Must be less than or equal to 25.
 */
const maxFieldsBeforeCodeblock = 10;

export default class LeaderboardCommand extends DiceCommand {
	constructor() {
		super('leaderboard', {
			aliases: ['top'],
			category: DiceCommandCategories.Economy,
			description: {
				content: 'Check the wealthiest users in the economy.',
				usage: '[amount]',
				examples: ['', '20']
			},
			args: [
				{
					id: 'amount',
					match: 'content',
					type: Argument.range(AkairoArgumentType.Integer, 1, maxEmbedFields, true),
					default: 10,
					prompt: {optional: true, retry: 'Invalid amount, please try again'}
				}
			]
		});
	}

	async exec(message: Message, args: {amount: number}): Promise<Message | undefined> {
		const stopwatch = new Stopwatch();

		stopwatch.start();
		const top = await this.client.prisma.user.findMany({orderBy: {balance: 'desc'}, take: args.amount});

		const embed = new MessageEmbed({title: `Top ${top.length.toLocaleString()} leaderboard`});

		const users = await Promise.all(top.map(async user => this.client.users.fetch(user.id)));

		if (top.length <= maxFieldsBeforeCodeblock) {
			for (const [index, user] of top.entries()) {
				embed.addField(`#${index + 1} ${users[index].tag}`, user.balance.toLocaleString());
			}
		} else {
			const leaderboard: string = top
				.map((user, index) => {
					const balance = user.balance.toLocaleString();
					const userTag = users[index].tag;
					const paddedNumber = `${index + 1}. `.padEnd(args.amount.toString().length + '. '.length);
					return `${paddedNumber}${userTag} - ${balance}`;
				})
				.join('\n');

			embed.setDescription(codeblock('markdown')`${leaderboard}`);
		}

		const duration = Number(stopwatch.end());

		embed.setFooter(`Took ${ms(duration)}`);

		return message.util?.send(embed);
	}
}
