import ms = require('pretty-ms');
import {Stopwatch} from '@jonahsnider/util';
import assert from 'assert';
import {bold} from 'discord-md-tags';
import {Message} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class DBPingCommand extends DiceCommand {
	constructor() {
		super('db-ping', {
			aliases: ['database-ping'],
			description: {content: 'Checks how long it takes to perform a database query.', examples: [''], usage: ''},
			category: DiceCommandCategories.Util
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		assert(this.client.user);

		const stopwatch = Stopwatch.start();
		await this.client.prisma.user.findUnique({where: {id: this.client.user.id}});

		const duration = Number(stopwatch.end());

		return message.util?.send(`Query took ${bold`${ms(duration, {formatSubMilliseconds: true})}`}`);
	}
}
