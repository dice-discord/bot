import got from 'got';

/** Base URL to use for the API. */
const baseURL = 'https://playerdb.co/api/player';

/**
 * A base interface for a response from PlayerDB.
 */
interface BasePlayerDBResponse {
	code: string;
	message: string;
}

/**
 * A failed response from PlayerDB.
 */
interface FailedPlayerDBResponse extends BasePlayerDBResponse {
	error: true;
	data: Record<string, unknown>;
}

/**
 * A successful response from PlayerDB.
 */
interface SuccessfulPlayerDBResponse extends BasePlayerDBResponse {
	code: 'player.found';
	success: true;
	data: Record<string, unknown>;
}

/**
 * A response from PlayerDB.
 */
type PlayerDBResponse = FailedPlayerDBResponse | SuccessfulPlayerDBResponse;

/**
 * Check if a response from player DB was successful.
 * @param response Response to check
 */
function playerDBResponseWasSuccessful(response: PlayerDBResponse): response is SuccessfulPlayerDBResponse {
	return Object.prototype.hasOwnProperty.call(response, 'success');
}

/**
 * A username that the user had at one point in the past.
 */
interface HistoricUsername {
	/** The username. */
	name: string;
	/** The timestamp of when this name was changed to. */
	changeToAt?: number;
}

interface SuccessfulMinecraftResponse extends SuccessfulPlayerDBResponse {
	code: 'player.found';
	data: {
		player: {
			// eslint-disable-next-line camelcase
			meta: {name_history: HistoricUsername[]};
			username: string;
			/** @example '8f54a6f1-9b02-45e5-b210-205dafc80fe4' */
			id: string;
			/** @example '8f54a6f19b0245e5b210205dafc80fe4' */
			// eslint-disable-next-line camelcase
			raw_id: string;
			avatar: string;
		};
	};
}

interface FailedMinecraftResponse extends FailedPlayerDBResponse {
	code: 'minecraft.api_failure';
}

type MinecraftResponse = SuccessfulMinecraftResponse | FailedMinecraftResponse;

/**
 * A Minecraft account.
 */
export interface MinecraftAccount {
	id: string;
	username: string;
}

/**
 * Resolve a Minecraft account from a username or user ID
 * @param account The Minecraft account that was resolved
 */
export async function fetchMinecraftAccount(account: string): Promise<MinecraftAccount> {
	const response = await got<MinecraftResponse>(`${baseURL}/minecraft/${encodeURIComponent(account)}`, {responseType: 'json'});

	if (playerDBResponseWasSuccessful(response.body)) {
		const {id, username} = response.body.data.player;
		return {id, username};
	}

	throw new Error(`No account could be found for ${account}`);
}
