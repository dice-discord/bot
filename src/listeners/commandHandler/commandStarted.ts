import {inspect} from 'util';
import {Message} from 'discord.js';
import {baseLogger} from '../../logging/logger';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {DiceCommand} from '../../structures/DiceCommand';

export default class CommandStartedListener extends DiceListener {
	constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: DiceListenerCategories.CommandHandler
		});
	}

	exec(message: Message, command: DiceCommand, args: Record<string, unknown>): void {
		const logger = baseLogger.scope('commands', command.id);

		logger.command({
			prefix: `${message.author.tag} (${message.author.id})`,
			// Use inspect with a depth of `0` here to avoid a giant object of args (ex. every property in a Command class from the reload command)
			message: Object.keys(args).length === 0 ? undefined : inspect(args, {depth: 0})
		});
	}
}
