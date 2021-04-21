import {Message} from 'discord.js';
import assert from 'assert';
import {GetTagCommandArgs} from '../../commands/tags/get-tag';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';

export default class MessageInvalidListener extends DiceListener {
	public constructor() {
		super('messageInvalid', {
			emitter: 'commandHandler',
			event: 'messageInvalid',
			category: DiceListenerCategories.CommandHandler
		});
	}

	public async exec(message: Message): Promise<void> {
		// Someone attempted to run a regular command but it didn't exist

		assert(message.client.user);

		if (
			message.guild &&
			typeof message.util?.parsed?.prefix === 'string' &&
			message.util?.parsed?.prefix !== message.client.user.toString() &&
			typeof message.util?.parsed?.afterPrefix === 'string'
		) {
			// They are on a guild and specified a prefix that wasn't an @mention @$$evaluate message.util.parsed.alias
			// The command had something after the prefix (ex. `$$this-is-afterPrefix`)

			const command = this.client.commandHandler.modules.get('get-tag');

			assert(command);

			return this.client.commandHandler.runCommand(message, command, {
				noError: true,
				...(await command.parse(message, message.util?.parsed?.afterPrefix))
			} as GetTagCommandArgs);
		}
	}
}
