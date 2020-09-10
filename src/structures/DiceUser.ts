import {PrismaClient} from '@prisma/client';
import {Snowflake, UserResolvable} from 'discord.js';
import {defaults} from '../constants';
import {DiceClient} from './DiceClient';

/**
 * Provides helper functions for handling users in the database.
 */
export class DiceUser {
	private readonly id: Snowflake;
	private readonly prisma: PrismaClient;
	private readonly client: DiceClient;

	/**
	 * Provide a user resolvable for an instance.
	 * @param user The user resolvable
	 * @param client The client to use. If `undefined` the `user.client` property will be used
	 */
	constructor(user: UserResolvable, client?: DiceClient) {
		if (!client) {
			if (typeof user === 'string') {
				throw new TypeError('You must specify a client argument if you are providing a user snowflake');
			} else {
				client = user.client as DiceClient;
			}
		}

		const id = client.users.resolveID(user);

		if (id) {
			this.id = id;
			this.client = client;
			this.prisma = this.client.prisma;
		} else {
			throw new Error('No ID could be resolved from the provided user resolvable');
		}
	}

	/**
	 * Get the balance of this user.
	 * If the user does not have a balance in the database the default balance will be provided.
	 * @returns The balance of this user
	 */
	async getBalance(): Promise<number> {
		const user = await this.prisma.user.findOne({where: {id: this.id}, select: {balance: true}});

		return user?.balance ?? defaults.startingBalance[this.id === this.client.user?.id ? 'bot' : 'users'];
	}
}
