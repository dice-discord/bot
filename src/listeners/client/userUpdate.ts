import {User} from 'discord.js';
import {DiceListener, DiceListenerCategories} from '../../structures/DiceListener';
import {Indexes, IndexNames} from '../../util/meili-search';

export default class UserUpdateListener extends DiceListener {
	public constructor() {
		super('userUpdate', {
			emitter: 'client',
			event: 'userUpdate',
			category: DiceListenerCategories.Client
		});
	}

	public async exec(oldUser: User, newUser: User): Promise<void> {
		const index = this.client.meiliSearch.index<Indexes[IndexNames.Users]>(IndexNames.Users);

		await index.addDocuments([{id: newUser.id, tag: newUser.tag}]);
	}
}
