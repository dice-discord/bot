import {Guild} from 'discord.js';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';

export default class GuildCreateListener extends DiceListener {
	constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate',
			category: DiceListenerCategories.Client
		});
	}

	/**
	 * @param guild The created guild
	 */
	async exec(guild: Guild): Promise<void | undefined> {
		return this.client.influxUtil?.recordDiscordStats();
	}
}
