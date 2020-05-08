import {LogEvent} from '@prisma/client';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {baseLogger} from '../../util/logger';

export default class WarnListener extends DiceListener {
	logger: typeof baseLogger = baseLogger.scope('prisma');

	constructor() {
		super('warn', {
			emitter: 'prisma',
			event: 'warn',
			category: DiceListenerCategories.Prisma
		});
	}

	exec(event: LogEvent): void {
		return this.logger.warn(event);
	}
}
