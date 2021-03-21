import {Flag, ArgumentOptions} from 'discord-akairo';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class SelfRoleCommand extends DiceCommand {
	public constructor() {
		super('self-role', {
			aliases: ['self-roles'],
			description: {
				content: 'Commands for selfroles on servers',
				usage: '<method> <…arguments>',
				examples: ['add Artists', 'delete Artists', 'get Artists', 'list', 'remove Artists']
			},
			category: DiceCommandCategories.Selfroles,
			channel: 'guild'
		});
	}

	public *args(): Generator<
		ArgumentOptions,
		Flag & {
			command: string;
			ignore: boolean;
			rest: string;
		},
		string
	> {
		const arg: ArgumentOptions = {
			type: [
				['add-self-role', 'add'],
				['delete-self-role', 'delete', 'del'],
				['get-self-role', 'get'],
				['list-self-roles', 'list', 'ls'],
				['remove-self-role', 'remove', 'rm']
			],
			default: 'list-self-roles',
			prompt: {optional: true, retry: 'Invalid subcommand provided, please try again'}
		};

		const method = yield arg;

		return Flag.continue(method);
	}
}
