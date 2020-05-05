import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class AverageCommand extends DiceCommand {
	constructor() {
		super('average', {
			aliases: ['average-numbers', 'avg-numbers', 'avg', 'mean'],
			description: {content: 'Get the mean of a set of numbers.'},
			category: DiceCommandCategories.Util,
			args: [
				{
					id: 'numbers',
					match: 'separate',
					type: AkairoArgumentType.Number,
					prompt: {start: 'What numbers should be averaged?', retry: 'Invalid numbers provided, please try again'}
				}
			]
		});
	}

	async exec(message: Message, {numbers}: {numbers: number[]}): Promise<Message | undefined> {
		if (numbers.length > 0) {
			return message.util?.send((numbers.reduce((a, b) => a + b) / numbers.length).toLocaleString());
		}
	}
}
