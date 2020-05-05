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
	} else {
		const client = <DiceClient>message.client;
		const userTypeResolver: UserTypeResolver = client.commandHandler.resolver.type(AkairoArgumentType.User);

		const resolved = userTypeResolver(message, phrase);

		if (resolved) {
			return resolved;
		}

		const fetched: User | null = await client.users.fetch(phrase);

		return fetched ?? resolved;
	}
}
