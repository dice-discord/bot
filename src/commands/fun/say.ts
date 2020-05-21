import {captureException} from '@sentry/node';
import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class SayCommand extends DiceCommand {
	constructor() {
		super('say', {
			aliases: ['echo'],
			description: {content: 'Have the bot say a message.', examples: ['hello'], usage: '<content>'},
			category: DiceCommandCategories.Fun,
			ownerOnly: true,
			args: [
				{
					id: 'content',
					match: 'content',
					type: AkairoArgumentType.String,
					prompt: {start: 'What do you want me to say?'}
				}
			]
		});
	}

	async exec(message: Message, {content}: {content: string}): Promise<Message | undefined> {
		if (message.deletable) {
			message.delete().catch(error => {
				this.logger.error(`An error occurred while deleting the message ${message.id} that triggered this command`, error);
				return captureException(error);
			});
		}

		return message.util?.send(content);
	}
}
