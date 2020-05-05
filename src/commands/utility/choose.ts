import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class ChooseCommand extends DiceCommand {
	constructor() {
		super('choose', {
			aliases: ['pick', 'select'],
			description: {content: 'Choose an item from a list you provide.'},
			category: DiceCommandCategories.Util,
			args: [
				{
					id: 'items',
					match: 'separate',
					type: AkairoArgumentType.Lowercase,
					prompt: {start: 'What items should I choose from?'}
				}
			]
		});
	}

	async exec(message: Message, {items}: {items: string[]}): Promise<Message | undefined> {
		const randomNumber = Math.floor(Math.random() * items.length);

		return message.util?.send([`I pick #${randomNumber + 1}: "${clean(items[randomNumber], message)}"`]);
	}
}
