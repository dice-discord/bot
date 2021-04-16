import {capitalize} from '@jonahsnider/util';
import {formatDistance, formatRelative} from 'date-fns';
import {Message, User} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {typeName as anyUser} from '../../types/anyUser';

export default class AgeCommand extends DiceCommand {
	constructor() {
		super('age', {
			aliases: ['account-age', 'user-age', 'user-creation', 'account-creation'],
			category: DiceCommandCategories.Util,
			description: {
				content: 'See how old a user account is.',
				usage: '[user]',
				examples: ['', 'Dice', '@Dice', '388191157869477888']
			},
			args: [
				{
					id: 'user',
					match: 'content',
					type: anyUser,
					prompt: {optional: true, retry: 'Invalid user, please try again'}
				}
			]
		});
	}

	async exec(message: Message, {user}: {user?: User}): Promise<Message | undefined> {
		const {createdAt} = user ?? message.author;
		const now = message.editedAt ?? message.createdAt;

		return message.util?.send([`${capitalize(formatDistance(createdAt, now))} old`, `Created on ${formatRelative(createdAt, now)}`].join('\n'));
	}
}
