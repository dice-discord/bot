import {CommandHandler, Category} from 'discord-akairo';
import {Collection} from 'discord.js';
import {DiceCommand} from '../structures/DiceCommand';
import {capitalizeFirstCharacter} from '../util/format';
import {code} from 'discord-md-tags';

/**
 * Generate documentation for all commands in a command handler, organized by category.
 * @param commandHandler Command handler to generate docs for
 *
 */
export function generateDocs(commandHandler: CommandHandler): Collection<string, Collection<string, string>> {
	// The reason we do this weird business of creating a new `Collection` instead of `Collection#mapValues` is because we are working with Akairo `Category`s, which have an `id` property that leaks into our docs
	const docs: Collection<string, Collection<string, string>> = new Collection();

	commandHandler.categories.forEach((category, id) => docs.set(id, generateDocsForCategory(category as Category<string, DiceCommand>)));

	return docs;
}

/**
 * Generate docs for all commands in a category.
 * @param category Category to generate docs for
 * @returns A collection keyed by command ID, the value is the documentation for the respective command
 */
export function generateDocsForCategory(category: Category<string, DiceCommand>): Collection<string, string> {
	const docs = new Collection<string, string>();

	category.forEach((command, id) => docs.set(id, generateDocsForCommand(command)));

	return docs;
}

/**
 * Generate documentation for a command.
 * @param command Command to generate docs for
 */
export function generateDocsForCommand(command: DiceCommand): string {
	return [
		`title: ${capitalizeFirstCharacter(command.id)}`,
		`description: ${command.description.content}`,
		`path: tree/master/src/commands/${command.categoryID}`,
		`source: ${command.id}.ts`,
		'',
		`# ${capitalizeFirstCharacter(command.id)}`,
		'',
		`## Description`,
		``,
		`${command.description.content}`,
		``,
		`## Usage`,
		``,
		`### Format`,
		``,
		command.description.usage.length === 0 ? code`${command.id}` : code`${command.id} ${command.description.usage}`,
		``,
		`### Examples`,
		``,
		command.description.examples.map(example => `- \`${command.id}${example.length === 0 ? '' : ` ${example}`}\``).join('\n')
	].join('\n');
}
