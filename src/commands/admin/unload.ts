import {Stopwatch} from '@jonahsnider/util';
import {Argument, Command, Inhibitor, Listener} from 'discord-akairo';
import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {DiceListener} from '../../structures/DiceListener';
import ms = require('pretty-ms');

export default class UnloadCommand extends DiceCommand {
	constructor() {
		super('unload', {
			aliases: [
				'unload-module',
				'unload-command',
				'unload-listener',
				'unload-inhibitor',
				'remove-module',
				'remove-command',
				'remove-listener',
				'remove-inhibitor'
			],
			description: {content: 'Unload a module (command, listener, or inhibitor).', examples: ['help', 'clientError'], usage: '<module>'},
			category: DiceCommandCategories.Admin,
			ownerOnly: true,
			args: [
				{
					id: 'module',
					type: Argument.union(
						// Commands have their ID as an alias, so no need to add the command type in here
						AkairoArgumentType.CommandAlias,
						AkairoArgumentType.Listener,
						AkairoArgumentType.Inhibitor
					),
					match: 'content',
					prompt: {start: 'Which module do you want to unload?', retry: 'Invalid module provided, try again'}
				}
			]
		});
	}

	public async exec(message: Message, args: {module: DiceCommand | Inhibitor | DiceListener}): Promise<Message | undefined> {
		const stopwatch = new Stopwatch();

		stopwatch.start();
		const unloaded = args.module.remove();
		const elapsed = Number(stopwatch.end());

		let type = 'module';

		if (unloaded instanceof Command) {
			type = 'command';
		} else if (unloaded instanceof Listener) {
			type = 'listener';
		} else if (unloaded instanceof Inhibitor) {
			type = 'inhibitor';
		}

		return message.util?.send(`Unloaded ${type} \`${unloaded.categoryID}:${unloaded.id}\` in ${ms(elapsed)}`);
	}
}
