import {Message} from 'discord.js';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {Indexes, IndexNames} from '../../util/meili-search';

export default class MessageListener extends DiceListener {
	public constructor() {
		super('message', {
			emitter: 'client',
			event: 'message',
			category: DiceListenerCategories.Client
		});
	}

	public async exec(message: Message): Promise<void> {
		const index = this.client.meiliSearch.index<Indexes[IndexNames.Users]>(IndexNames.Users);

		await index.addDocuments([{id: message.author.id, tag: message.author.tag}]);
	}
}
