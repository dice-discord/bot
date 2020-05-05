import * as QuickLRU from 'quick-lru';
import {Guild, PrismaClient} from '@prisma/client';
import {Guild as DiscordGuild, GuildResolvable, Snowflake} from 'discord.js';

type CachedGuild = Pick<Guild, 'prefix'>;

/**
 * A read-only cache for guild settings.
 * Primarily used for quickly retrieving custom prefixes.
 */
export class GuildSettingsCache {
	private readonly prisma: PrismaClient;
	private readonly _cache: QuickLRU<Snowflake, CachedGuild>;

	constructor(prisma: PrismaClient, maxSize = 1000) {
		this._cache = new QuickLRU({maxSize});
		this.prisma = prisma;
	}

	static getGuildID(resolvable: GuildResolvable): Snowflake {
		if (typeof resolvable === 'string') {
			// Resolvable is a guild ID
			return resolvable;
		}

		if (resolvable instanceof DiscordGuild) {
			// Resolvable is a guild
			return resolvable.id;
		}

		if (resolvable.guild) {
			// Resolvable is something that is present in a guild (role, channel, or member)
			return resolvable.guild.id;
		}

		throw new RangeError('No guild could be resolved from the provided resolvable');
	}

	/**
	 * Retrieve settings for a guild.
	 * @param guild The Discord guild to retrieve
	 *
	 * @returns The retrieved guild, if it exists
	 */
	async get(guild: GuildResolvable): Promise<CachedGuild | undefined> {
		const id = GuildSettingsCache.getGuildID(guild);

		if (this._cache.has(id)) {
			return this._cache.get(id);
		}

		return this.cache(id);
	}

	/**
	 * Add a guild from the database to the cache.
	 * @param guild The Discord guild to cache
	 *
	 * @return The retrieved guild, if it exists
	 */
	async cache(guild: GuildResolvable): Promise<CachedGuild | undefined> {
		const id = GuildSettingsCache.getGuildID(guild);

		const fetchedGuild = await this.prisma.guild.findOne({where: {id}, select: {prefix: true}});

		if (fetchedGuild) {
			this._cache.set(id, fetchedGuild);
			return fetchedGuild;
		}
	}

	async refresh(guild: GuildResolvable): Promise<CachedGuild | undefined> {
		const id = GuildSettingsCache.getGuildID(guild);

		// Delete the old item
		this._cache.delete(id);

		// Update the item
		return this.cache(id);
	}
}
