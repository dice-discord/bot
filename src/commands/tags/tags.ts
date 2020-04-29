import {Flag, ArgumentOptions} from 'discord-akairo';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class TagsCommand extends DiceCommand {
	public constructor() {
		super('tags', {
			description: {
				content: 'Commands for tags on servers',
				usage: '<method> <…arguments>',
				examples: ['add ip 127.0.0.1', 'delete ip', 'get ip', 'list']
			},
			category: DiceCommandCategories.Tags,
			channel: 'guild'
		});
	}

	public *args() {
		const arg: ArgumentOptions = {
			type: [
				['create-tag', 'create', 'new', 'add'],
				['delete-tag', 'delete', 'del', 'remove', 'rm'],
				['get-tag', 'get', 'view'],
				['list-tags', 'list', 'ls', 'all'],
				['edit-tag', 'edit', 'modify', 'change', 'update']
			],
			default: 'list-tags',
			prompt: {optional: true, retry: 'Invalid subcommand provided, please try again'}
		};

		const method = yield arg;

		return Flag.continue(method);
	}
}
