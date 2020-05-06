import {start as startDebugAgent} from '@google-cloud/debug-agent';
import {start as startProfiler} from '@google-cloud/profiler';
import {captureException} from '@sentry/node';
import {BaseCluster, ShardingManager} from 'kurasuta';
import pkg from '../../package.json';
import {discordToken, googleAppCredentials} from '../config';
import {baseLogger} from '../util/logger';
import {DiceClient} from './DiceClient';

export class DiceCluster extends BaseCluster {
	// Client is defined in BaseCluster constructor
	public client!: DiceClient;
	logger: typeof baseLogger;

	constructor(...args: [ShardingManager]) {
		super(...args);

		this.logger = baseLogger.scope('cluster', this.id.toString());
		this.client.cluster = this;
	}

	async launch(): Promise<void> {
		if (googleAppCredentials) {
			const serviceContext = {version: pkg.version, service: 'cluster'};

			try {
				await startProfiler({
					serviceContext
				});
			} catch (error) {
				this.logger.error('Failed to initialize Google Cloud Profiler', error);
				captureException(error);
			}

			this.logger.success('Started Google Cloud Profiler');

			try {
				startDebugAgent({
					projectId: googleProjectId,
					serviceContext
				});
			} catch (error) {
				this.logger.error('Failed to initialize Google Cloud Debug Agent', error);
				captureException(error);
			}

			this.logger.success('Started Google Cloud Debug Agent');
		}

		this.client.init().catch(error => {
			this.logger.fatal('Failed to initialize client', error);
			throw error;
		});

		this.client.login(discordToken).catch(error => {
			this.logger.fatal('Failed to login client', error);
			throw error;
		});
	}
}

// Must provide a default export for Kurasuta
export default DiceCluster;
