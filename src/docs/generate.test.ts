import {Category} from 'discord-akairo';
import {DiceCommand} from '../structures/DiceCommand';
import {generateDocs} from './generate';

const categories: Category<string, Category<string, DiceCommand>> = new Category('cat id');

const commands: Category<string, DiceCommand> = new Category('cmd id');

categories.set('category', commands);

// @ts-ignore
commands.set('id', {
	id: 'id',
	categoryID: 'category',
	description: {
		content: 'description.content',
		examples: ['', 'description.examples[1]'],
		usage: 'description.usage'
	}
} as DiceCommand);

const commandHandler = {categories};

test('generateDocs', () => {
	// @ts-ignore
	const docs = generateDocs(commandHandler);

	const category = docs.get('category');

	expect(category).toBeDefined();

	const command = category!.get('id');
	expect(command).toBeDefined();

	expect(command!).toEqual(
		[
			`title: Id`,
			`description: description.content`,
			`path: tree/master/src/commands/category`,
			'source: id.ts',
			'',
			'# Id',
			'',
			'## Description',
			'',
			'description.content',
			'',
			'## Usage',
			'',
			'### Format',
			'',
			'`id description.usage`',
			'',
			'### Examples',
			'',
			'- `id`',
			'- `id description.examples[1]`'
		].join('\n')
	);
});
