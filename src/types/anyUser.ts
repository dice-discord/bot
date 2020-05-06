import {Message, User} from 'discord.js';
import {DiceClient} from '../structures/DiceClient';
import {AkairoArgumentType} from '../structures/DiceCommand';

/** The name of this type in Akairo. */
export const typeName = 'anyUser';

type UserTypeResolver = (message: Message, phrase: string) => User | undefined;

/**
 * Finds any user on Discord, first by resolving them from a cache and then by fetching them from Discord.
 * @param message The message to use as context
 * @param phrase The phrase to be used to resolve a user
 * @returns The resolved user, if found
 */
export async function resolver(message: Message, phrase: string | null): Promise<User | null> {
	if (phrase === null) {
		return null;
	}

	const client = message.client as DiceClient;
	const userTypeResolver: UserTypeResolver = client.commandHandler.resolver.type(AkairoArgumentType.User);

	const resolved = userTypeResolver(message, phrase);

	if (resolved) {
		return resolved;
	}

	let fetched: User | null = null;

	try {
		fetched = await client.users.fetch(phrase);
	} catch (_) {}

	return fetched ?? resolved ?? null;
}
