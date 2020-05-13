import {addBreadcrumb, captureException, configureScope, setContext, Severity} from '@sentry/node';
import {code} from 'discord-md-tags';
import {Message} from 'discord.js';
import {DiceCommand} from '../../structures/DiceCommand';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {baseLogger} from '../../logging/logger';

export default class ErrorListener extends DiceListener {
	logger: typeof baseLogger = baseLogger.scope('commands');

	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: DiceListenerCategories.CommandHandler
		});
	}

	exec(error: Error, message: Message, command?: DiceCommand): Promise<Message> | undefined {
		if (command) {
			this.logger = command.logger;
		}

		configureScope(scope => {
			scope.setUser({id: message.author.id, username: message.author.tag});
		});

		addBreadcrumb({
			message: 'command.error',
			category: command?.category.id ?? 'inhibitor',
			level: Severity.Error,
			data: {
				guild: message.guild
					? {
							id: message.guild.id,
							name: message.guild.name
					  }
					: null,
				command: command
					? {
							id: command.id,
							aliases: command.aliases,
							category: command.category.id
					  }
					: null,
				message: {
					id: message.id,
					content: message.content
				}
			}
		});
		if (command) {
			setContext('command.start', {
				extra: {
					guild: message.guild
						? {
								id: message.guild.id,
								name: message.guild.name
						  }
						: null,
					command: {
						id: command.id,
						aliases: command.aliases,
						category: command.category.id
					},
					message: {
						id: message.id,
						content: message.content
					}
				}
			});
		}

		const exceptionID = captureException(error);

		this.logger.error('Error while running command:', error);

		if (message.channel.type === 'dm' || message.guild?.me?.permissionsIn(message.channel).has('SEND_MESSAGES')) {
			// Send the message if we have permissions
			return message.util?.send(
				[
					'An unexpected error occurred while running this command',
					'An error report about this incident was recorded',
					`To report this to a developer give them the code ${code`${message.id}-${exceptionID}`}`
				].join('\n')
			);
		}
	}
}
