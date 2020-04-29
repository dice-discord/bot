import {Message} from 'discord.js';
import {ArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class ClapCommand extends DiceCommand {
	constructor() {
		super('clap', {
			aliases: ['clapify'],
			description: {content: 'Talk👏like👏this.'},
			category: DiceCommandCategories.Fun,
			args: [
				{
					id: 'content',
					match: 'content',
					type: ArgumentType.String,
					prompt: {start: 'What do you want to clapify?'}
				}
			]
		});
	}

	async exec(message: Message, {content}: {content: string}): Promise<Message | undefined> {
		return message.util?.send(clean(content.replace(/\s+/g, '👏'), message));
	}
}
