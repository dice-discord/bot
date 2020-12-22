import ms = require('pretty-ms');
import {Message} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {bold} from 'discord-md-tags';
import {Stopwatch} from '@pizzafox/util';

export default class DBPingCommand extends DiceCommand {
	constructor() {
		super('db-ping', {
			aliases: ['database-ping'],
			description: {content: 'Checks how long it takes to perform a database query.', examples: [''], usage: ''},
			category: DiceCommandCategories.Util
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const stopwatch = new Stopwatch();

		stopwatch.start();
		await this.client.prisma.user.findUnique({where: {id: this.client.user!.id}});

		const duration = Number(stopwatch.end());

		return message.util?.send(`Query took ${bold`${ms(duration, {formatSubMilliseconds: true})}`}`);
	}
}
