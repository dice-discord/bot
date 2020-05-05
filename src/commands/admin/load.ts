import {AkairoHandler} from 'discord-akairo';
import {code, codeblock} from 'discord-md-tags';
import {Message} from 'discord.js';
import {join} from 'path';
import {runningInProduction} from '../../config';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {startTimer} from '../../util/timer';
import ms = require('pretty-ms');

type ModuleType = 'commands' | 'inhibitors' | 'listeners';

export default class LoadCommand extends DiceCommand {
	constructor() {
		super('load', {
			aliases: [
				'load-module',
				'load-command',
				'load-listener',
				'load-inhibitor',
				'register-module',
				'register-command',
				'register-listener',
				'register-inhibitor'
			],
			description: {content: 'Load a module (command, listener, or inhibitor).', usage: '<module> [type=<type>]', examples: ['ping', 'blacklist']},
			category: DiceCommandCategories.Admin,
			ownerOnly: true,
			args: [
				{
					id: 'module',
					type: AkairoArgumentType.String,
					match: 'rest',
					prompt: {start: 'What module do you want to load?'}
				},
				{
					id: 'type',
					type: [
						['commands', 'command', 'c', 'cmd'],
						['inhibitors', 'inhibitor', 'i'],
						['listeners', 'listener', 'l']
					],
					flag: ['type='],
					default: 'commands',
					match: 'option',
					prompt: {optional: true, start: 'What type of module do you want to load?', ended: 'Invalid type selected'}
				}
			]
		});
	}

	public async exec(message: Message, args: {module: string; type: ModuleType}): Promise<Message | undefined> {
		const handlers: Record<ModuleType, AkairoHandler> = {
			commands: this.handler,
			listeners: this.client.listenerHandler,
			inhibitors: this.client.inhibitorHandler
		};

		const type = args.type.slice(0, -1);

		const path = `${join(__dirname, '..', '..', args.type, args.module)}.${runningInProduction ? 'j' : 't'}s`;

		try {
			const endTimer = startTimer();

			const loaded = handlers[args.type].load(path);

			return await message.util?.send(`Loaded ${code`${loaded.id}`} in ${ms(endTimer())}`);
		} catch (error) {
			// eslint-disable-next-line no-return-await
			return await message.util?.send([`Failed to load ${type}`, 'Error:', codeblock`${error}`].join('\n'));
		}
	}
}
