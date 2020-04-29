import {Message, Util} from 'discord.js';
import {DiceCommand, DiceCommandCategories, ArgumentType} from '../../structures/DiceCommand';

export default class SpoilerCommand extends DiceCommand {
	constructor() {
		super('spoiler', {
			aliases: ['spoilerify'],
			description: {content: 'Make every character in a text a ||spoiler||.'},
			category: DiceCommandCategories.Fun,
			args: [
				{
					id: 'content',
					match: 'content',
					type: ArgumentType.String,
					prompt: {start: 'What do you want to turn into a spoiler?'}
				}
			]
		});
	}

	async exec(message: Message, {content}: {content: string}): Promise<Message | undefined> {
		return message.util?.send(
			Util.cleanContent(
				Util.escapeSpoiler(content)
					.split('')
					.map(char => `||${char}||`)
					.join(''),
				message
			)
		);
	}
}
