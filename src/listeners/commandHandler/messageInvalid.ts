import {Message} from 'discord.js';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {GetTagCommandArgs} from '../../commands/tags/get-tag';

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

		if (message.guild && typeof message.util?.parsed?.prefix === 'string' && message.util?.parsed?.prefix !== `<@!${message.client.user!.id}>`) {
			// They are on a guild and specified a prefix that wasn't an @mention @$$evaluate message.util.parsed.alias

			if (typeof message.util?.parsed?.afterPrefix === 'string') {
				// The command had something after the prefix (ex. `$$this-is-afterPrefix`)

				const command = this.client.commandHandler.modules.get('get-tag')!;

				return this.client.commandHandler.runCommand(message, command, {
					noError: true,
					...(await command.parse(message, message.util?.parsed?.afterPrefix))
				} as GetTagCommandArgs);
			}
		}
	}
}
