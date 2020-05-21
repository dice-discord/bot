import {CommandHandlerOptions} from 'discord-akairo';
import {join as joinPaths} from 'path';

/**
 * Determines whether or not a file path to a command should be loaded.
 * @param filePath File path to check
 * @returns `true` when the file should be loaded
 * @see https://discord-akairo.github.io/#/docs/main/master/typedef/LoadPredicate
 */
export function loadFilter(filePath: string): boolean {
	return !/\.test\.[jt]s$/.test(filePath);
}

export const options: CommandHandlerOptions = {
	directory: joinPaths(__dirname, '..', 'commands'),
	loadFilter,
	aliasReplacement: /-/g,
	handleEdits: true,
	commandUtil: true
};
