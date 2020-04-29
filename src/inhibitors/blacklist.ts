import {Message} from 'discord.js';
import {DiceInhibitor} from '../structures/DiceInhibitor';

export default class BlacklistInhibitor extends DiceInhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist'
		});
	}

	async exec({author: {id}}: Message): Promise<boolean> {
		if (this.client.isOwner(id)) {
			return false;
		}

		const user = await this.client.prisma.user.findOne({
			where: {id},
			select: {blacklistReason: true}
		});

		// We don't do a regular check here in case the blacklistReason is a falsy string (ex. '0', since that is a falsy value, but the user is still blacklisted)
		return typeof user?.blacklistReason === 'string';
	}
}
