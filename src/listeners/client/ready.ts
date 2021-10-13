import {captureException} from '@sentry/node';
import assert from 'assert';
import {code} from 'discord-md-tags';
import {MessageEmbed, WebhookClient} from 'discord.js';
import * as pkg from '../../../package.json';
import {readyWebhook, runningInCI, runningInProduction} from '../../config';
import {ExitCodes} from '../../constants';
import {baseLogger} from '../../logging/logger';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {Indexes, IndexNames} from '../../util/meili-search';

const embed = new MessageEmbed({
	title: 'Ready',
	fields: [
		{
			name: 'Version',
			value: code`${pkg.version}`
		}
	]
});

export default class ReadyListener extends DiceListener {
	logger: typeof baseLogger;
	private scopedWithClusterID = false;

	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: DiceListenerCategories.Client
		});

		this.logger = baseLogger.scope('client');
	}

	async exec(): Promise<void> {
		assert(this.client.user);

		if (!this.scopedWithClusterID && this.client.shard?.id !== undefined) {
			this.logger = baseLogger.scope('client', `cluster ${this.client.shard.id}`);
			this.scopedWithClusterID = true;
		}

		// eslint-disable-next-line promise/prefer-await-to-then
		this.client.influxUtil?.recordDiscordStats().catch(error => {
			this.logger.error('Failed to report InfluxDB Discord stats', error);
		});

		if (!runningInCI) {
			const index = await this.client.meiliSearch.getOrCreateIndex<Indexes[IndexNames.Users]>(IndexNames.Users);
			const users = [...this.client.users.cache.values()];

			const documents = users.map(user => ({id: user.id, tag: user.tag}));
			await index.addDocumentsInBatches(documents, 500);
		}

		if (runningInProduction && this.client.shard?.id === 0) {
			if (readyWebhook.id !== undefined && readyWebhook.token !== undefined) {
				const webhookClient = new WebhookClient(readyWebhook.id, readyWebhook.token);

				embed.setTimestamp(this.client.readyAt ?? new Date());

				// eslint-disable-next-line promise/prefer-await-to-then
				webhookClient.send(embed).catch(error => {
					this.logger.error('An error occurred while sending the ready webhook', error);
					return captureException(error);
				});
			} else {
				this.logger.warn('Running in production, but the ready webhook credentials are invalid');

				if (readyWebhook.id === undefined && readyWebhook.token === undefined) {
					this.logger.warn('Ready webhook ID and token not provided');
				} else if (readyWebhook.id === undefined) {
					this.logger.warn('Ready webhook ID not provided');
				} else if (readyWebhook.token === undefined) {
					this.logger.warn('Ready webhook token not provided');
				}
			}
		}

		this.logger.start('Ready');

		if (runningInCI) {
			this.logger.complete('CI environment detected, gracefully exiting as part of test');
			this.logger.info('This behavior is triggered because the `CI` environment variable was defined');
			// eslint-disable-next-line unicorn/no-process-exit
			return process.exit(ExitCodes.Success);
		}
	}
}
