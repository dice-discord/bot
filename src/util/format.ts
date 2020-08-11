import {Util, Message} from 'discord.js';

/**
 * Round a number to n digit sof precision after the decimal point.
 * @param value Value to format
 * @param precision Number of digits of precision after the decimal point
 */
export function simpleFormat(value: number, precision = 2): number {
	return Number.parseFloat(value.toFixed(precision));
}

/**
 * Capitalizes the first letter of a string
 * @param text Text to capitalize
 */
export function capitalizeFirstCharacter(text: string): string {
	return text.replace(new RegExp(`^${text[0]}`), firstCharacter => firstCharacter.toUpperCase());
}

/**
 * Truncate a string if it exceeds a maximum length
 * @param string The string to truncate
 * @param maxLength Maximum length
 * @returns The string, truncated to the `maxLength` if necessary
 */
export function truncateText(string: string, maxLength = 2048): string {
	return string.length > maxLength ? `${string.slice(0, Math.max(0, maxLength - 1))}…` : string;
}

/**
 * Removes any Discord Markdown or mentions to make a string safe for display.
 * @param string String to clean
 * @param message The message to provide context for cleaning
 * @returns The cleaned string
 */
export function clean(string: string, message: Message): string {
	return Util.cleanContent(Util.escapeMarkdown(string), message);
}

export type Table = string[][];

/**
 * Get the lengths of each column in a table.
 * Can include a header.
 *
 * @param table The table to use for calculations
 * @returns An array of lengths
 */
export function maxColumnLength(table: Table): number[] {
	const lengths = table[0].map(column => column.length);

	table.forEach(row =>
		lengths.forEach((length, index) => {
			if (length < row[index].length) {
				lengths[index] = row[index].length;
			}
		})
	);

	return lengths;
}

/**
 * Format a table into a string of equally sized columns.
 * @param table Table to format
 * @returns A formatted string representation of the table
 */
export function formatTable(table: Table, delimiter = ' '): string {
	const maxLengths = maxColumnLength(table);

	return table.map(row => row.map((column, index) => column.padEnd(maxLengths[index])).join(delimiter)).join('\n');
}
