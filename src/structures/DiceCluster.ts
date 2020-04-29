import {BaseCluster, ShardingManager} from 'kurasuta';
import {discordToken} from '../config';
import {DiceClient} from './DiceClient';
import {baseLogger} from '../util/logger';

export class DiceCluster extends BaseCluster {
	// Client is defined in BaseCluster constructor
	public client!: DiceClient;
	logger: typeof baseLogger;

	constructor(...args: [ShardingManager]) {
		super(...args);

		this.logger = baseLogger.scope('cluster', this.id.toString());
	}

	launch(): void {
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
