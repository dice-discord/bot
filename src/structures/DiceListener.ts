import {Listener, ListenerOptions} from 'discord-akairo';
import {DiceClient} from './DiceClient';

export const enum DiceListenerCategories {
	Client = 'client',
	CommandHandler = 'commandHandler',
	Prisma = 'prisma'
}

interface DiceListenerOptions extends ListenerOptions {
	category: DiceListenerCategories;
}

export class DiceListener extends Listener {
	client!: DiceClient;

	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(id: string, options: DiceListenerOptions) {
		super(id, options);
	}
}
