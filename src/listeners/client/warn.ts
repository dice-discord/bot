import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {baseLogger} from '../../logging/logger';

export default class WarnListener extends DiceListener {
	logger: typeof baseLogger;
	private scopedWithClusterID = false;

	constructor() {
		super('warn', {
			emitter: 'client',
			event: 'warn',
			category: DiceListenerCategories.Client
		});

		this.logger = baseLogger.scope('discord.js');
	}

	/**
	 * @param info The warning
	 */
	exec(info: string): void {
		if (!this.scopedWithClusterID && this.client?.shard?.id !== undefined) {
			this.logger = this.logger.scope('discord.js', `cluster ${this.client.shard.id}`);
			this.scopedWithClusterID = true;
		}

		return this.logger.warn(info);
	}
}
