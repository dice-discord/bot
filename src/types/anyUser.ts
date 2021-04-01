import {Message, User} from 'discord.js';
import {DiceClient} from '../structures/DiceClient';
import {Indexes, IndexNames} from '../util/meili-search';

/** The name of this type in Akairo. */
export const typeName = 'anyUser';

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
	const index = client.meiliSearch.index<Indexes[IndexNames.Users]>(IndexNames.Users);
	const {
		hits: [searched]
	} = await index.search(phrase, {limit: 1});

	let fetched: User | null = null;

	try {
		fetched = await client.users.fetch(phrase);
	} catch {}

	if (fetched) {
		return fetched;
	}

	if (searched) {
		try {
			fetched = await client.users.fetch(searched.id);
		} catch {}
	}

	return fetched ?? null;
}
