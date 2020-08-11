import {Message} from 'discord.js';
import {fetchMinecraftAccount, MinecraftAccount} from '../util/player-db';

/** The name of this type in Akairo. */
export const typeName = 'minecraftUser';

/**
 * Resolves a phrase to a Minecraft user.
 * @param message The message to use as context
 * @param phrase The phrase to be used to resolve a user
 * @returns The resolved user, if found
 */
export async function resolver(message: Message, phrase: string | null): Promise<MinecraftAccount | null> {
	if (phrase === null) {
		return null;
	}

	let account: MinecraftAccount | null = null;

	try {
		account = await fetchMinecraftAccount(phrase);
	} catch {}

	return account;
}
