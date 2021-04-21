// eslint-disable-next-line import/no-unassigned-import
import 'sqreen';
import {BaseCluster, ShardingManager} from 'kurasuta';
import {discordToken} from '../config';
import {baseLogger} from '../logging/logger';
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
		// eslint-disable-next-line promise/prefer-await-to-then
		this.client.init().catch(error => {
			this.logger.fatal('Failed to initialize client', error);
			throw error;
		});

		// eslint-disable-next-line promise/prefer-await-to-then
		this.client.login(discordToken).catch(error => {
			this.logger.fatal('Failed to login client', error);
			throw error;
		});
	}
}

// Must provide a default export for Kurasuta
export default DiceCluster;
