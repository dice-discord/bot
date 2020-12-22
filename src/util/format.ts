import {Message, Util} from 'discord.js';

/**
 * Removes any Discord Markdown or mentions to make a string safe for display.
 * @param string String to clean
 * @param message The message to provide context for cleaning
 * @returns The cleaned string
 */
export function clean(string: string, message: Message): string {
	return Util.cleanContent(Util.escapeMarkdown(string), message);
}
