import {Guild} from 'discord.js';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';

export default class GuildDeleteListener extends DiceListener {
	constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete',
			category: DiceListenerCategories.Client
		});
	}

	/**
	 * @param _guild The guild that was deleted
	 */
	async exec(_guild: Guild): Promise<void | undefined> {
		return this.client.influxUtil?.recordDiscordStats();
	}
}
