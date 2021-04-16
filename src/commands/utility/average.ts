import {mean} from '@jonahsnider/util';
import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class AverageCommand extends DiceCommand {
	constructor() {
		super('average', {
			aliases: ['average-numbers', 'avg-numbers', 'avg', 'mean'],
			description: {content: 'Get the mean of a set of numbers.', examples: ['192 168 1 1'], usage: '<...numbers>'},
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
			// eslint-disable-next-line unicorn/no-array-reduce, unicorn/no-array-callback-reference
			return message.util?.send(numbers.reduce(mean).toLocaleString());
		}
	}
}
