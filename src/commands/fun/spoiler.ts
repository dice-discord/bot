import {Message, Util} from 'discord.js';
import {DiceCommand, DiceCommandCategories, ArgumentType} from '../../structures/DiceCommand';

export default class SpoilerCommand extends DiceCommand {
	constructor() {
		super('spoiler', {
			aliases: ['spoilerify'],
			description: {
				content: 'Make every character in a text a ||spoiler||.',
				examples: ['hello', 'hello --codeblock', 'hello -c', 'hello'],
				usage: '<content> [--codeblock]'
			},
			category: DiceCommandCategories.Fun,
			args: [
				{
					id: 'content',
					match: 'rest',
					type: ArgumentType.String,
					prompt: {start: 'What do you want to turn into a spoiler?'}
				},
				{
					id: 'codeblock',
					match: 'flag',
					flag: ['--codeblock', '-c']
				}
			]
		});
	}

	async exec(message: Message, {content, codeblock}: {content: string; codeblock: boolean}): Promise<Message | undefined> {
		return message.util?.send(
			Util.cleanContent(
				Util.escapeSpoiler(content)
					.split('')
					.map(char => `||${char}||`)
					.join(''),
				message
			),
			{code: codeblock ? 'markdown' : false}
		);
	}
}
