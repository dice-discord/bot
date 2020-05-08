import {LogEvent} from '@prisma/client';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {baseLogger} from '../../util/logger';

export default class InfoListener extends DiceListener {
	logger: typeof baseLogger = baseLogger.scope('prisma');

	constructor() {
		super('info', {
			emitter: 'prisma',
			event: 'info',
			category: DiceListenerCategories.Prisma
		});
	}

	exec(event: LogEvent): void {
		return this.logger.info(event);
	}
}
