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
		if (message.guild && message.util?.parsed?.prefix) {
			if (!message.util?.parsed?.alias || !message.util?.parsed?.afterPrefix) {
				return;
			}

			const command = this.client.commandHandler.modules.get('get-tag')!;
			return this.client.commandHandler.runCommand(message, command, {
				noError: true,
				...(await command.parse(message, message.util?.parsed?.afterPrefix))
			} as GetTagCommandArgs);
		}
	}
}
