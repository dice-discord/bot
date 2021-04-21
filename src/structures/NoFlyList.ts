import {CronJob} from 'cron';
import {Snowflake} from 'discord.js';
import got, {Headers} from 'got';
import {URLSearchParams} from 'url';
import {userAgent} from '../constants';

interface APINFLUser {
	discordId: string;
	reason: string;
	email: string | null;
	/** Date string. */
	dateBlacklisted: string;
}

export interface NFLUser {
	id: Snowflake;
}

export class NoFlyList {
	/** API URL. */
	public static apiURL = 'https://dice.jonah.pw/nfl';
	/** A cached blacklist of user IDs. */
	public cache = new Set<Snowflake>();
	/**
	 * A job to refresh the cache of blacklisted users
	 */
	private readonly refreshJob: CronJob;
	/** Headers to use in requests. */
	private readonly headers: Headers;

	constructor(apiToken: string) {
		this.headers = {'User-Agent': userAgent, Authorization: `Bearer ${apiToken}`};

		this.refreshJob = new CronJob('*/15 * * * *', async () => this.refresh());

		this.refreshJob.start();
		// eslint-disable-next-line promise/prefer-await-to-then
		this.refresh().catch(error => {
			throw error;
		});
	}

	destroy(): void {
		this.refreshJob.stop();
	}

	/**
	 * Fetch a user directly from the API, without using the local cache.
	 * @param user User to fetch
	 */
	async fetch(user: Snowflake): Promise<boolean> {
		const searchParameters = new URLSearchParams({fields: 'discordId'});

		try {
			const response = await got<Pick<APINFLUser, 'discordId'>>(`${NoFlyList.apiURL}/blacklist/${encodeURIComponent(user)}`, {
				headers: this.headers,
				searchParams: searchParameters
			});

			this.cache.add(response.body.discordId);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Refresh the cache with data from the API.
	 */
	private async refresh(): Promise<void> {
		const searchParameters = new URLSearchParams({fields: 'discordId'});
		const denyList = await got<Array<Pick<APINFLUser, 'discordId'>>>(`${NoFlyList.apiURL}/blacklist`, {
			headers: this.headers,
			searchParams: searchParameters,
			responseType: 'json'
		});
		this.cache = new Set(denyList.body.map(user => user.discordId));
	}
}
