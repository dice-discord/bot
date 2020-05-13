import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {baseLogger} from '../../logging/logger';

export default class ErrorListener extends DiceListener {
	logger: typeof baseLogger;
	private scopedWithClusterID = false;

	constructor() {
		super('error', {
			emitter: 'client',
			event: 'error',
			category: DiceListenerCategories.Client
		});

		this.logger = baseLogger.scope('discord.js');
	}

	/**
	 * @param error The error encountered
	 */
	exec(error: Error): void {
		if (!this.scopedWithClusterID && this.client?.shard?.id !== undefined) {
			this.logger = this.logger.scope('discord.js', `cluster ${this.client.shard.id}`);
			this.scopedWithClusterID = true;
		}

		return this.logger.error(error);
	}
}
