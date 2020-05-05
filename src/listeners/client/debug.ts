import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {baseLogger} from '../../util/logger';

export default class DebugListener extends DiceListener {
	logger: typeof baseLogger;
	private scopedWithClusterID = false;

	constructor() {
		super('debug', {
			emitter: 'client',
			event: 'debug',
			category: DiceListenerCategories.Client
		});

		this.logger = baseLogger.scope('discord.js');
	}

	/**
	 * @param info The debug information
	 */
	exec(info: string): void {
		if (!this.scopedWithClusterID && this.client?.shard?.id !== undefined) {
			this.logger = this.logger.scope('discord.js', `cluster ${this.client.shard.id}`);
			this.scopedWithClusterID = true;
		}

		return this.logger.debug(info);
	}
}
