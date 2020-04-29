import ms = require('pretty-ms');
import {Message} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {bold} from 'discord-md-tags';
import {startTimer} from '../../util/timer';

export default class DBPingCommand extends DiceCommand {
	constructor() {
		super('db-ping', {
			aliases: ['database-ping'],
			description: {content: 'Checks how long it takes to perform a database query.'},
			category: DiceCommandCategories.Util
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const endTimer = startTimer();

		await this.client.prisma.user.findOne({where: {id: this.client.user!.id}});

		const elapsed = endTimer();

		return message.util?.send(`Query took ${bold`${ms(elapsed, {formatSubMilliseconds: true})}`}`);
	}
}
