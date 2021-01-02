import {Client, Snowflake} from 'discord.js';
import {EventEmitter} from 'events';
import {IncomingMessage, ServerResponse} from 'http';
import {json, send, Server, serve} from 'micri';
import {baseLogger} from '../logging/logger';
import {topGGWebhookPassword} from '../config';

type EventType = 'upvote' | 'test';

const eventTypes = new Set<EventType>(['test', 'upvote']);

/**
 * The format of the data your webhook URL will receive in a POST request.
 */
interface TopGGVoteWebhook {
	/** ID of the bot that received a vote. */
	bot: Snowflake;
	/** ID of the user who voted. */
	user: Snowflake;
	/** The type of the vote (should always be `upvote` except when using the test button it's `test`). */
	type: EventType;
	/** Whether the weekend multiplier is in effect, meaning users votes count as two. */
	isWeekend: boolean;
	/**
	 * Query string params found on the `/bot/:ID/vote` page.
	 * @example '?a=1&b=2'
	 */
	query?: string;
}

interface Config {
	/** Client to use. */
	client: Client;
}

export interface TopGGVote {
	/** ID of the user who voted */
	user: Snowflake;
	/** Whether the weekend multiplier is in effect, meaning users votes count as two */
	weekend: boolean;
}

/**
 * Handle top.gg webhook events for when users upvote the bot.
 */
export class TopGGVoteWebhookHandler extends EventEmitter {
	public server: Server;
	private readonly _config: Config;
	private readonly logger = baseLogger.scope('top.gg vote webhook handler');

	constructor(config: Config) {
		super();
		this._config = config;

		if (!this._config.client.user) {
			this.logger.warn('Client object that was provided to config does not have a `user` property');
		}

		this.server = serve(async (request: IncomingMessage, response: ServerResponse) => this.handle(request, response));
	}

	public on(event: 'vote', listener: (data: TopGGVote) => any): this;
	public on(event: any, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	/** Handle a request. */
	async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
		if (!this._config.client.user) {
			throw new TypeError('Client object that was provided to config does not have a `user` property');
		}

		/** Response status code to use. */
		let statusCode = 202;

		/** Request body. */
		const body: TopGGVoteWebhook = await json(request);

		if (request.headers.authorization === topGGWebhookPassword) {
			if (eventTypes.has(body.type)) {
				if (body.bot === this._config.client.user?.id) {
					const data: TopGGVote = {
						user: body.user,
						weekend: body.isWeekend
					};

					if (body.type === 'upvote') {
						this.emit('vote', data);
					} else {
						statusCode = 204;
						this.logger.debug('Test vote event from top.gg received:', data);
					}
				} else {
					this.logger.warn(`Vote event for a different bot was received, has the webhook URL been leaked? Got ${body.bot}`);
					statusCode = 422;
				}
			} else {
				this.logger.warn(`Unknown webhook event type of ${body.type} was received`);
				statusCode = 422;
			}
		} else {
			statusCode = 403;
		}

		send(response, statusCode);
	}
}
