import {PrismaClient} from '@prisma/client';
import {Snowflake, UserResolvable} from 'discord.js';
import {DiceClient} from './DiceClient';
import {defaults} from '../constants';

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

	/**
	 * Increment this user's balance.
	 * If they do not have an entry in the database their initial balance will be determined using the default balance.
	 * @param amount The amount to increment the balance by. This number can be negative.
	 * @returns This user's updated balance
	 */
	async incrementBalance(amount: number): Promise<number> {
		const currentBalance = await this.getBalance();

		const updatedUser = await this.prisma.user.upsert({
			where: {id: this.id},
			create: {id: this.id, balance: currentBalance + amount},
			update: {balance: currentBalance + amount},
			select: {balance: true}
		});

		return updatedUser.balance;
	}
}
