import ms = require('pretty-ms');
import {Message} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {bold} from 'discord-md-tags';

export default class PingCommand extends DiceCommand {
	constructor() {
		super('ping', {
			aliases: ['heartbeat'],
			description: {content: 'Checks the bot’s ping to the Discord server.'},
			category: DiceCommandCategories.Util
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const response = await message.util?.send('Pinging…');

		if (response) {
			const timestamps = {
				response: response.editedTimestamp ?? response.createdTimestamp,
				original: message.editedTimestamp ?? message.createdTimestamp
			};

			return message.util?.edit(
				[
					`The message round-trip took ${bold`${ms(timestamps.response - timestamps.original, {formatSubMilliseconds: true})}`}`,
					`The heartbeat ping to Discord is ${bold`${ms(this.client.ws.ping, {formatSubMilliseconds: true})}`}`
				].join('\n')
			);
		}
	}
}
